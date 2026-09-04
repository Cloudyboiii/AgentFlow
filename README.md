# AgentFlow ⚡

**Multi-Tool AI Agent with Real-Time Reasoning Panel**

Ask complex questions. Watch the agent think, pick tools, and build answers step by step.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)

---

## What is AgentFlow?

AgentFlow is an AI agent that can use multiple tools to answer complex, multi-part questions. Instead of just generating text, it reasons about which tools to call, executes them, reads the results, and synthesizes a final answer.

The split-panel UI shows the agent's thought process in real time — every tool call, its input, output, and execution time — so you can see exactly how the agent arrived at its answer.

---

## Available Tools

| Tool | Source | API Key? | What It Does |
|---|---|---|---|
| **Web Search** | DuckDuckGo | No | Search the internet for current information |
| **Weather** | Open-Meteo | No | Current weather for any city worldwide |
| **Calculator** | asteval | No | Safe evaluation of math expressions |
| **Summarizer** | Gemini | Shared | Condense long text into bullet points |
| **Date & Time** | Python | No | Current date, time, and day of week |
| **URL Reader** | requests + BeautifulSoup | No | Fetch and extract text from any webpage |

**Only 1 API key needed** (Gemini) — all other tools are free and keyless.

---

## How the Agent Works

```
User: "What's the weather in Tokyo and what's 2^32?"
  │
  ▼
Gemini receives message + tool definitions (function calling)
  │
  ├─► Decides to call get_weather(city="Tokyo")
  │     └─► Open-Meteo returns: 22°C, Partly cloudy
  │
  ├─► Decides to call calculate(expression="2**32")
  │     └─► asteval returns: 4294967296
  │
  ▼
Gemini receives both results, synthesizes final answer
  │
  ▼
"The weather in Tokyo is 22°C and partly cloudy. 2^32 = 4,294,967,296."
```

The agent can chain up to 10 tool calls per question and handles parallel tool use.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| LLM | Google Gemini API | gemini-3.6-flash with function calling |
| Backend | Python + FastAPI | Agent executor, tool registry, API |
| Frontend | Next.js 14 + React + Tailwind | Split-panel chat + reasoning UI |
| Search | DuckDuckGo Search | Free web search, no API key |
| Weather | Open-Meteo | Free weather data, no API key |
| Math | asteval | Safe math expression evaluation |
| Scraping | BeautifulSoup | Webpage text extraction |
| Hosting | Render + Vercel | Free tier, auto-deploy |

---

## Project Structure

```
AgentFlow/
├── backend/
│   ├── main.py                        # FastAPI app + CORS
│   ├── config.py                      # Settings via pydantic-settings
│   ├── Dockerfile                     # Render deployment
│   ├── routes/
│   │   ├── health.py                  # GET  /api/health
│   │   └── agent.py                   # POST /api/agent/chat
│   └── services/
│       ├── agent_executor.py          # Core agent loop with function calling
│       ├── tool_registry.py           # Tool declarations + dispatch
│       └── tools/
│           ├── search.py              # DuckDuckGo web search
│           ├── weather.py             # Open-Meteo weather
│           ├── calculator.py          # Safe math (asteval)
│           ├── summarizer.py          # Gemini text summarizer
│           ├── datetime_tool.py       # Current date/time
│           └── url_reader.py          # Webpage text extraction
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx               # Split panel: chat + reasoning timeline
        │   ├── layout.tsx             # Root layout
        │   └── globals.css            # Theme
        └── lib/
            └── api.ts                 # API client
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GOOGLE_API_KEY=your_key" > .env
uvicorn main:app --reload --port 10000
```

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:10000" > .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000)

---

## Deployment

| Component | Platform | Configuration |
|---|---|---|
| Backend | [Render](https://render.com) — Free | Root: `backend`, Runtime: Docker, Env: `GOOGLE_API_KEY` |
| Frontend | [Vercel](https://vercel.com) — Free | Root: `frontend`, Env: `NEXT_PUBLIC_API_URL` = Render URL |

---

Built by **[Badal Gupta](https://github.com/Cloudyboiii)** — MS Data Science, University at Albany (SUNY)
