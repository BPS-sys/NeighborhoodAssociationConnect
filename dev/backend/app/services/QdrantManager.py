from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance
import  dotenv
import os
import asyncio

dotenv.load_dotenv()


class QdrantManager:
    def __init__(self, host: str = "localhost", port: int = 6333, ssl: bool = False):
        self.client = QdrantClient(url=f"{'https' if ssl else 'http'}://{host}:{port}", api_key=os.getenv("QDRANT_API_KEY"))

    def create_collection(self, collection_name: str):
        self.client.recreate_collection(
            collection_name=collection_name,
            vectors_config={
                "embedding": VectorParams(
                    size=384,  # 例: OpenAIのtext-embedding-ada-002のベクトルサイズ
                    distance=Distance.COSINE
                )
            }
        )
        print(f"Collection '{collection_name}' created successfully.")

if __name__ == "__main__":
    qdrant_manager = QdrantManager()
    qdrant_manager.create_collection("example_collection")