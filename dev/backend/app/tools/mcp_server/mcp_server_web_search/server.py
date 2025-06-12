from mcp.server.fastmcp import FastMCP
from mcp_server_fetch.server import fetch_url  # ← これがコアの非同期関数
from mcp_server_fetch.server import DEFAULT_USER_AGENT_MANUAL

mcp = FastMCP("FetchWrapper", host="0.0.0.0", port=8001)

@mcp.tool()
async def fetch_tool(url: str, raw: bool = False, proxy_url: str | None = None) -> str:
    """SSE対応 fetch ツール"""
    content, prefix = await fetch_url(
        url,
        user_agent=DEFAULT_USER_AGENT_MANUAL,
        force_raw=raw,
        proxy_url=proxy_url
    )
    return prefix + content

if __name__ == "__main__":
    mcp.run(transport="sse")  # ← SSEサーバとして起動
