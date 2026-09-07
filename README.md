# AgentFlow ⚡

**Multi-Tool AI Agent with Function Calling & Real-Time Reasoning**

Ask anything. Watch the agent think, pick tools, and build answers step by step.

[![Live Demo](https://img.shields.io/badge/Live_Demo-AgentFlow-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://agent-flow-wheat.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)

---

## What is AgentFlow?

AgentFlow is a full-stack AI agent that uses Gemini's native function calling to execute multi-step tool chains autonomously. Unlike a standard chatbot, it reasons about which tools to call, executes them, reads the results, and synthesizes a final answer.

Every tool call is shown inline in the chat — tool name, input, output, and execution time — so you can see exactly how the agent arrived at its answer.

**Try it live:** [agent-flow-wheat.vercel.app](https://agent-flow-wheat.vercel.app)

---

## Features

- **Native Function Calling** — Gemini returns structured function_call objects (not text to parse), making tool use reliable and schema-validated
- **6 Integrated Tools** — Web search, weather, calculator, URL reader, summarizer, date/time — all free, no extra API keys
- **Real-Time Tool Reasoning** — Every tool call shows inline with input, output, and execution latency
- **Multi-Session Management** — Multiple independent conversations persisted in localStorage
- **6 Pre-Built Workflow Cards** — One-click multi-tool workflows demonstrating agent capabilities
- **Conversation Memory** — Follow-up questions work with 3-turn context window

---

## Available Tools

| Tool | Source | API Key? | What It Does |
|---|---|---|---|
| **Web Search** | DuckDuckGo | No | Search the internet for current information |
| **Weather** | Open-Meteo | No | Current weather for any city worldwide |
| **Calculator** | asteval | No | Safe math expression evaluation |
| **Summarizer** | Gemini | Shared | Condense long text into bullet points |
| **Date & Time** | Python stdlib | No | Current date, time, and day of week |
| **URL Reader** | BeautifulSoup | No | Extract readable text from any webpage |

**Total infrastructure cost: $0** — only a free Gemini API key is needed.

---

## How It Works

User sends message
→ Gemini receives message + tool declarations + conversation history
→ Gemini returns structured function_call object
→ Agent executes tool → gets result
→ Sends function_response back to Gemini
→ Repeats until Gemini returns final text (max 10 iterations)
→ Frontend renders answer + full tool call log


---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| LLM | Google Gemini API | gemini-3.6-flash with native function calling |
| Backend | Python + FastAPI | Agent executor, tool registry, REST API |
| Frontend | Next.js 14 + React + Tailwind CSS | Multi-session chat UI with inline tool reasoning |
| Search | DuckDuckGo | Free web search, no API key |
| Weather | Open-Meteo | Free weather data, no API key |
| Math | asteval | Safe math evaluation (not eval) |
| Scraping | BeautifulSoup4 | Webpage text extraction |
| Hosting | Render + Vercel | Free tier, auto-deploy from GitHub |

---

## Project Structure

```text
AgentFlow/
├── backend/
│ ├── main.py # FastAPI app + CORS
│ ├── config.py # Settings (MAX_TOOL_ITERATIONS=10)
│ ├── Dockerfile
│ ├── routes/
│ │ ├── health.py # GET /api/health
│ │ └── agent.py # POST /api/agent/chat
│ └── services/
│ ├── agent_executor.py # Core agent loop with function calling
│ ├── tool_registry.py # Tool declarations + dispatch
│ └── tools/
│ ├── search.py # DuckDuckGo web search
│ ├── weather.py # Open-Meteo weather
│ ├── calculator.py # Safe math (asteval)
│ ├── summarizer.py # Gemini text summarizer
│ ├── datetime_tool.py # Current date/time
│ └── url_reader.py # Webpage text extraction
│
└── frontend/
└── src/
├── app/
│ ├── page.tsx # Multi-session chat + workflow cards
│ ├── layout.tsx
│ └── globals.css
└── lib/
└── api.ts # API client
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
| Backend | [Render](https://render.com) — Free | Root: `backend`, Runtime: Docker, Env: `GOOGLE_API_KEY` + `FRONTEND_URL` |
| Frontend | [Vercel](https://vercel.com) — Free | Root: `frontend`, Env: `NEXT_PUBLIC_API_URL` = Render URL |

---

## Technical Documentation

See [docs/architecture.md](docs/architecture.md) for full system architecture, API reference, agent loop design, tool reference, and design decisions.

---

Built by **[Badal Gupta](https://github.com/Cloudyboiii)** — MS Data Science, University at Albany (SUNY)
