import traceback
from fastapi import APIRouter
from pydantic import BaseModel
from services.agent_executor import run_agent

router = APIRouter(tags=["Agent"])


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[dict] | None = None


@router.post("/agent/chat")
async def agent_chat(req: ChatRequest):
    """Send a message to the AI agent. It will use tools as needed and return the answer."""
    if not req.message.strip():
        return {"error": "Message cannot be empty."}

    try:
        result = run_agent(
            message=req.message,
            conversation_history=req.conversation_history,
        )
        return result
    except Exception as e:
        traceback.print_exc()
        return {
            "answer": f"Something went wrong: {str(e)}",
            "tool_calls": [],
            "total_time_ms": 0,
            "iterations": 0,
        }
