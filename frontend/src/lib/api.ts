const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export async function agentChat(message: string, conversationHistory: any[] = []) {
  const res = await fetch(`${API_BASE}/api/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_history: conversationHistory }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}
