
import argparse

def main():
    parser = argparse.ArgumentParser(description="mcp-server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse"],
        default="sse",
    )
    args = parser.parse_args()

    from server import mcp
    mcp.run(transport=args.transport)

if __name__ == "__main__":
    main()

"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""