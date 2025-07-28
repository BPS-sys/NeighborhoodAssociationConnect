from fastapi import FastAPI
import uvicorn
from starlette.middleware.cors import CORSMiddleware
from api.v1.endpoints import items
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import os
import dotenv

dotenv.load_dotenv()
API_KEY = os.getenv("BACKEND_API_KEY")

app = FastAPI()

@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {API_KEY}":
        return JSONResponse(status_code=401, content={"detail": "Invalid or missing API Key"})
    response = await call_next(request)
    return response

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


"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""