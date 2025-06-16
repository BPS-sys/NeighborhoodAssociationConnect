from pydantic import Field, BaseModel


class FetchToolInput(BaseModel):
    query: str = Field(..., description="あなたが担当している町内会の名前を最初にいれてください。次にインターネットで検索したいワードをなるべく固有名詞を使って入力してください。固有名詞がなければ、必ず検索ヒットするような検索ワードを入力してください。")
