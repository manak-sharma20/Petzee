import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { consultationsAPI } from '../api/index.js';

export default function ConsultationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinConsultation, sendMessage, emitTyping, onEvent, offEvent } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load history & join room
  useEffect(() => {
    const init = async () => {
      try {
        const [histRes, conRes] = await Promise.all([
          consultationsAPI.getMessages(id),
          consultationsAPI.list(),
        ]);
        setMessages(histRes.data.data?.messages ?? []);
        const found = conRes.data.data?.find((c) => c.id === id);
        setConsultation(found);
      } catch { toast.error('Could not load consultation'); }
      finally { setLoading(false); }
    };
    init();
    joinConsultation(id);
  }, [id]);

  // Socket listeners
  useEffect(() => {
    const onMsg = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ name, userId }) => { if (userId !== user.id) setTypingUser(name); };
    const onStop = () => setTypingUser(null);
    const onClose = () => toast('Consultation ended', { icon: '🔒' });

    onEvent('new-message', onMsg);
    onEvent('typing', onTyping);
    onEvent('stop-typing', onStop);
    onEvent('consultation-closed', onClose);

    return () => {
      offEvent('new-message', onMsg);
      offEvent('typing', onTyping);
      offEvent('stop-typing', onStop);
      offEvent('consultation-closed', onClose);
    };
  }, [user.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(id, input.trim());
    setInput('');
    emitTyping(id, false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    emitTyping(id, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(id, false), 1500);
  };

  const handleClose = async () => {
    try {
      await consultationsAPI.close(id);
      toast.success('Consultation closed');
    } catch { toast.error('Failed to close'); }
  };

  const other = user.role === 'VET' ? consultation?.owner : consultation?.vet;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', background: 'rgba(247,249,252,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(192,199,211,0.3)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Link>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
          {other?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-headline)', color: 'var(--on-surface)' }}>
            {user.role === 'VET' ? 'Consultation' : `Dr. ${other?.name ?? '…'}`}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
            {consultation?.pet?.name ? `About ${consultation.pet.name}` : 'Loading…'}
          </div>
        </div>
        {consultation?.status !== 'CLOSED' && (
          <button className="btn btn-sm" style={{ background: 'var(--error-container)', color: 'var(--error)' }} onClick={handleClose}>
            <X size={14} /> End
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius-lg)', maxWidth: '60%', alignSelf: i % 2 ? 'flex-end' : 'flex-start' }} />)
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--outline)' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <p>Send a message to start the consultation</p>
          </div>
        ) : messages.map((msg) => {
          const own = msg.sender?.id === user.id || msg.senderId === user.id;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start', gap: '0.25rem' }}>
              {!own && <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', paddingLeft: '0.75rem' }}>{msg.sender?.name}</span>}
              <div className={`message-bubble ${own ? 'own' : 'other'}`}>{msg.content}</div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--outline)', padding: '0 0.75rem' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        })}
        {typingUser && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingLeft: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--outline)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--outline)' }}>{typingUser} is typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {consultation?.status !== 'CLOSED' ? (
        <form onSubmit={handleSend} className="chat-input-bar" style={{ borderTop: '1px solid rgba(192,199,211,0.3)' }}>
          <input
            className="form-input"
            style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
            placeholder="Type your message…"
            value={input}
            onChange={handleTyping}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, flexShrink: 0 }} disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--surface-container)', color: 'var(--outline)', fontSize: '0.875rem' }}>
          This consultation has been closed.
        </div>
      )}

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
