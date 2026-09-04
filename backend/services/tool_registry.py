import google.generativeai as genai
from services.tools.search import search_web
from services.tools.weather import get_weather
from services.tools.calculator import calculate
from services.tools.summarizer import summarize_text
from services.tools.datetime_tool import get_current_datetime
from services.tools.url_reader import read_url


# ---- Gemini function declarations ----

search_declaration = genai.protos.FunctionDeclaration(
    name="search_web",
    description="Search the web for current information on any topic. Use this when the user asks about recent events, news, people, facts, or anything you don't know.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "query": genai.protos.Schema(type=genai.protos.Type.STRING, description="The search query"),
        },
        required=["query"],
    ),
)

weather_declaration = genai.protos.FunctionDeclaration(
    name="get_weather",
    description="Get the current weather for any city in the world. Returns temperature, humidity, wind speed, and conditions.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "city": genai.protos.Schema(type=genai.protos.Type.STRING, description="City name (e.g. 'New York', 'Tokyo', 'London')"),
        },
        required=["city"],
    ),
)

calculator_declaration = genai.protos.FunctionDeclaration(
    name="calculate",
    description="Evaluate a mathematical expression. Supports arithmetic (+, -, *, /, **), functions (sqrt, sin, cos, log), and constants (pi, e).",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "expression": genai.protos.Schema(type=genai.protos.Type.STRING, description="Math expression to evaluate (e.g. '2**32', 'sqrt(144)', '(15 * 3.5) + 42')"),
        },
        required=["expression"],
    ),
)

summarizer_declaration = genai.protos.FunctionDeclaration(
    name="summarize_text",
    description="Summarize a long piece of text into concise bullet points. Use after retrieving content from a URL or search results.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "text": genai.protos.Schema(type=genai.protos.Type.STRING, description="The text to summarize"),
            "max_points": genai.protos.Schema(type=genai.protos.Type.INTEGER, description="Number of bullet points (default 5)"),
        },
        required=["text"],
    ),
)

datetime_declaration = genai.protos.FunctionDeclaration(
    name="get_current_datetime",
    description="Get the current date and time. Use when the user asks what day/time it is.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "timezone_name": genai.protos.Schema(type=genai.protos.Type.STRING, description="Timezone (default UTC)"),
        },
        required=[],
    ),
)

url_reader_declaration = genai.protos.FunctionDeclaration(
    name="read_url",
    description="Fetch and read the text content of a webpage URL. Use when you need to read an article, blog post, or any web page.",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            "url": genai.protos.Schema(type=genai.protos.Type.STRING, description="The URL to read"),
        },
        required=["url"],
    ),
)

# ---- Registry ----

ALL_TOOL_DECLARATIONS = [
    search_declaration,
    weather_declaration,
    calculator_declaration,
    summarizer_declaration,
    datetime_declaration,
    url_reader_declaration,
]

GEMINI_TOOLS = genai.protos.Tool(function_declarations=ALL_TOOL_DECLARATIONS)

# Map function names to their Python implementations
TOOL_IMPLEMENTATIONS = {
    "search_web": lambda args: search_web(args.get("query", ""), args.get("max_results", 5)),
    "get_weather": lambda args: get_weather(args.get("city", "")),
    "calculate": lambda args: calculate(args.get("expression", "")),
    "summarize_text": lambda args: summarize_text(args.get("text", ""), args.get("max_points", 5)),
    "get_current_datetime": lambda args: get_current_datetime(args.get("timezone_name", "UTC")),
    "read_url": lambda args: read_url(args.get("url", "")),
}

# Tool display metadata
TOOL_META = {
    "search_web": {"icon": "search", "label": "Web Search"},
    "get_weather": {"icon": "cloud", "label": "Weather"},
    "calculate": {"icon": "calculator", "label": "Calculator"},
    "summarize_text": {"icon": "file-text", "label": "Summarizer"},
    "get_current_datetime": {"icon": "clock", "label": "Date & Time"},
    "read_url": {"icon": "globe", "label": "URL Reader"},
}


def execute_tool(name: str, args: dict) -> any:
    """Execute a tool by name with given arguments."""
    impl = TOOL_IMPLEMENTATIONS.get(name)
    if not impl:
        return {"error": f"Unknown tool: {name}"}
    return impl(args)
