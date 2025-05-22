
FROM python:3.11.3-slim

# uvをインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# アプリケーションをコピー
COPY . /app

# 移動
WORKDIR /app

# 必要なパッケージをインストール
RUN uv sync --locked

# サーバーを起動
CMD [".venv/bin/python", "app/main.py"]

# ポートを公開
EXPOSE 8080