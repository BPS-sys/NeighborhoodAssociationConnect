
import argparse

def main():
    parser = argparse.ArgumentParser(description="mcp-server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse"],
        default="sse",
    )
    args = parser.parse_args()

    from mcp_server import mcp
    mcp.run(transport=args.transport)

if __name__ == "__main__":
    main()