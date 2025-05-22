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

    def create_prompt(self, system_prompt: str, user_prompt: str):
        return [
            {"role": "system", "content": [{"type": "text", "text": system_prompt}]},
            {"role": "user", "content": [{"type": "text", "text": user_prompt}]}
        ]

    def chat(self, prompt: list, **kwargs):
        default_params = {
            "model": self.deployment,
            "max_tokens": 800,
            "temperature": 1.0,
            "top_p": 0.7,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False
        }
        default_params.update(kwargs)

        response = self.client.chat.completions.create(messages=prompt, **default_params)
        return response


# --- 使用例 ---

if __name__ == "__main__":
    model_context = "あなたはユーザーの質問に答える AI アシスタントです。"
    user_query = "これはテストメッセージです。"

    chat_client = AzureOpenAIChat()
    prompt = chat_client.create_prompt(system_prompt=model_context, user_prompt=user_query)
    response = chat_client.chat(prompt)

    print("応答:", response.choices[0].message.content)
    print(f"完了トークン: {response.usage.completion_tokens}")
    print(f"プロンプトトークン: {response.usage.prompt_tokens}")
