import asyncio
from fastmcp.client.transports import SSETransport
from fastmcp.client import Client
from models import model  # AzureOpenAIChat を含む独自モジュール
import json

from services.prototype import Prototype


class ChatAgent:
    def __init__(self):
        self.mcp_endpoints = ["http://mcp-server-qdrant:8000/sse",
                              "http://mcp-server-web-search:8001/sse"]
        self.chat_client = model.AzureOpenAIChat()
        self.embedding_client = model.AzureOpenAIEmbedding()
        self.temp_dict = {}
        self.endpoint_tool_map = {}
        self.tool_descriptions = {}
        Prototype().setup()
        
    async def get_tools_from_mcp_server_qdrant(self):
        for endpoint in self.mcp_endpoints:
            transport = SSETransport(endpoint)
            async with Client(transport=transport) as client:
                tools = await client.list_tools()
                self.endpoint_tool_map[endpoint] = tools
                for tool in tools:
                    self.tool_descriptions[tool.name] = tool.description
        print(self.tool_descriptions)

    def get_endpoint_by_tool_name(self, tool_name: str) -> str | None:
        for endpoint, tools in self.endpoint_tool_map.items():
            for tool in tools:
                if tool.name == tool_name:
                    return endpoint
        return None
    
    async def mcp_server_qdrant(self, tool_name: str):
        endpoint = "http://mcp-server-qdrant:8000/sse"
        transport = SSETransport(endpoint)
        async with Client(transport=transport) as client:
            pass

    
    async def chat(self, query: str, region_id: str) -> str:
        transport = SSETransport(self.mcp_endpoints[1])
        async with Client(transport=transport) as client:
            result =  await client.call_tool("fetch_tool", {
                "args":{
                    "query": query
                }
            })
        return result
        # MCPクライアントの初期化
        transport = SSETransport(self.mcp_endpoints[0])
        async with Client(transport=transport) as client:
            # Step 1: ベクトル検索
            query_vector = self.embedding_client.get_embedding(query)
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