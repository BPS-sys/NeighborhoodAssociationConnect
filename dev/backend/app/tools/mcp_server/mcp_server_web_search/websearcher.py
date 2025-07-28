from tavily import TavilyClient
import os


class MCPWebSearcher:
    def __init__(self):
        # API キーを設定してクライアントを生成
        self.tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API"))

    def answer(self, query: str) -> str:
        """スニペットベースの要約と参考URL一覧を返す（文字列）"""
        response = self.tavily_client.search(query)

        # スコア0.6以上のcontentを改行で結合してstrで返す
        filtered_texts = [
            result["content"]
            for result in response.get("results", [])
            if result.get("score", 0) >= 0.6
        ]

        return "\n".join(filtered_texts)


if __name__ == "__main__":
    searcher = MCPWebSearcher()
    result_text = searcher.answer("大阪滝川地域活動 祭り 2025")
    print(result_text)


"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""