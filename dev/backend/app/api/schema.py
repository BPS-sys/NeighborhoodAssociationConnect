from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class NearRegion(BaseModel):
    ID: str
    Name: str

class NewsIn(BaseModel):
    title: str
    text: str
    columns: str
    custom_id: Optional[str] = None
    start_time: Optional[datetime] = None  # ← 追加

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
    starttime: Optional[datetime] = None  # ← 追加

class ChatMessage(BaseModel):
    UserMessage: str = Field(..., description="ユーザーメッセージ")
    RegionID: str = Field(..., description="地域ID")
    RegionName: str = Field(..., description="地域名")

class UserMessageIn(BaseModel):
    title: str = Field(..., description="タイトル")
    text: str = Field(..., description="メッセージ本文")
    author: str = Field(..., description="メッセージの送信者")

class UserRegistRequest(BaseModel):
    user_id: str = Field(..., description="ユーザーID")
    birthday: str = Field(..., description="誕生日")
    name: str = Field(..., description="名前")
    phone_number: str = Field(..., description="電話番号")
    region_id: str = Field(..., description="地域ID")
    address: str = Field(..., description="住所")
    role: str = Field(..., description="役割")

class UserInfomationRequest(BaseModel):
    user_id: str = Field(..., description="ユーザーID")

class SetReadState(BaseModel):
    user_id: str = Field(..., description="ユーザーID")
    message_id: str = Field(..., description="メッセージID")