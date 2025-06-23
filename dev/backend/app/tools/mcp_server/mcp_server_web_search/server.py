from mcp.server.fastmcp import FastMCP
from mcp_server_fetch.server import fetch_url
from mcp_server_fetch.server import DEFAULT_USER_AGENT_MANUAL
from duckduckgo_search import DDGS
from schema import *
from websearcher import MCPWebSearcher

mcp = FastMCP("FetchWrapper", host="0.0.0.0", port=8001)
searcher = MCPWebSearcher()

@mcp.tool()
async def fetch_tool(args: FetchToolInput) -> str:
    """インターネットに接続して検索することができます。"""
    response = searcher.answer(args.query)
    return response

if __name__ == "__main__":
    mcp.run(transport="sse")
