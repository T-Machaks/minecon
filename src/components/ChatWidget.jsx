import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-xl shadow-2xl border border-white/10 bg-[#1a2332] overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 6rem)' }}>

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-amber/10 border-b border-white/10">
            <Bot size={18} className="text-amber" />
            <span className="text-sm font-semibold text-white">MineCon Assistant</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: '400px' }}>
            {messages.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">
                <Bot size={32} className="mx-auto mb-2 text-amber/50" />
                <p className="font-medium text-slate-300">Hi! I'm your MineCon assistant.</p>
                <p className="mt-1 text-xs">Ask me about exhibitors, the schedule, venue, or anything about the event.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber text-slate-900 font-medium'
                    : 'bg-white/8 text-slate-200 border border-white/10'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 bg-white/8 border border-white/10 flex items-center gap-2 text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts — only before first message */}
          {messages.length === 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {['Diamond exhibitors', 'Event schedule', 'Venue & directions'].map(p => (
                <button key={p} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="text-xs px-2 py-1 rounded-full border border-amber/30 text-amber/80 hover:bg-amber/10 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about MineCon…"
              className="flex-1 resize-none bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber/50 leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '100px' }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber hover:bg-amber/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
              <Send size={15} className="text-slate-900" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-50 w-13 h-13 rounded-full bg-amber hover:bg-amber/80 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ width: '52px', height: '52px' }}
        aria-label="Open MineCon Assistant"
      >
        {open ? <X size={22} className="text-slate-900" /> : <MessageCircle size={22} className="text-slate-900" />}
      </button>
    </>
  );
}
