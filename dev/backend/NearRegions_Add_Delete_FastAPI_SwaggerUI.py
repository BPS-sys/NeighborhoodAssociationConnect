from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List

# FastAPIの自動生成されるSwaggerUIを使用する想定

# Firebase初期化
def initialize_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("./Firebase_地域共生ID.json")
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = initialize_firebase()
app = FastAPI(title="地域共生API", description="Firestoreと連携した地域情報API", version="1.0.0")

# Pydanticモデル
class NearRegion(BaseModel):
    ID: str

# 地域ID一覧取得
@app.get("/regions/view", summary="地域ID一覧の取得", response_model=List[str])
def list_region_ids():
    try:
        regions_ref = db.collection("Regions")
        docs = regions_ref.stream()
        result = [doc.id for doc in docs]
        print(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 隣接地域一覧取得
@app.get("/near_regions/view", summary="隣接地域一覧の取得")
def get_near_regions(region_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        docs = place_ref.stream()
        return [{"id": doc.id, "data": doc.to_dict()} for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 隣接地域の追加
@app.post("/near_regions/add", summary="隣接地域の追加")
def add_near_region(region_id: str, region: NearRegion):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        new_doc = place_ref.add(region.dict())[1]
        return {"message": "追加しました", "id": new_doc.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 隣接地域の削除
@app.delete("/near_regions/delete", summary="隣接地域の削除")
def delete_near_region(region_id: str, doc_id: str):
    try:
        place_ref = db.collection("Regions").document(region_id).collection("near_regions")
        place_ref.document(doc_id).delete()
        return {"message": "削除しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))