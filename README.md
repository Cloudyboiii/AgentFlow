# AgentFlow Nebula 🌌

AgentFlow is a premium, AI-powered conversational agent interface built with modern web technologies. It features a completely custom **Nebula Theme**, delivering a futuristic, glassmorphic visual identity alongside a powerful Python/FastAPI backend capable of complex reasoning and tool execution via Google's Gemini models.

## ✨ Features

* **Multi-Chat Session Management**: Seamlessly manage multiple conversations. Sessions are automatically saved to local storage, allowing you to pick up right where you left off.
* **Agentic Tool Calling**: The backend AI isn't just a chatbot; it has access to tools (like web searching) and will dynamically decide when to use them to fulfill user requests.
* **The Nebula UI**: A breathtaking, deep space-inspired interface with electric cyan and neon violet accents, complete with ambient background animations and smooth glassmorphism.
* **Real-time Reasoning Panel**: Watch the AI work! Tool executions and latency metrics are rendered inline within the chat stream.

## 🛠️ Technology Stack

**Frontend**
* Framework: Next.js 14 (App Router)
* Styling: Tailwind CSS & custom glassmorphism utilities
* Animations: Framer Motion
* Typography: DM Sans & JetBrains Mono
* Icons: Lucide React

**Backend**
* Framework: FastAPI (Python)
* AI SDK: Google Generative AI (`google-genai`)
* Model: Gemini 1.5 Flash / Pro
* Utilities: DuckDuckGo Search, BeautifulSoup4

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Cloudyboiii/AgentFlow.git
cd AgentFlow
```

### 2. Backend Setup
The backend requires Python 3.10+ and a Google Gemini API key.
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```
Run the server:
```bash
python main.py
```
*The API will start on `http://localhost:10000`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The UI will be available at `http://localhost:3000`.*

## ☁️ Deployment

**Frontend (Vercel)**
1. Connect your repository to Vercel.
2. Set the Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`.
3. Deploy!

**Backend (Render)**
1. Connect your repository to Render as a Web Service.
2. Set the Build Command: `pip install -r requirements.txt`.
3. Set the Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Add Environment Variables:
   * `GOOGLE_API_KEY` = your API key
   * `FRONTEND_URL` = `https://agent-flow-wheat.vercel.app` (for CORS).
