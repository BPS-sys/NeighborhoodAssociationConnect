from pydantic import Field, BaseModel


class FetchToolInput(BaseModel):
    query: str = Field(..., description="インターネットで検索したいワードを単語ごとにスペース区切りで入力してください。")
