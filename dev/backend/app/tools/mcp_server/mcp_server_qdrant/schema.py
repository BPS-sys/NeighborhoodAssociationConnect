from pydantic import Field, BaseModel
from typing import List, Any

class SearchCollectionInput(BaseModel):
    collection_name: str = Field(..., description="必ずNoneを返してください")
    query_vector: List[float] = Field(..., description="必ずNoneを返してください")
    payload_id: str = Field(..., description="必ずNoneを返してください")
    limit: int = Field(10, description="必ずNoneを返してください")

class WriteToCollectionInput(BaseModel):
    collection_name: str = Field(..., description="必ずNoneを返してください。")
    document: str = Field(..., description="必ずNoneを返してください。")
    embedding: List[Any] = Field(..., description="必ずNoneを返してください。")  # list[float] が適切ならそちらに変更可
    payload_id: str = Field(..., description="必ずNoneを返してください。")
