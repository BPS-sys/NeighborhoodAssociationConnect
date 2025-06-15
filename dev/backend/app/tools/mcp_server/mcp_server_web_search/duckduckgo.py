from duckduckgo_search import DDGS  # pip install duckduckgo-search


class MCPWebSearcher:
    def __init__(self, num_results: int = 5):
        self.num_results = num_results

    def search_web(self, query: str):
        """DuckDuckGoでWeb検索し、スニペット付きのURLを取得"""
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=self.num_results)
            return [(r["href"], r.get("body", "")) for r in results if "href" in r]

    def summarize_snippets(self, snippets: list, query: str):
        """スニペットだけを使って簡易的に要約"""
        combined_text = "\n".join(snippets)
        lines = combined_text.splitlines()
        # キーワードを含む行だけ抽出（最大5行）
        important = [line for line in lines if any(word in line for word in query.split())]
        summary = "\n".join(important[:5])
        return summary or "関連情報が見つかりませんでした。"

    def answer(self, query: str):
        """スニペットベースの要約と参考URL一覧を返す"""
        results = self.search_web(query)
        if not results:
            return "検索結果が見つかりませんでした。"

        snippets = [snippet for _, snippet in results if snippet]
        summary = self.summarize_snippets(snippets, query)
        references = "\n".join(f"- {url}" for url, _ in results)

        return f"{summary}\n\n【参考URL】\n{references}"


if __name__ == "__main__":
    searcher = MCPWebSearcher()
    response = searcher.answer("大阪滝川地域活動 祭り 2025")
    print(response)
