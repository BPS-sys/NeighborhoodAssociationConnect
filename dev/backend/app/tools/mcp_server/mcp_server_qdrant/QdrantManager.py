from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
import  dotenv
import os
import uuid
import numpy as np

dotenv.load_dotenv()


class QdrantManager:
    def __init__(self, host: str = "localhost", port: int = 6333, ssl: bool = False):
        self.client = QdrantClient(url=f"{'https' if ssl else 'http'}://{host}:{port}", api_key=os.getenv("QDRANT_API_KEY"))

    def create_collection(self, collection_name: str):
        self.client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                    size=1536,  # 例: OpenAIのtext-embedding-ada-002のベクトルサイズ
                    distance=Distance.COSINE
                )
        )
        print(f"Collection '{collection_name}' created successfully.")
    
    def write_to_collection(self, collection_name: str, document: str, embedding: list, payload_id: str):
        colection_exist = self.collection_exists(collection_name=collection_name)
        if not colection_exist:
            self.create_collection(collection_name)
        points = [
            {
                "id": str(uuid.uuid4()),
                "vector": embedding,
                "payload": {"document":document,
                            "payload_id":payload_id}
            }
        ]
        self.client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"Documents written to collection '{collection_name}' successfully.")
        return True
    
    def search_collection(self, collection_name: str, query_vector: list[float], payload_id: str, limit: int = 10):
        results = self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=limit,
            query_filter = Filter(
                must=[
                    FieldCondition(key="payload_id", match=MatchValue(value=payload_id))
                ]
            )

        )
        return results
    
    def collection_exists(self, collection_name: str):
        judge = self.client.collection_exists(collection_name=collection_name)
        return judge

if __name__ == "__main__":
    qdrant_manager = QdrantManager()
    qdrant_manager.create_collection("example_collection")