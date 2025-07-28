from models.model import AzureOpenAIChat

class Article:
    def __init__(self):
        self.chat_engine = AzureOpenAIChat()

    def create(self, text: str):
        prompt = self.chat_engine.create_prompt(
            user_prompt=f"以下はポスターから抽出されたテキストです。これを元に、町内会用の掲示板記事を生成してください。プレーンテキストで見やすくまとめて書いてください。：\n{text}"
        )
        response = self.chat_engine.chat(prompt)
        article = response.choices[0].message.content
        return article
    
"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""