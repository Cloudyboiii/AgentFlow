"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { agentChat } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Wrench,
  ChevronDown,
  ChevronRight,
  User,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  Orbit,
  Paperclip,
  Mic,
  Zap
} from "lucide-react";

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

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

/* ---- Component ---- */
export default function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("agentflow_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("agentflow_sessions", JSON.stringify(sessions));
    } else {
      localStorage.removeItem("agentflow_sessions");
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, loading]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const handleNewChat = () => {
    setCurrentSessionId(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    let activeId = currentSessionId;
    let activeSessions = [...sessions];

    if (!activeId) {
      activeId = generateId();
      const newSession: ChatSession = {
        id: activeId,
        title: q.slice(0, 30) + (q.length > 30 ? "..." : ""),
        messages: [],
        updatedAt: Date.now(),
      };
      activeSessions = [newSession, ...activeSessions];
      setSessions(activeSessions);
      setCurrentSessionId(activeId);
    }

    const userMsg: Message = { id: generateId(), role: "user", content: q };
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeId) {
        return { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() };
      }
      return s;
    }));
    
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const targetSession = activeSessions.find(s => s.id === activeId);
      const history = targetSession?.messages.map((m) => ({ role: m.role, content: m.content })) || [];
      
      const res = await agentChat(q, history);

      const aiMsg: Message = {
        id: generateId(),
        role: "ai",
        content: res.answer,
        tool_calls: res.tool_calls,
        total_time_ms: res.total_time_ms,
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === activeId) {
          return { ...s, messages: [...s.messages, aiMsg], updatedAt: Date.now() };
        }
        return s;
      }).sort((a, b) => b.updatedAt - a.updatedAt));

    } catch (error: any) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeId) {
          return { ...s, messages: [...s.messages, { id: generateId(), role: "ai", content: error.message || "Failed to process request." }] };
        }
        return s;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="flex h-screen bg-space-900 text-text-primary font-sans selection:bg-accent-cyan/30 overflow-hidden relative">
      
      {/* Ambient Nebula Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-violet/10 blur-[150px] mix-blend-screen animate-aurora-shift" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/10 blur-[150px] mix-blend-screen animate-aurora-shift" style={{ animationDelay: '5s' }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="flex-shrink-0 h-full bg-space-900/80 backdrop-blur-md border-r border-space-700 flex flex-col z-30"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Orbit className="w-6 h-6 text-accent-cyan" />
                <span className="font-serif text-xl font-medium tracking-tight text-white">AgentFlow</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-space-800 rounded-md text-text-muted transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-3 pb-4 pt-2">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-3 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/20 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Interface
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
              <p className="px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Sessions</p>
              <div className="space-y-1">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      currentSessionId === session.id ? "bg-space-800 text-white shadow-inner" : "text-text-secondary hover:bg-space-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-50" />
                      <span className="truncate font-medium">{session.title}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      className={`p-1 text-text-muted hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-transparent z-10">
        
        {/* Top bar (Mobile toggle) */}
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 glass-panel rounded-md text-text-secondary hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto w-full pt-10 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-64 px-4 md:px-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-float">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-accent-cyan/20 blur-2xl rounded-full" />
                  <Orbit className="w-16 h-16 text-accent-cyan relative z-10" />
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-normal text-white tracking-tight mb-2">
                  {getGreeting()}, Badal
                </h1>
                <p className="text-text-secondary text-lg">System online and ready for deployment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full flex">
                    {msg.role === 'user' ? (
                      <div className="w-full flex justify-end">
                        <div className="bg-glass-cyan border border-accent-cyan/20 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] text-[1.05rem] leading-relaxed whitespace-pre-wrap shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center mt-1 shadow-lg shadow-accent-cyan/20">
                          <Orbit className="w-5 h-5 text-space-900" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1 flex flex-col gap-3">
                          
                          {/* Inline Tool Executions */}
                          {msg.tool_calls && msg.tool_calls.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {msg.tool_calls.map((tool, i) => (
                                <ToolChip key={i} tool={tool} />
                              ))}
                            </div>
                          )}

                          {/* Main Agent Answer */}
                          {msg.content && (
                            <div className="prose-answer text-white">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading Indicator */}
                {loading && (
                  <div className="w-full flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center mt-1 shadow-lg shadow-accent-cyan/20">
                      <Orbit className="w-5 h-5 text-space-900" />
                    </div>
                    <div className="flex-1 min-w-0 pt-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-fast shadow-[0_0_8px_#00f0ff]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-space-900 via-space-900 to-transparent pt-10 pb-8 px-4 md:px-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex flex-col glass-panel rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors focus-within:border-accent-cyan/40">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={messages.length === 0 ? "Initialize command sequence..." : "Write a command..."}
                disabled={loading}
                className="w-full max-h-[200px] min-h-[56px] bg-transparent text-white placeholder:text-text-muted resize-none focus:outline-none pt-4 pb-2 px-4 overflow-y-auto leading-relaxed custom-scrollbar disabled:opacity-50 text-[1.05rem]"
                rows={1}
              />
              
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-glass-hover rounded-lg text-text-secondary transition-colors" title="Attach module">
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  {messages.length === 0 && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass-light text-text-secondary text-xs font-mono border border-glass-light">
                      <Zap className="w-3.5 h-3.5 text-accent-cyan" />
                      AgentFlow <span className="text-accent-violet font-semibold">Nebula</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      input.trim() && !loading 
                        ? 'bg-accent-cyan text-space-900 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                        : 'bg-glass-light text-text-muted'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[11px] text-text-muted mt-4">
              AgentFlow Nebula is an AI system and can make mistakes. Verify critical outputs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---- Tool Chip Component ---- */
function ToolChip({ tool }: { tool: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col border border-space-700 rounded-lg bg-space-800/80 backdrop-blur-sm overflow-hidden w-fit max-w-full">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-space-700 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-text-primary font-medium text-[13px]">
          {expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          <Wrench className="w-3.5 h-3.5 text-accent-violet" />
          <span>{tool.label}</span>
        </div>
        <span className="text-[11px] text-text-muted ml-4">{tool.duration_ms}ms</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-space-700 bg-space-900/50"
          >
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 font-mono">Input</p>
                <pre className="text-[12px] text-accent-cyan font-mono bg-space-900 p-3 rounded-md border border-space-700 overflow-x-auto whitespace-pre-wrap break-all shadow-inner">
                  {JSON.stringify(tool.input, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 font-mono">Output</p>
                <pre className="text-[12px] text-text-primary font-mono bg-space-900 p-3 rounded-md border border-space-700 overflow-x-auto whitespace-pre-wrap break-all max-h-48 custom-scrollbar shadow-inner">
                  {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
