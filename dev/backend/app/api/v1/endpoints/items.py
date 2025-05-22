from services import firebase_reading, MCP_Client
from fastapi import APIRouter
import asyncio


router = APIRouter()
mcp_client = MCP_Client.ChatAgent(model_context="あなたはユーザーの質問に答える AI アシスタントです。")

@router.post("/SearchNews")
def SearchNews(RegionID:str):
    result = firebase_reading.get_all_news_json(region_id=RegionID, page_size=100)
    return result

@router.post("/Chat")
async def Chat(UserMessage:str, RegionID:str):
    print(f"UserMessage: {UserMessage}")
    print(type(UserMessage))
    chat_response = await mcp_client.chat(query=UserMessage, region_id=RegionID)
    return chat_response 