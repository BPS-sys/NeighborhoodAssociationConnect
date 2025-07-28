import asyncio
from fastmcp.client.transports import SSETransport
from fastmcp.client import Client
from models import model  # AzureOpenAIChat を含む独自モジュール
import json
import glob
from tools.mcp_server.mcp_server_qdrant.QdrantManager import QdrantManager
from models import model


class Prototype:
    def __init__(self):
        self.embedding_client = model.AzureOpenAIEmbedding()
        self.qdrant_manager = QdrantManager(host="qdrant", port=6333, ssl=False)
        self.region_database_dict = {}
        
    def _temp_read_qdrant(self):
        for file_name in glob.glob(r"app/db/region_db/*.txt"):
            print(file_name)
            with open(file_name, "r", encoding="utf-8") as f:
                qdrant_text = str(f.read())
                region_id, text = qdrant_text.split("\n", maxsplit=1)
                self.region_database_dict[region_id] = text

    def setup(self):    
        self._temp_read_qdrant()
        region_exist = self.qdrant_manager.collection_exists(collection_name="region")
        for id, text in self.region_database_dict.items():
            if not region_exist:
                texts = text.split("\n\n")
                for point_text in texts:
                    em = self.embedding_client.get_embedding(point_text)
                    self.qdrant_manager.write_to_collection(collection_name="region",
                                                            document=point_text,
                                                            embedding=em,
                                                            payload_id=id)
                    print("writed setup qdrant!!!!!!!!!!!!!!!!!")
        print("complete setup Prototype!!!!!!!!!!!!!!")

"""
Copyright (c) 2025 YukiTakayama
このソースコードは自由に使用、複製、改変、再配布することができます。
ただし、著作権表示は削除しないでください。
"""