import json
import time
import google.generativeai as genai
from config import get_settings
from services.tool_registry import GEMINI_TOOLS, execute_tool, TOOL_META

settings = get_settings()
genai.configure(api_key=settings.GOOGLE_API_KEY)

SYSTEM_PROMPT = """You are AgentFlow, a helpful AI assistant with access to real-time tools.

You can use multiple tools to answer complex questions. When a user asks something that requires current information, calculations, or web content, use the appropriate tools.

Guidelines:
- Use search_web for current events, news, facts you're unsure about
- Use get_weather for weather queries
- Use calculate for any math
- Use get_current_datetime when asked about today's date or time
- Use read_url when given a specific URL to read
- Use summarize_text to condense long content
- You can chain tools: search first, then read a URL from results, then summarize
- Always provide a clear, well-structured final answer
- Be conversational and helpful"""


def run_agent(message: str, conversation_history: list[dict] | None = None) -> dict:
    """Run the agent loop: send message -> tool calls -> final answer."""
    start_time = time.time()
    tool_calls_log = []

    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
        tools=[GEMINI_TOOLS],
    )

    # Build chat history
    history = []
    if conversation_history:
        conversation_history = conversation_history[-6:]
        for msg in conversation_history:
            role = "user" if msg["role"] == "user" else "model"
            history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=history)

    # Send the user message
    response = chat.send_message(message)

    # Agent loop: keep going until we get a text response (no more tool calls)
    iterations = 0
    while iterations < settings.MAX_TOOL_ITERATIONS:
        iterations += 1

        # Check if the response has function calls
        function_calls = _extract_function_calls(response)
        if not function_calls:
            break  # No tool calls, we have the final answer

        # Execute each function call
        tool_responses = []
        for fc in function_calls:
            tool_name = fc.name
            tool_args = dict(fc.args) if fc.args else {}
            meta = TOOL_META.get(tool_name, {"icon": "tool", "label": tool_name})

            tool_start = time.time()
            result = execute_tool(tool_name, tool_args)
            tool_duration = round((time.time() - tool_start) * 1000)

            # Log the tool call
            tool_calls_log.append({
                "tool": tool_name,
                "label": meta["label"],
                "icon": meta["icon"],
                "input": tool_args,
                "output": _truncate_output(result),
                "duration_ms": tool_duration,
            })

            # Build the function response for Gemini
            tool_responses.append(
                genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=tool_name,
                        response={"result": json.dumps(result, default=str)},
                    )
                )
            )

        # Send all tool results back to Gemini
        response = chat.send_message(tool_responses)

    # Extract final text answer
    answer = _extract_text(response)
    total_time = round((time.time() - start_time) * 1000)

    return {
        "answer": answer,
        "tool_calls": tool_calls_log,
        "total_time_ms": total_time,
        "iterations": iterations,
    }


def _extract_function_calls(response) -> list:
    """Extract function calls from a Gemini response."""
    calls = []
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call.name:
                calls.append(part.function_call)
    return calls


def _extract_text(response) -> str:
    """Extract text from a Gemini response."""
    if response.candidates:
        parts = response.candidates[0].content.parts
        texts = [part.text for part in parts if hasattr(part, "text") and part.text]
        if texts:
            return "\n".join(texts)
    return "I wasn't able to generate a response. Please try again."


def _truncate_output(result) -> any:
    """Truncate tool output for the log (keep it readable in the UI)."""
    if isinstance(result, str) and len(result) > 500:
        return result[:500] + "..."
    if isinstance(result, dict):
        truncated = {}
        for k, v in result.items():
            if isinstance(v, str) and len(v) > 300:
                truncated[k] = v[:300] + "..."
            else:
                truncated[k] = v
        return truncated
    if isinstance(result, list):
        return result[:5]  # Max 5 items in log
    return result
