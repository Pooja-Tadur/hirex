import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your HireX career assistant. Ask me about resumes, interviews, or job search tips. 👋" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/ai/chat`, { message: userMsg.content, history: newMessages }, { withCredentials: true });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble responding right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', boxShadow: '0 8px 25px rgba(59,130,246,0.4)' }}>
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl flex flex-col overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', height: '480px' }}>

          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-white font-bold text-sm">HireX Assistant</p>
              <p className="text-blue-100 text-xs">AI-powered career help</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                  Typing...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about resumes, interviews..."
              className="flex-1 px-3 py-2 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button onClick={sendMessage} disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;