import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS  # pip install duckduckgo-search


class MCPWebSearcher:
    def __init__(self, num_results: int = 3):
        self.num_results = num_results

    def search_web(self, query: str):
        """DuckDuckGoでWeb検索して、上位のURLを取得"""
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=self.num_results)
            urls = [result["href"] for result in results]
        return urls

    def fetch_content(self, url):
        response = requests.get(url)
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 例：mainコンテンツ内のテキストだけ取る
        main_content = soup.find('div', class_='article')  # クラス名はサイトにより異なります
        if main_content:
            return main_content.get_text(strip=True)
        else:
            return soup.get_text(strip=True)

    def summarize(self, text: str, query: str):
        """簡易的な要約（キーワードベースで抽出）"""
        lines = text.split("\n")
        important = [line for line in lines if any(word in line for word in query.split())]
        return "\n".join(important[:5]) or "関連情報が見つかりませんでした。"

    def answer(self, query: str):
        """検索＋要約して回答を返す"""
        urls = self.search_web(query)
        if not urls:
            return "検索結果が見つかりませんでした。"

        for url in urls:
            content = self.fetch_content(url)
            if content:
                summary = self.summarize(content, query)
                return f"【参考URL】{url}\n\n{summary}"

        return "有用な情報が取得できませんでした。"

if __name__ == "__main__":
    searcher = MCPWebSearcher()
    response = searcher.answer("大阪滝川地域活動協議会 町内会 ゴミの日")
    print(response)
