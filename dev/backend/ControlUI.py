from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase初期化
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("./Firebase_地域共生ID.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()
app = FastAPI(
    title="地域共生API",
    description="Firestoreと連携した地域情報API+ニュース管理API",
    version="1.1.0"
)

# ---- Pydanticモデル ----

class NearRegion(BaseModel):
    ID: str

class NewsIn(BaseModel):
    title: str
    text: str
    columns: str
    custom_id: Optional[str] = None

class NewsEdit(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    columns: Optional[str] = None

class NewsOut(BaseModel):
    id: str
    title: str
    text: str
    time: datetime
    columns: str

# ---- 地域ID一覧取得 ----
@app.get("/regions/view", summary="地域ID一覧の取得", response_model=List[str])
def list_region_ids():
    try:
        regions_ref = db.collection("Regions")
        docs = regions_ref.stream()
        result = [doc.id for doc in docs]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域一覧取得 ----
@app.get("/near_regions/view", summary="隣接地域一覧の取得")
def get_near_regions(region_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        docs = place_ref.stream()
        return [{"id": doc.id, "data": doc.to_dict()} for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域の追加 ----
@app.post("/near_regions/add", summary="隣接地域の追加")
def add_near_region(region_id: str, region: NearRegion):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        new_doc = place_ref.add(region.dict())[1]
        return {"message": "追加しました", "id": new_doc.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- 隣接地域の削除 ----
@app.delete("/near_regions/delete", summary="隣接地域の削除")
def delete_near_region(region_id: str, doc_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        place_ref.document(doc_id).delete()
        return {"message": "削除しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- ニュース追加 ----
@app.post("/regions/{region_id}/news", response_model=NewsOut, summary="ニュースの追加")
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
@app.put("/regions/{region_id}/news/{news_id}", response_model=NewsOut, summary="ニュースの編集")
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
@app.delete("/regions/{region_id}/news/{news_id}", summary="ニュースの削除")
def delete_news(region_id: str, news_id: str):
    news_ref = db.collection('Regions').document(region_id).collection('News').document(news_id)
    if not news_ref.get().exists:
        raise HTTPException(status_code=404, detail="News not found")
    news_ref.delete()
    return {"detail": "News deleted successfully."}

# ---- ニュース一覧取得（追加） ----
@app.get("/regions/{region_id}/news", response_model=List[NewsOut], summary="ニュース一覧の取得")
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
    

"""
Copyright (c) 2025 SaihaHatanaka
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""