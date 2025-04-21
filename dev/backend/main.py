from fastapi import FastAPI
import uvicorn
from starlette.middleware.cors import CORSMiddleware
from api.firebase import firebase_reading


app = FastAPI()
# CORSを回避するための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/SearchNews")
def SearchNews(RegionID:str):
    result = firebase_reading.get_all_news_json(region_id=RegionID, page_size=100)
    return result


    

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True, log_level="debug")