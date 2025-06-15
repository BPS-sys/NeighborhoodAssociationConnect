from mcp.server.fastmcp import FastMCP
from QdrantManager import QdrantManager
from schema import *

mcp = FastMCP("MCP_BaseServer",
              host="0.0.0.0",
              port=8000)

qdrant_manager = QdrantManager(host="qdrant", port=6333, ssl=False)

@mcp.tool()
def search_collection(args: SearchCollectionInput):
    """ユーザーが求めている情報をデータベースから探すことができます。"""
    results = qdrant_manager.search_collection(
        collection_name=args.collection_name,
        query_vector=args.query_vector,
        limit=args.limit,
        payload_id=args.payload_id
    )
    return results

@mcp.tool()
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