"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { agentChat } from "@/lib/api";

/* ---- Types ---- */
interface ToolCall {
  tool: string;
  label: string;
  icon: string;
  input: Record<string, any>;
  output: any;
  duration_ms: number;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  tool_calls?: ToolCall[];
  total_time_ms?: number;
}

/* ---- Tool icon map ---- */
const TOOL_ICONS: Record<string, string> = {
  search: "🔍",
  cloud: "🌤️",
  calculator: "🧮",
  "file-text": "📝",
  clock: "🕐",
  globe: "🌐",
  tool: "🔧",
};

/* ---- Component ---- */
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const [showPanel, setShowPanel] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const panelEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    panelEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeToolCalls]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setActiveToolCalls([]);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await agentChat(q, history);

      // Set tool calls for the panel
      if (res.tool_calls?.length) {
        setActiveToolCalls(res.tool_calls);
      }

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: res.answer,
        tool_calls: res.tool_calls,
        total_time_ms: res.total_time_ms,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", content: e.message || "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "What's the weather in Tokyo and what's 2^32?",
    "Search for the latest AI news and summarize it",
    "What day is it and what's the square root of 1764?",
  ];

  const hasToolCalls = activeToolCalls.length > 0 || messages.some((m) => m.tool_calls?.length);
  const allToolCalls = activeToolCalls.length > 0
    ? activeToolCalls
    : [...messages].reverse().find((m) => m.tool_calls?.length)?.tool_calls || [];

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* ============================================================ */}
      {/*  CHAT PANEL                                                   */}
      {/* ============================================================ */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showPanel && hasToolCalls ? "lg:mr-0" : ""}`}>
        {/* Header */}
        <div className="border-b border-subtle/40 bg-panel/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-sky flex items-center justify-center shadow-lg shadow-violet/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">AgentFlow</h1>
              <p className="text-[11px] text-muted">AI Agent · 6 tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasToolCalls && (
              <button
                onClick={() => setShowPanel(!showPanel)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-muted hover:text-soft border border-subtle/60 hover:border-subtle transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {showPanel ? "Hide" : "Show"} reasoning
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setActiveToolCalls([]); }}
                className="w-8 h-8 rounded-lg border border-subtle/60 hover:border-subtle flex items-center justify-center text-muted hover:text-soft transition-all"
                title="Clear"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v8M14 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-6">
              <div className="max-w-lg w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-raised text-[11px] text-muted mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse-slow" />
                  Multi-tool agent with function calling
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100 mb-2 tracking-tight">
                  What can I help you with?
                </h2>
                <p className="text-[14px] text-muted leading-relaxed max-w-sm mx-auto mb-10">
                  I can search the web, check weather, do math, read URLs, and more.
                  Watch my reasoning in the side panel.
                </p>
                <div className="space-y-2">
                  {examples.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-panel hover:bg-raised border border-subtle/50 hover:border-subtle text-[13px] text-soft hover:text-zinc-200 transition-all group"
                    >
                      <span className="text-violet mr-2 opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-enter">
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-lg bg-raised text-[14px] text-zinc-200 leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="prose-answer">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.total_time_ms && (
                        <div className="flex items-center gap-3">
                          {msg.tool_calls && msg.tool_calls.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet/[0.08] text-violet text-[11px] font-medium">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                              </svg>
                              {msg.tool_calls.length} tool{msg.tool_calls.length > 1 ? "s" : ""} used
                            </span>
                          )}
                          <span className="text-[11px] text-muted">
                            {(msg.total_time_ms / 1000).toFixed(1)}s
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="animate-enter flex items-center gap-2 text-muted text-[13px]">
                  <span className="inline-block w-4 h-4 border-2 border-muted/30 border-t-violet rounded-full animate-spin" />
                  Working on it...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-subtle/40 bg-canvas/80 backdrop-blur-md px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask anything..."
                disabled={loading}
                className="w-full h-11 px-4 pr-11 rounded-xl bg-panel border border-subtle/60 text-[14px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet/30 focus:ring-1 focus:ring-violet/10 disabled:opacity-40 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet/90 hover:bg-violet flex items-center justify-center disabled:opacity-20 transition-all"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#101014" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/*  REASONING PANEL                                              */}
      {/* ============================================================ */}
      {showPanel && hasToolCalls && (
        <aside className="hidden lg:flex w-[380px] border-l border-subtle/40 bg-panel flex-col">
          <div className="px-5 py-4 border-b border-subtle/40">
            <h2 className="text-[13px] font-semibold text-zinc-200">Thought Process</h2>
            <p className="text-[11px] text-muted mt-0.5">Tools called by the agent</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-subtle/60" />

              <div className="space-y-4">
                {allToolCalls.map((tc, i) => (
                  <ToolCallCard key={i} call={tc} index={i} />
                ))}
              </div>
            </div>
            <div ref={panelEndRef} />
          </div>
        </aside>
      )}
    </div>
  );
}

/* ---- Tool Call Card ---- */
function ToolCallCard({ call, index }: { call: ToolCall; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const icon = TOOL_ICONS[call.icon] || "🔧";

  const colorMap: Record<string, string> = {
    search: "bg-sky/[0.08] border-sky/20",
    cloud: "bg-amber/[0.08] border-amber/20",
    calculator: "bg-mint/[0.08] border-mint/20",
    "file-text": "bg-violet/[0.08] border-violet/20",
    clock: "bg-coral/[0.08] border-coral/20",
    globe: "bg-sky/[0.08] border-sky/20",
  };
  const cardColor = colorMap[call.icon] || "bg-raised border-subtle";

  return (
    <div className="relative pl-9 animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Timeline dot */}
      <div className="absolute left-[11px] top-3 w-[9px] h-[9px] rounded-full bg-subtle border-2 border-panel z-10" />

      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left p-3 rounded-xl border ${cardColor} transition-all hover:brightness-110`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-[13px] font-medium text-zinc-200">{call.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-mono">{call.duration_ms}ms</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-mint/10 text-mint">done</span>
          </div>
        </div>

        {/* Input preview */}
        <p className="text-[11px] text-muted mt-1.5 truncate">
          {Object.entries(call.input).map(([k, v]) => `${k}: ${v}`).join(", ")}
        </p>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 animate-enter">
          <div className="p-2.5 rounded-lg bg-canvas border border-subtle/40">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Input</p>
            <pre className="text-[11px] text-soft font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(call.input, null, 2)}
            </pre>
          </div>
          <div className="p-2.5 rounded-lg bg-canvas border border-subtle/40">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Output</p>
            <pre className="text-[11px] text-soft font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {typeof call.output === "string" ? call.output : JSON.stringify(call.output, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
