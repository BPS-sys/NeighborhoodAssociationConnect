from mcp.server.fastmcp import FastMCP
from mcp_server_qdrant.QdrantManager import QdrantManager

mcp = FastMCP("MCP_BaseServer",
              host="0.0.0.0",
              port=8000)

qdrant_manager = QdrantManager(host="qdrant", port=6333, ssl=False)


@mcp.tool()
def search_collection(collection_name: str, query_vector: list[float], payload_id: str, limit: int = 10):
    results = qdrant_manager.search_collection(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=limit,
        payload_id=payload_id
    )
    return results

@mcp.tool()
def write_to_collection(collection_name: str, document: str, embedding: list, payload_id: str):
    success = qdrant_manager.write_to_collection(
        collection_name=collection_name,
        document=document,
        embedding=embedding,
        payload_id=payload_id
    )
    return success

@mcp.tool()
def setup_collection(collection_name: str):
    judge = qdrant_manager.collection_exists(collection_name=collection_name)
    return judge

if __name__ == "__main__":
    mcp.run(transport="sse")