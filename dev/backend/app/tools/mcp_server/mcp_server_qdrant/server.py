from mcp.server.fastmcp import FastMCP
from QdrantManager import QdrantManager
from schema import *

mcp = FastMCP("MCP_BaseServer",
              host="0.0.0.0",
              port=8000)

qdrant_manager = QdrantManager(host="qdrant", port=6333, ssl=False)

@mcp.tool()
def search_collection(args: SearchCollectionInput):
    """町内会の基本情報が入っているデータベースにベクトル検索を行えます。"""
    results = qdrant_manager.search_collection(
        collection_name=args.collection_name,
        query_vector=args.query_vector,
        limit=args.limit,
        payload_id=args.payload_id
    )
    return results


def write_to_collection(args: WriteToCollectionInput):
    """ユーザーとの会話を保存できます。"""
    success = qdrant_manager.write_to_collection(
        collection_name=args.collection_name,
        document=args.document,
        embedding=args.embedding,
        payload_id=args.payload_id
    )
    return success

if __name__ == "__main__":
    mcp.run(transport="sse")

"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""