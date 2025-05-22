from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


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