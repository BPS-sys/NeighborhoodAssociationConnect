import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()


class AzureOpenAIChat:
    def __init__(self):
        self.endpoint = os.getenv("ENDPOINT_URL")
        self.deployment = os.getenv("DEPLOYMENT_NAME")
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.api_version = os.getenv("API_VERSION")

        self.client = AzureOpenAI(
            azure_endpoint=self.endpoint,
            api_key=self.api_key,
            api_version=self.api_version,
        )
        self.system_prompt = self._read_system_prompt()

    def _read_system_prompt(self):
        with open(r"app/db/system_prompt.txt", "r", encoding="utf-8") as f:
            system_prompt = f.read()
        return system_prompt

    def create_prompt(self, user_prompt: str, use_system_prompt=True):
        if use_system_prompt:
            return [
                {"role": "system", "content": [{"type": "text", "text": self.system_prompt}]},
                {"role": "user", "content": [{"type": "text", "text": user_prompt}]}
            ]
        else:
            return [
                {"role": "user", "content": [{"type": "text", "text": user_prompt}]}
            ]

    def chat(self, prompt: list, **kwargs):
        default_params = {
            "model": self.deployment,
            "max_tokens": 300,
            "temperature": 1.0,
            "top_p": 0.8,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False
        }
        default_params.update(kwargs)

        response = self.client.chat.completions.create(messages=prompt, **default_params)
        return response
    
class AzureOpenAIEmbedding:
    def __init__(self):
        self.api_key = os.getenv("EMBEDDING_API_KEY")
        self.api_version = os.getenv("EMBEDDING_API_VERSION")
        self.endpoint = os.getenv("EMBEDDING_ENDPOINT_URL")
        self.client = AzureOpenAI(
            api_key=self.api_key,
            api_version=self.api_version,
            azure_endpoint=self.endpoint
        )
    def get_embedding(self, text: str) -> list[float]:
        response = self.client.embeddings.create(
            input=text,
            model=os.getenv("EMBEDDING_MODEL")
        )
        return response.data[0].embedding


# --- 使用例 ---

if __name__ == "__main__":
    user_query = "これはテストメッセージです。"

    chat_client = AzureOpenAIChat()
    prompt = chat_client.create_prompt(user_prompt=user_query)
    response = chat_client.chat(prompt)
    em_client = AzureOpenAIEmbedding()
    em = em_client.get_embedding(user_query)

    print("応答:", response.choices[0].message.content)
    print(f"完了トークン: {response.usage.completion_tokens}")
    print(f"プロンプトトークン: {response.usage.prompt_tokens}")
    print("Embedding:", len(em))


"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""