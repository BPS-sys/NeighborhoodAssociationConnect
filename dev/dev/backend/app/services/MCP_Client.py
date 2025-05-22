import asyncio
from fastmcp.client.transports import SSETransport
from fastmcp.client import Client
from models import model  # AzureOpenAIChat を含む独自モジュール


class ChatAgent:
    def __init__(self,model_context: str):
        self.mcp_endpoint = "http://qdrant-mcp:8000/sse"
        self.chat_client = model.AzureOpenAIChat()
        self.model_context = model_context

    async def chat(self, query: str, region_id: str) -> str:
        # MCPクライアントの初期化
        transport = SSETransport(self.mcp_endpoint)
        async with Client(transport=transport) as client:
            # Step 1: ベクトル検索
            result = await client.call_tool("qdrant-find", {
                "query": query,
                "collection": "test_collection",
                })
            context = result[-1].text

            # Step 2: プロンプト整形
            prompt = self.chat_client.create_prompt(
                system_prompt=self.model_context,
                user_prompt=f"ユーザーの質問: {query}\n\n参考情報:\n{context}"
            )

            # Step 3: 応答生成
            response = self.chat_client.chat(prompt)
            response_text = response.choices[0].message.content

            print("応答:", response_text)
            print(f"完了トークン: {response.usage.completion_tokens}")
            print(f"プロンプトトークン: {response.usage.prompt_tokens}")

            # Step 4: 応答を保存
            # await client.call_tool("qdrant-store", {
            #     "information": f"{query}\n{response_text}",
            #     "metadata": {"source": "user-conversation"},
            #     "collection": "test_collection",
            # })

            return response_text


if __name__ == "__main__":
    asyncio.run(ChatAgent(model_context="あなたはユーザーの質問に答える AI アシスタントです。").chat("近所の清掃当番っていつ？"))