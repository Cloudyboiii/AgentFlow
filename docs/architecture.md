# AgentFlow — Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Tool Reference](#tool-reference)
3. [API Reference](#api-reference)
4. [Agent Loop Design](#agent-loop-design)
5. [Design Decisions](#design-decisions)
6. [Performance & Limitations](#performance--limitations)
7. [Future Improvements](#future-improvements)

---

## 1. System Architecture

The application is built on a decoupled client-server architecture.

### Component Overview

Frontend (Next.js 14) communicates with the FastAPI backend via HTTP POST. The backend runs an agent executor that uses Gemini native function calling to orchestrate tool execution. Tools call external APIs with no API keys required (except Gemini).

Browser (Next.js)
│ HTTP POST /api/agent/chat
▼
FastAPI Backend
│
▼
Agent Executor (Gemini Native Function Calling)
│
├── search_web → DuckDuckGo (no key)
├── get_weather → Open-Meteo (no key)
├── calculate → asteval (local, safe)
├── summarize_text → Gemini API
├── get_datetime → Python stdlib
└── read_url → BeautifulSoup (no key)


### Frontend Architecture

- Framework: Next.js 14 App Router
- State: React useState and useEffect
- Session persistence: localStorage under key agentflow_sessions
- Multi-session: Each session is an independent conversation with its own tool call history
- Styling: Tailwind CSS with custom glassmorphism utilities

### Backend Architecture

- Framework: FastAPI (Python 3.11)
- Model: gemini-3.6-flash (function calling)
- Tool registry: services/tool_registry.py
- Agent loop: services/agent_executor.py
- CORS: Allows localhost:3000 and the production Vercel domain

---

## 2. Tool Reference

### search_web
DuckDuckGo search. No API key required.
- Input: query (string), max_results (int, default 5)
- Output: [{title, url, snippet}]
- Used when: current events, research, facts the model doesn't know

### get_weather
Open-Meteo weather API. No API key required.
- Input: city (string)
- Output: {city, country, temperature_celsius, humidity_percent, wind_speed_kmh, condition}
- Used when: weather queries for any city

### calculate
Safe math evaluation via asteval (not eval).
- Input: expression (string, e.g. "sqrt(144)", "2**32")
- Supports: arithmetic, powers, sqrt, sin, cos, log, pi, e
- Output: {expression, result}
- Used when: any calculation or unit conversion

### summarize_text
Gemini-powered text summarizer.
- Input: text (string), max_points (int, default 5)
- Output: {summary} as bullet points
- Used when: condensing long content from search or URL reads

### get_current_datetime
Python stdlib datetime.
- Input: timezone_name (string, default "UTC")
- Output: {date, time, day_of_week, timezone, iso}
- Used when: user asks about current time or date

### read_url
BeautifulSoup webpage text extractor.
- Input: url (string)
- Output: {url, content} — truncated to 3000 chars
- Used when: given a specific URL or following up a search result

---

## 3. API Reference

### POST /api/agent/chat

Request:
```json
{
  "message": "What is the weather in Tokyo?",
  "conversation_history": [
    {"role": "user", "content": "Previous question"},
    {"role": "ai", "content": "Previous answer"}
  ]
}
```

Response:
```json
{
  "answer": "The current weather in Tokyo is 22°C and partly cloudy.",
  "tool_calls": [
    {
      "tool": "get_weather",
      "label": "Weather",
      "icon": "cloud",
      "input": {"city": "Tokyo"},
      "output": {"temperature_celsius": 22, "condition": "Partly cloudy"},
      "duration_ms": 570
    }
  ],
  "total_time_ms": 2840,
  "iterations": 1
}
```

### GET /api/health

Response: {"status": "ok", "version": "1.0.0", "service": "AgentFlow API"}

---

## 4. Agent Loop Design

### Native Function Calling

AgentFlow uses Gemini native function calling — NOT a ReAct text-parsing approach.

With native function calling:
- Tool schemas are declared as structured FunctionDeclaration objects
- Gemini returns a function_call object with tool name and typed arguments
- The executor runs the tool and returns a function_response object
- Gemini incorporates the result and decides whether to call another tool

This is more reliable than ReAct because tool invocations are schema-validated, not parsed from free text.

### Tool Registry Pattern

All tools are registered in services/tool_registry.py as three structures:
- FunctionDeclaration — schema Gemini uses to decide when/how to call the tool
- TOOL_IMPLEMENTATIONS — Python lambda for execution
- TOOL_META — icon and label for the UI

Adding a new tool requires only entries in these three dictionaries.

### Parallel Tool Use

Gemini may return multiple function_call objects in one response. AgentFlow executes all and sends all results back together.

### Iteration Limit

Capped at MAX_TOOL_ITERATIONS (10) in config.py to prevent infinite loops. Most queries resolve in 1-3 iterations.

---

## 5. Design Decisions

### Why DuckDuckGo?
Free, no API key, generous rate limits. Google Search API costs $5/1000 queries.

### Why asteval instead of eval()?
eval() executes arbitrary Python code — a security risk. asteval uses an AST interpreter restricted to math expressions only.

### Why Open-Meteo?
100% free, no API key, pulls from national weather services worldwide.

### Why gemini-3.6-flash?
Best balance of speed and capability for agentic tasks. Supports native function calling. Fits within the free tier.

---

## 6. Performance & Limitations

Typical latencies (free tier):
- Simple weather: 2-4 seconds
- Research + summarize: 8-15 seconds
- Pure math: 1-3 seconds

Known limitations:
- DuckDuckGo: unofficial API, can occasionally rate limit
- URL Reader: JavaScript-rendered SPAs return empty content
- Render free tier: 30-60 second cold start after inactivity
- Gemini free tier: 15 requests/minute, 1500/day

---

## 7. Future Improvements

- Streaming responses (token-by-token output)
- Tool result caching within a session
- Code execution tool (safe Python sandbox)
- File upload support (CSV, text analysis)
- Additional tools (email, calendar, news API)

---

*Built by [Badal Gupta](https://github.com/Cloudyboiii) — MS Data Science, University at Albany (SUNY)*
