import asyncio
from fastmcp.client.transports import SSETransport
from fastmcp.client import Client
from models import model  # AzureOpenAIChat を含む独自モジュール
import json

import glob


class ChatAgent:
    def __init__(self):
        self.mcp_endpoint = "http://mcp-server:8000/sse"
        self.chat_client = model.AzureOpenAIChat()
        self.embedding_client = model.AzureOpenAIEmbedding()
        self.FIRST = True  # 初回フラグ
        self.temp_dict = {}
        self._temp_read_qdrant()  # 一時的にQdrantの情報を読み込む


    def _temp_read_qdrant(self):
        for file_name in glob.glob(r"app/db/region_db/*.txt"):
            print(file_name)
            with open(file_name, "r", encoding="utf-8") as f:
                qdrant_text = str(f.read())
                region_id, text = qdrant_text.split("\n", maxsplit=1)
                self.temp_dict[region_id] = text

    async def chat(self, query: str, region_id: str) -> str:
        # MCPクライアントの初期化
        transport = SSETransport(self.mcp_endpoint)
        async with Client(transport=transport) as client:
            tools = await client.list_tools()
            print(tools)
            query_vector = self.embedding_client.get_embedding(query)
            # プロトタイプ用
            if self.FIRST:
                self.FIRST = False
                region_exist = await client.call_tool("setup_collection", {
                        "collection_name": "region"
                        })
                for id, text in self.temp_dict.items():
                    if region_exist[-1].text == "false":
                        texts = text.split("\n\n")
                        for point_text in texts:
                            em = self.embedding_client.get_embedding(point_text)
                            await client.call_tool("write_to_collection", {
                                "document": point_text,
                                "collection_name": "region",
                                "embedding": em,
                                "payload_id": id
                            })
            # Step 1: ベクトル検索
            result = await client.call_tool("search_collection", {
                "collection_name": "region",
                "query_vector": query_vector,
                "payload_id": region_id,
                "limit": 5
                })
            context = result[-1].text
            print("検索結果:", context)

            # Step 2: プロンプト整形
            json_data = json.loads(context)
            context_documents = [point['payload']['document'] for point in json_data.get('points', []) if 'payload' in point and 'document' in point['payload']]
            text_for_ai = '\n'.join(context_documents)
            print("整形結果：", text_for_ai)
            prompt = self.chat_client.create_prompt(
                user_prompt=f"ユーザーの質問: {query}\n\n参考情報:\n{text_for_ai}"
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