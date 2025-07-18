from services import MCP_Client
from fastapi import APIRouter
import asyncio
from fastapi import FastAPI, HTTPException, Body, Depends, Request
from fastapi.responses import JSONResponse
import io
from typing import List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
import dotenv
from contextlib import asynccontextmanager
from PIL import Image

from api.schema import *
import uuid

from tools.ocr.azure_vision_ocr import AzureVisionOCR
from services.create_article import Article

dotenv.load_dotenv()

mcp_client = MCP_Client.ChatAgent()
ocr_engine = AzureVisionOCR()
article = Article()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("startup event")
    await mcp_client.get_tools_from_mcp_server()
    yield
    print("shutdown event")

router = APIRouter(lifespan=lifespan)

def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(
                {
                    "type": os.getenv("FIREBASE_TYPE"),
                    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace(
                        "\\n", "\n"
                    ),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
                    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
                    "auth_provider_x509_cert_url": os.getenv(
                        "FIREBASE_AUTH_PROVIDER_X509_CERT_URL"
                    ),
                    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
                    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
                }
            )
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()


@router.post("/Chat")
async def Chat(chat_message: ChatMessage):
    chat_response = await mcp_client.chat(query=chat_message.UserMessage, region_id=chat_message.RegionID, region_name=chat_message.RegionName)
    return chat_response


@router.post("/new_add_reginions",summary = "自動生成IDで新しい地域を登録")
def add_new_region(name:str): #フロントエンドから、地域の名前を取得
    try:
        New_regions_ref = db.collection("Regions")
        # ドキュメントのデータを準備
        region_data = {'Name': name}
        # ドキュメントIDを自動生成して新しいドキュメントを追加
        new_doc_ref = New_regions_ref.add(region_data)[1]
        # 新しく追加されたドキュメントのIDを取得
        new_region_id = new_doc_ref.id
        return {
                "message": "新しい地域が正常に登録されました",
                "region_id": new_region_id, # 自動生成されたID
                "region_name": name
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"地域の登録に失敗しました: {str(e)}")

@router.get("/regions/view", summary="地域ID一覧の取得", response_model=List[str])
def list_region_ids():
    try:
        regions_ref = db.collection("Regions")
        docs = regions_ref.stream()
        result = [doc.id for doc in docs]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域一覧取得 ----
@router.get("/near_regions/view", summary="隣接地域一覧の取得")
def get_near_regions(region_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        docs = place_ref.stream()
        return [{"id": doc.id, "data": doc.to_dict()} for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域の追加 ----
@router.post("/near_regions/add", summary="隣接地域の追加")
def add_near_region(region_id: str, region: NearRegion):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        new_doc = place_ref.add(region.dict())[1]
        return {"message": "追加しました", "id": new_doc.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域の削除 ----
@router.delete("/near_regions/delete", summary="隣接地域の削除")
def delete_near_region(region_id: str, doc_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        place_ref.document(doc_id).delete()
        return {"message": "削除しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- ニュース追加 ----
@router.post("/regions/{region_id}/news", response_model=NewsOut, summary="ニュースの追加")
def add_news(region_id: str, news: NewsIn):
    news_ref = db.collection('Regions').document(region_id).collection('News')
    start_time_dt = None
    if news.start_time:
        start_time_dt = datetime.fromisoformat(news.start_time)
    news_data = {
        'Title': news.title,
        'Text': news.text,
        'Time': datetime.now(),
        'columns': news.columns,
        'StartTime': start_time_dt
    }
    doc_ref = news_ref.add(news_data)[1]
    doc_id = doc_ref.id
    return NewsOut(id=doc_id, title=news.title, text=news.text, time=news_data['Time'], columns=news.columns)

# ---- ニュース編集 ----
@router.put("/regions/{region_id}/news/{news_id}", response_model=NewsOut, summary="ニュースの編集")
def edit_news(region_id: str, news_id: str, news: NewsEdit):
    news_ref = db.collection('Regions').document(region_id).collection('News').document(news_id)
    doc = news_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="News not found")
    current_data = doc.to_dict()
    start_time_dt = None
    if news.start_time:
        start_time_dt = datetime.fromisoformat(news.start_time)
    update_data = {
        'Title': news.title or current_data.get('Title', ''),
        'Text': news.text or current_data.get('Text', ''),
        'Time': datetime.now(),
        'columns': news.columns or current_data.get('columns', ''),
        'StartTime': start_time_dt
    }
    news_ref.update(update_data)
    return NewsOut(id=news_id, title=update_data['Title'], text=update_data['Text'], time=update_data['Time'], columns=update_data['columns'])

# ---- ニュース削除 ----
@router.delete("/regions/{region_id}/news/{news_id}", summary="ニュースの削除")
def delete_news(region_id: str, news_id: str):
    news_ref = db.collection('Regions').document(region_id).collection('News').document(news_id)
    if not news_ref.get().exists:
        raise HTTPException(status_code=404, detail="News not found")
    news_ref.delete()
    return {"detail": "News deleted successfully."}

# ---- ニュース一覧取得（追加） ----
@router.get("/regions/{region_id}/news", response_model=List[NewsOut], summary="ニュース一覧の取得")
def list_news(region_id: str):
    try:
        news_ref = db.collection('Regions').document(region_id).collection('News')
        docs = news_ref.stream()
        result = []
        for doc in docs:
            d = doc.to_dict()
            result.append(NewsOut(
                id=doc.id,
                title=d.get('Title', ''),
                text=d.get('Text', ''),
                time=d.get('Time', datetime.now()),
                columns=d.get('columns', ''),
                starttime=d.get('StartTime')  # ← 追加
            ))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ---- ニュース一覧取得（隣接地域） ----
@router.get("/regions/{region_id}/news/near_regions", response_model=List[NewsOut], summary="隣接する地域のニュース")
def near_regions_news(region_id: str):
    try:
        #サブコレクション参照
        near_regions = db.collection("Regions").document(region_id).collection("near_regions")

        #ドキュメント取得
        id_docs = near_regions.stream()

        #IDリスト
        id_list = []

        #ニュース出力
        result = []

        #ドキュメント内のIDだけをリスト化
        for doc in id_docs:
            data = doc.to_dict()
            if "ID" in data:
                id_list.append(data["ID"])

        #リスト化したIDを使って隣接する地域のnewsを一括取得
        for id in id_list:
            news_ref = db.collection("Regions").document(id).collection('news')
            news_docs = news_ref.stream()
            for doc in news_docs:
                d = doc.to_dict()
                result.append(NewsOut(
                    id=doc.id,
                    title=d.get('Title', ''),
                    text=d.get('Text', ''),
                    time=d.get('Time', datetime.now()),
                    columns=d.get('columns', '')
                    ))
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/messages", summary="ユーザーメッセージの取得")
def get_user_messages(user_id: str):
    try:
        messages_ref = db.collection("Users").document(user_id).collection("Messages")
        docs = messages_ref.stream()
        result = []
        for doc in docs:
            d = doc.to_dict()
            result.append({
                "id": doc.id,
                "Title": d.get("Title", ""),
                "Text": d.get("Text", ""),
                "Senttime": d.get("SentTime", datetime.now()),
                "read": d.get("read", ""),
                "author": d.get("author", "")
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/users/post/messages", summary="ユーザーメッセージの送信")
def post_user_message(user_id: str, user_message: UserMessageIn):
    print(uuid.uuid4())
    try:
        messages_ref = db.collection("Users").document(user_id).collection("Messages")
        message_data = {
            "Title": user_message.title,
            "Text": user_message.text,
            "SentTime": datetime.now(),
            "read": False,
            "author": user_message.author,
        }
        new_doc = messages_ref.add(message_data)[1]
        return {"message": "メッセージを送信しました", "id": new_doc.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/regist/userid", summary="ユーザーIDを登録します。")
def regist_user_id(request: UserRegistRequest):
    db.collection("Users").document(request.user_id).set({
        "birthday_yyyymmdd": request.birthday,
        "name": request.name,
        "phone_number": request.phone_number,
        "RegionID": request.region_id,
        "address": request.address,
        "role": request.role,
    })
    return {"status": "success"}

@router.post("/regist/region", summary="町会を登録します。")
def regist_region(region_id: str, region_name: str):
    db.collection("Regions").document(region_id).set({
        "Name": region_name,
    })
    return 200
    
@router.get("/users/get/id", summary="ユーザーID一覧の取得")
def get_user_ids():
    try:
        users_ref = db.collection("Users")
        docs = users_ref.stream()
        user_ids = [doc.id for doc in docs]
        return {"user_ids": user_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.get("/regions/names", summary="すべての地域名を取得")
def get_region_names():
    try:
        regions_ref = db.collection("Regions")
        docs = regions_ref.stream()

        result = []
        for doc in docs:
            data = doc.to_dict()
            result.append({
                "id": doc.id,
                "name": data.get("Name", "")
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- ニュース一覧取得（隣接地域） ----
@router.get("/regions/{region_id}/news/near_regions", response_model=List[NewsOut], summary="隣接する地域のニュース")
def near_regions_news(region_id: str):
    try:
        #サブコレクション参照
        near_regions_ref = db.collection("Regions").document(region_id).collection("near_regions")

        #ドキュメント取得
        id_docs = near_regions_ref.stream()

        #IDリスト
        id_list = [doc.to_dict().get("ID") for doc in id_docs if doc.to_dict().get("ID")]

        #ニュース出力
        result = []

        #リスト化したIDを使って隣接する地域のnewsを一括取得
        for id in id_list:
            news_ref = db.collection("Regions").document(id).collection('News')
            news_docs = news_ref.stream()
            for doc in news_docs:
                d = doc.to_dict()
                result.append(NewsOut(
                    id=doc.id,
                    title=d.get('Title', ''),
                    text=d.get('Text', ''),
                    time=d.get('Time') or datetime.now(),
                    columns=d.get('columns', '')
                ))
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"隣接地域のニュース取得中にエラーが発生しました: {str(e)}")


#指定地域のユーザー一覧を取得
@router.get("/regions/{region_id}/users", summary="指定地域のユーザー一覧を取得")
def get_region_users(region_id: str):
    try:
        users_ref = db.collection("Users")
        query = users_ref.where("RegionID", "==", region_id)
        results = query.stream()

        users = []
        for doc in results:
            data = doc.to_dict()
            users.append({
                "id": doc.id,
                "name": data.get("name", "(名前なし)"),
            })

        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/info", summary="ユーザー情報を取得します。")
def get_user_infomation(user_id: str):
    try:
        user_info = db.collection("Users").document(user_id)
        doc = user_info.get()
        return doc.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/user/update/read", summary="メッセージを既読にします。")
def set_read(args: SetReadState):
    try:
        message_ref = db.collection("Users").document(args.user_id).collection("Messages").document(args.message_id)
        message_ref.update({"read": True})
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-binary-image")
async def upload_binary_image(request: Request):
    try:
        # バイナリから画像を読み込む
        body = await request.body()
        image = Image.open(io.BytesIO(body))
        if image.mode == "RGBA":
            image = image.convert("RGB")
        # OCR実行
        text = ocr_engine.image_to_text(image)
        print("OCR結果：", text)
        article_text = article.create(text)
        print("生成した記事：", article_text)
        return article_text

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCRに失敗しました: {e}")
    
@router.get("/regions/{region_id}/users/messages", summary="指定地域のユーザー全員のメッセージ既読状態を取得")
def get_region_users_messages(region_id: str):
    try:
        users_ref = db.collection("Users")
        query = users_ref.where("RegionID", "==", region_id)
        user_docs = query.stream()

        result = []

        for user_doc in user_docs:
            user_id = user_doc.id
            user_data = user_doc.to_dict()
            messages_ref = db.collection("Users").document(user_id).collection("Messages")
            message_docs = messages_ref.stream()

            messages = []
            for msg_doc in message_docs:
                msg_data = msg_doc.to_dict()
                messages.append({
                    "message_id": msg_doc.id,
                    "Title": msg_data.get("Title", ""),
                    "Text": msg_data.get("Text", ""),
                    "SentTime": msg_data.get("SentTime"),
                    "read": msg_data.get("read", False),
                    "author": msg_data.get("author", "")
                })

            result.append({
                "user_id": user_id,
                "user_name": user_data.get("name", ""),
                "messages": messages
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
