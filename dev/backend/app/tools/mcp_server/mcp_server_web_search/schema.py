from pydantic import Field, BaseModel


class FetchToolInput(BaseModel):
    query: str = Field(..., description="あなたが担当している町内会の名前を最初にいれてください。次にインターネットで検索したいワードをなるべく固有名詞を使って入力してください。固有名詞がなければ、必ず検索ヒットするような検索ワードを入力してください。")


"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""