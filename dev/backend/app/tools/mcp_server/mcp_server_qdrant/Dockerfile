FROM python:3.11.3-slim


# uvをインストール
RUN pip install --no-cache-dir uv

# アプリケーションをコピー
COPY . /app

# 移動
WORKDIR /app

# 必要なパッケージをインストール
RUN uv sync

# 実行
CMD [".venv/bin/python", "main.py", "--transport", "sse"]


# ポートを公開
EXPOSE 8000