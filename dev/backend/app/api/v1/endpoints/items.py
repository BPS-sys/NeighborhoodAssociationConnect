from services import MCP_Client
from fastapi import APIRouter
import asyncio
from fastapi import FastAPI, HTTPException, Body, Depends
from typing import List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import os
import dotenv
from contextlib import asynccontextmanager

from api.schema import *
import uuid

dotenv.load_dotenv()

mcp_client = MCP_Client.ChatAgent()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("startup event")
    await mcp_client.get_tools_from_mcp_server_qdrant()
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
async def Chat(chat_message: ChatMessage=Depends()):
    print(f"UserMessage: {chat_message.UserMessage}")
    print(type(chat_message.UserMessage))
    chat_response = await mcp_client.chat(query=chat_message.UserMessage, region_id=chat_message.RegionID)
    return chat_response


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
    news_data = {
        'Title': news.title,
        'Text': news.text,
        'Time': datetime.now(),
        'columns': news.columns
    }
    if news.custom_id:
        doc_ref = news_ref.document(news.custom_id)
        doc_ref.set(news_data)
        doc_id = news.custom_id
    else:
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
    update_data = {
        'Title': news.title or current_data.get('Title', ''),
        'Text': news.text or current_data.get('Text', ''),
        'Time': datetime.now(),
        'columns': news.columns or current_data.get('columns', '')
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
                "Senttime": d.get("SentTime", datetime.now())
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
            "SentTime": datetime.now()
        }
        new_doc = messages_ref.add(message_data)[1]
        return {"message": "メッセージを送信しました", "id": new_doc.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))