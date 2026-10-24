import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Radio, 
  PlusCircle, 
  LogIn, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { getAvatarById } from '../utils/avatars';
import { soundFx } from '../utils/soundEffects';

export const LobbyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isFirebaseConfigured } = useAuth();
  const { createRoom, joinRoom, loadingRoom, roomError, setRoomError } = useRoom();

  const [inputCode, setInputCode] = useState('');
  const [selectedDefaultGame, setSelectedDefaultGame] = useState('tictactoe');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'

  // Auto-fill code if present in URL
  useEffect(() => {
    const codeParam = searchParams.get('join');
    if (codeParam) {
      setInputCode(codeParam.toUpperCase());
      setActiveTab('join');
    }
  }, [searchParams]);

  const handleCreate = async () => {
    soundFx.click();
    await createRoom(selectedDefaultGame);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    soundFx.click();
    const success = await joinRoom(inputCode.trim());
    if (!success) {
      // error handled in RoomContext
    }
  };

  const userAvatar = currentUser ? getAvatarById(currentUser.avatar) : null;

  const gameOptions = [
    { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '⚡', desc: 'Fast tactical grid duel' },
    { id: 'connectfour', name: 'Connect Four', icon: '🔴', desc: '4-in-a-row gravity chips' },
    { id: 'playerquiz', name: 'Player Quiz', icon: '🧠', desc: '10-question head-to-head' }
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Top Header Card */}
        <div className="glass-panel" style={{
          padding: '28px 32px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          border: '1px solid var(--border-highlight)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: userAvatar?.bg || 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
            }}>
              {userAvatar?.icon || '🎮'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{currentUser?.displayName}</h2>
                <span className="badge badge-green">
                  <span className="pulse-dot"></span>
                  Online
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ready for matchmaking • {isFirebaseConfigured ? 'Firebase Cloud Active' : 'Realtime Sync Active'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setActiveTab('create'); setRoomError(null); soundFx.click(); }}
              className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 20px' }}
            >
              <PlusCircle size={18} />
              Create Room
            </button>
            <button
              onClick={() => { setActiveTab('join'); setRoomError(null); soundFx.click(); }}
              className={`btn ${activeTab === 'join' ? 'btn-cyan' : 'btn-secondary'}`}
              style={{ padding: '10px 20px' }}
            >
              <LogIn size={18} />
              Join Room
            </button>
          </div>
        </div>

        {/* Room Error Toast */}
        {roomError && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldAlert size={20} color="#f43f5e" />
            <div style={{ fontSize: '0.9rem' }}>{roomError}</div>
          </div>
        )}

        {/* Main Lobby View: Create vs Join */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {/* Create Room Box */}
          <div className="glass-panel" style={{
            padding: '32px',
            border: activeTab === 'create' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
            background: activeTab === 'create' ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}>
                <PlusCircle size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.25rem' }}>
                Host a Game Room
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Generates a unique 6-character room code. You can pick your starting game and wait for player 2 to enter.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Select Starting Game
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {gameOptions.map(game => (
                  <div
                    key={game.id}
                    onClick={() => { setSelectedDefaultGame(game.id); soundFx.click(); }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: selectedDefaultGame === game.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedDefaultGame === game.id ? '1px solid var(--accent-purple)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{game.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>{game.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{game.desc}</div>
                      </div>
                    </div>
                    {selectedDefaultGame === game.id && <CheckCircle2 size={18} color="#c084fc" />}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loadingRoom}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {loadingRoom ? 'Generating Room...' : 'Create & Enter Room'}
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Join Room Box */}
          <div className="glass-panel" style={{
            padding: '32px',
            border: activeTab === 'join' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            background: activeTab === 'join' ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#67e8f9'
              }}>
                <LogIn size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.25rem' }}>
                Join Existing Room
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Have a room code from a friend? Enter it below to immediately connect to their game session.
            </p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  6-Character Room Code
                </label>
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 7X8K2M"
                  maxLength={10}
                  className="input-field"
                  style={{
                    fontFamily: 'var(--font-gaming)',
                    fontSize: '1.25rem',
                    letterSpacing: '0.15em',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                lineHeight: 1.5
              }}>
                💡 Both players connect in real time. Once joined, turns, scores, and live chat are automatically synchronized.
              </div>

              <button
                type="submit"
                disabled={loadingRoom || !inputCode.trim()}
                className="btn btn-cyan"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {loadingRoom ? 'Connecting to Room...' : 'Connect to Game'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
