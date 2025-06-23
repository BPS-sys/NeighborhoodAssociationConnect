import asyncio
from fastmcp.client.transports import SSETransport
from fastmcp.client import Client
from models import model  # AzureOpenAIChat を含む独自モジュール
import json
import datetime

from services.prototype import Prototype

class MCPServers:
    qdrant: str = "http://mcp-server-qdrant:8000/sse"
    web_search: str = "http://mcp-server-web-search:8001/sse"

class ChatAgent:
    def __init__(self):
        self.mcp_endpoints = [MCPServers.qdrant,
                              MCPServers.web_search]
        self.chat_client = model.AzureOpenAIChat()
        self.embedding_client = model.AzureOpenAIEmbedding()
        self.temp_dict = {}
        self.endpoint_tool_map = {}
        self.tool_descriptions = {}
        Prototype().setup()
        
    async def get_tools_from_mcp_server(self):
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

    def extract_tool_args_from_endpoints(self, endpoint_url: str, tool_name: str):
        """
        任意のツールに対して、引数情報（型と説明）を返す汎用関数。

        Parameters:
            endpoint_url (str): ツールが属するエンドポイントのURL
            tool_name (str): 抽出対象のツール名

        Returns:
            dict: {'ツール名': {'args': {引数名: {'type': 型, 'description': 説明}}}} 形式
        """
        tools = self.endpoint_tool_map.get(endpoint_url, [])
        target_tool = next((t for t in tools if t.name == tool_name), None)
        if not target_tool:
            raise ValueError(f"ツール '{tool_name}' がエンドポイント '{endpoint_url}' に見つかりません。")

        # $defs から Input Schema を探索
        schema_defs = target_tool.inputSchema.get('$defs', {})
        args_properties = {}

        for def_schema in schema_defs.values():
            if 'properties' in def_schema:  # これが本体の入力スキーマと仮定
                args_properties = def_schema['properties']
                break  # 最初に見つけたものを採用（複数ある場合は拡張可）

        if not args_properties:
            raise ValueError(f"ツール '{tool_name}' の inputSchema に有効な properties が見つかりません。")

        return {
            tool_name: {
                'args': {
                    arg_name: {
                        'type': arg_info.get('type', 'unknown'),
                        'description': arg_info.get('description', '')
                    }
                    for arg_name, arg_info in args_properties.items()
                }
            }
        }

    def generate_use_tool_llm_prompt(self, user_query: str, tool_args_dict: dict, region_name: str) -> str:
        """
        ツールの引数仕様から、LLMに渡す自然言語プロンプトを生成する。

        Parameters:
            tool_args_dict (dict): {
                'tool_name': {
                    'args': {
                        'arg_name': {
                            'type': '...',
                            'description': '...'
                        }, ...
                    }
                }
            }

        Returns:
            str: LLMに渡す自然文プロンプト
        """
        if not tool_args_dict:
            raise ValueError("tool_args_dict が空です。")

        tool_name = next(iter(tool_args_dict))
        args = tool_args_dict[tool_name].get("args", {})

        # スキーマを自然言語で整形
        formatted_schema = "\n".join(
            f"- {arg} ({info.get('type', 'unknown')}): {info.get('description', '')}"
            for arg, info in args.items()
        )

        # JSON例の中身を生成（string→"文字列を入力", array→[], integer→0など）
        def generate_example_value(arg_info):
            return '"入力してください"'
            
        example_filled_args = ",\n    ".join(
            f'"{arg}": {generate_example_value(info)}' for arg, info in args.items()
        )

        # プロンプト組み立て
        prompt = f"""次のツール「{tool_name}」を使用するために、指定された引数に対して適切な値を入力してください。
    各引数には、与えられた説明と型に従って適切な値を設定してください。
    引数の内容は、ユーザーの質問に答えることができるような適切な値にしてください。
    今の日付と時間：{datetime.datetime.now()}
    ユーザーの質問：{user_query}
    あなたが担当している町内会：{region_name}
    
    出力は **必ず以下の形式の JSON で返してください**（コードブロックや補足説明を含めず、JSONのみを出力してください）。

    スキーマ:
    {formatted_schema}

    出力形式:
    {{
    "args": {{
        {example_filled_args}
    }}
    }}"""

        return prompt
    
    async def use_mcp_server(self, user_query: str, region_id: str, tool_name: str, endpoint: str, tool_args: str):
        tool_args_json = self.fill_tool_args(user_query=user_query,
                                             region_id=region_id,
                                             tool_args=tool_args,
                                             endpoint=endpoint,
                                             tool_name=tool_name)
        if endpoint == MCPServers.qdrant:
            if tool_name == "search_collection":
                transport = SSETransport(endpoint)
                async with Client(transport=transport) as client:
                    result = await client.call_tool(tool_name, tool_args_json)
                context = "\n\nデータベースでの検索結果：\n" + result[-1].text
        elif endpoint == MCPServers.web_search:
            if tool_name == "fetch_tool":
                transport = SSETransport(endpoint)
                async with Client(transport=transport) as client:
                    result = await client.call_tool(tool_name, tool_args_json)
                context = "\n\nWEBでの検索結果：" + result[-1].text
        print(context)
        return context
    
    def fill_tool_args(self, user_query: str, region_id: str, tool_args: str, endpoint: str, tool_name: str) -> dict:
        tool_args_json = json.loads(tool_args)
        if endpoint == MCPServers.qdrant:
            if tool_name == "search_collection":
                query_vector = self.embedding_client.get_embedding(user_query)
                tool_args_json["args"]["collection_name"] = "region"
                tool_args_json["args"]["query_vector"] = query_vector
                tool_args_json["args"]["payload_id"] = region_id
                tool_args_json["args"]["limit"] = 5
            elif tool_name == "write_to_collection":
                pass
                # query_vector = self.embedding_client.get_embedding(user_query)
                # tool_args_json["args"]["collection_name"] = "users"
                # tool_args_json["args"]["document"] = user_query
                # tool_args_json["args"]["embedding"] = query_vector
                # tool_args_json["args"]["payload_id"] = user_id
        elif endpoint == MCPServers.web_search:
            if tool_name == "fetch_tool":
                pass
        return tool_args_json
    
    async def chat(self, query: str, region_id: str, region_name: str) -> str:
        # ツール選択
        user_prompt = 'ユーザーはあなたのことを町内会の役員の方だと思っています。\nユーザーの質問を基に、最も適切なツールまたはツールの組み合わせを選択してください。\n以下の「使えるツール」の中から、質問に答えるために必要なものを1つ以上選んでください。  \n必ず「使えるツール」のリストにある名前から選んでください。それ以外は使用できません。  \n\n出力形式は**厳密に**以下に従ってください（理由の記載は不要です）：  \n{"tools": [{"name": "xxx"}, {"name": "xxx"}]}\n\n---\n\n' \
                      + f"ユーザーの質問: {query}\n\n使えるツール:\n{self.tool_descriptions}"
        prompt = self.chat_client.create_prompt(
                user_prompt=user_prompt,
                use_system_prompt=False
            )
        tool_response = self.chat_client.chat(prompt)
        tool_response_text = tool_response.choices[0].message.content
        print("選択したツール：", tool_response_text)
        
        # 選択したツールの引数を埋めてコンテキストを作成する。そして、統合する
        parsed = json.loads(tool_response_text)
        result_context = ""
        for tool in parsed['tools']:
            tool_name = tool["name"]
            endpoint = self.get_endpoint_by_tool_name(tool_name=tool_name)
            # 使用するツールの引数, 型などを取得
            args_tools_dict = self.extract_tool_args_from_endpoints(endpoint_url=endpoint, tool_name=tool_name)
            # ツールの引数を埋めるプロンプトを生成
            fill_in_prompt = self.generate_use_tool_llm_prompt(tool_args_dict=args_tools_dict, user_query=query, region_name=region_name)
            fill_in_prompt = self.chat_client.create_prompt(
                user_prompt=fill_in_prompt,
                use_system_prompt=False
            )
            # ツールの引数を埋める
            filled_args_tool = self.chat_client.chat(fill_in_prompt)
            tool_args = filled_args_tool.choices[0].message.content
            print("ツールの引数を埋めた結果：", tool_args)
            context = await self.use_mcp_server(user_query=query,
                                          region_id=region_id,
                                          tool_name=tool_name,
                                          endpoint=endpoint,
                                          tool_args=tool_args)
            result_context += context
        # 最終的な応答生成
        print("最終的な応答", result_context)
        prompt = self.chat_client.create_prompt(user_prompt=f"ユーザーの質問: {query}\n\n今日の日付:{datetime.datetime.now()}\n\n{result_context}", use_system_prompt=True)
        response = self.chat_client.chat(prompt)
        response_text = response.choices[0].message.content

        print("応答:", response_text)
        return response_text


if __name__ == "__main__":
    asyncio.run(ChatAgent(model_context="あなたはユーザーの質問に答える AI アシスタントです。").chat("近所の清掃当番っていつ？"))