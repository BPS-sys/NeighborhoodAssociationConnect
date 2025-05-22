from fastapi import FastAPI
import uvicorn
from starlette.middleware.cors import CORSMiddleware
from api.v1.endpoints import items



app = FastAPI()
# CORSを回避するための設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router, prefix="/api/v1")

if __name__ == "__main__":
    # ugyGiVvlg4fDN2afMnoe(RegionID)
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True, log_level="debug")