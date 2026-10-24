import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Smile, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { getAvatarById } from '../../utils/avatars';
import { soundFx } from '../../utils/soundEffects';

export const ChatPanel = ({ isCompact = false }) => {
  const { currentUser } = useAuth();
  const { messages, sendMessage } = useRoom();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const prevCountRef = useRef(0);

  // Auto-scroll on new message
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Play sound if incoming from opponent
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUser?.uid) {
        soundFx.chat();
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, currentUser?.uid]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReactions = ['🎮 GG!', '🔥 Nice move!', '⚡ Hurry up!', '🤝 Rematch?'];

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: isCompact ? '400px' : '520px',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="#8b5cf6" />
          <span style={{ fontFamily: 'var(--font-gaming)', fontSize: '0.9rem', fontWeight: 700 }}>
            Room Comms
          </span>
        </div>
        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
          Realtime
        </span>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '0.85rem'
          }}>
            <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p>No messages yet.</p>
            <p style={{ fontSize: '0.75rem' }}>Say hello to your opponent!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            const avatar = getAvatarById(msg.senderAvatar);

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                {/* Avatar Icon */}
                <div
                  title={msg.senderName}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: avatar.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  {avatar.icon}
                </div>

                {/* Message Bubble Container */}
                <div style={{
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}>
                  {/* Sender Name & Time */}
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    marginBottom: '3px',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 600, color: isMe ? '#c084fc' : '#67e8f9' }}>
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isMe 
                      ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    wordBreak: 'break-word',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: isMe ? '0 4px 12px var(--accent-purple-glow)' : 'none'
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Pills */}
      <div style={{
        padding: '6px 12px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}>
        {quickReactions.map((reaction, i) => (
          <button
            key={i}
            onClick={() => {
              sendMessage(reaction);
              soundFx.click();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              padding: '3px 10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '8px',
        backgroundColor: 'rgba(10, 15, 26, 0.5)'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="input-field"
          style={{
            padding: '10px 14px',
            fontSize: '0.88rem',
            borderRadius: '10px'
          }}
          maxLength={150}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!inputText.trim()}
          style={{
            padding: '0 16px',
            borderRadius: '10px',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
