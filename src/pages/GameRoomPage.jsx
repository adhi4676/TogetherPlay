import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  LogOut, 
  RotateCcw, 
  Gamepad2, 
  MessageSquare, 
  Users, 
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { WaitingRoom } from '../components/lobby/WaitingRoom';
import { ChatPanel } from '../components/lobby/ChatPanel';
import { TicTacToe } from '../components/games/TicTacToe/TicTacToe';
import { ConnectFour } from '../components/games/ConnectFour/ConnectFour';
import { PlayerQuiz } from '../components/games/PlayerQuiz/PlayerQuiz';
import { soundFx } from '../utils/soundEffects';
import { getAvatarById } from '../utils/avatars';

export const GameRoomPage = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const { 
    currentRoom, 
    isHost, 
    opponent, 
    leaveRoom, 
    switchGame, 
    restartGame, 
    roomError 
  } = useRoom();

  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  if (!currentRoom) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{ maxWidth: '480px', padding: '40px 30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👾</div>
          <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.6rem', marginBottom: '10px' }}>
            Room Not Found or Disconnected
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {roomError || 'The match room may have expired, or you may have disconnected from the host.'}
          </p>
          <Link to="/lobby" className="btn btn-primary" onClick={() => soundFx.click()}>
            Return to Lobby
          </Link>
        </div>
      </div>
    );
  }

  // If waiting for guest, render WaitingRoom
  if (!currentRoom.guest) {
    return (
      <div style={{ padding: '30px 0 60px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <WaitingRoom />
        </div>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    soundFx.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hostAvatar = getAvatarById(currentRoom.host?.avatar);
  const guestAvatar = getAvatarById(currentRoom.guest?.avatar);

  const hostScore = currentRoom.scores?.[currentRoom.host?.id] || 0;
  const guestScore = currentRoom.scores?.[currentRoom.guest?.id] || 0;
  const drawScore = currentRoom.scores?.draws || 0;

  return (
    <div style={{ padding: '24px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Top Room Bar */}
        <div className="glass-panel" style={{
          padding: '16px 24px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          border: '1px solid var(--border-highlight)'
        }}>
          {/* Room info & game switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-purple" style={{ fontFamily: 'var(--font-mono)' }}>
                ROOM: {currentRoom.code}
              </span>
              <button
                onClick={copyCode}
                title="Copy Room Code"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Game Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Game:</span>
              <select
                value={currentRoom.selectedGame || 'tictactoe'}
                onChange={(e) => switchGame(e.target.value)}
                style={{
                  background: 'rgba(10, 15, 28, 0.9)',
                  color: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-gaming)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="tictactoe">⚡ Tic-Tac-Toe</option>
                <option value="connectfour">🔴 Connect Four</option>
                <option value="playerquiz">🧠 Player Quiz</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} color="#8b5cf6" />
              {chatOpen ? 'Hide Chat' : 'Show Chat'}
            </button>

            <button
              onClick={restartGame}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              title="Reset current match"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={leaveRoom}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              Leave Room
            </button>
          </div>
        </div>

        {/* Head-to-Head Scoreboard Bar */}
        <div className="glass-panel" style={{
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Host Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: hostAvatar.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
            }}>
              {hostAvatar.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                {currentRoom.host?.name} {currentRoom.host?.id === currentUser?.uid ? '(You)' : ''}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)' }}>
                Host • Symbol X / Purple
              </div>
            </div>
          </div>

          {/* Central Score Counters */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontFamily: 'var(--font-gaming)'
          }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c084fc' }}>
              {hostScore}
            </span>
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <div>VS</div>
              {drawScore > 0 && <div style={{ fontSize: '0.65rem' }}>{drawScore} Draws</div>}
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#67e8f9' }}>
              {guestScore}
            </span>
          </div>

          {/* Guest Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                {currentRoom.guest?.name} {currentRoom.guest?.id === currentUser?.uid ? '(You)' : ''}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                Guest • Symbol O / Cyan
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: guestAvatar.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
            }}>
              {guestAvatar.icon}
            </div>
          </div>
        </div>

        {/* Game Board & Live Chat Split Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: chatOpen ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }} className="game-chat-layout">
          {/* Active Game Container */}
          <div className="glass-panel" style={{
            padding: '30px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '520px',
            border: '1px solid var(--border-subtle)'
          }}>
            {currentRoom.selectedGame === 'tictactoe' && <TicTacToe />}
            {currentRoom.selectedGame === 'connectfour' && <ConnectFour />}
            {currentRoom.selectedGame === 'playerquiz' && <PlayerQuiz />}
          </div>

          {/* Live Chat Panel */}
          {chatOpen && (
            <div>
              <ChatPanel />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .game-chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
