import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  LogOut, 
  Play, 
  Gamepad2, 
  Users, 
  Clock, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { getAvatarById } from '../../utils/avatars';
import { soundFx } from '../../utils/soundEffects';

export const WaitingRoom = () => {
  const { currentUser } = useAuth();
  const { currentRoom, isHost, leaveRoom, switchGame, updateGameState } = useRoom();
  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const hostAvatar = getAvatarById(currentRoom.host?.avatar);
  const guestAvatar = currentRoom.guest ? getAvatarById(currentRoom.guest.avatar) : null;

  const copyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    soundFx.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    const inviteUrl = `${window.location.origin}/lobby?join=${currentRoom.code}`;
    navigator.clipboard.writeText(inviteUrl);
    soundFx.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableGames = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      desc: 'Fast-paced 3×3 grid classic duel',
      icon: '⚡',
      badge: 'Classic'
    },
    {
      id: 'connectfour',
      name: 'Connect Four',
      desc: '7×6 gravity grid, connect 4 chips to win',
      icon: '🔴',
      badge: 'Tactical'
    },
    {
      id: 'playerquiz',
      name: 'Player Quiz',
      desc: '10-question gamer trivia & duel showdown',
      icon: '🧠',
      badge: 'Trivia'
    }
  ];

  const handleStartGame = () => {
    if (!currentRoom.guest) return;
    soundFx.join();
    // Update room status to 'in-game'
    updateGameState(currentRoom.gameState);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Room Banner */}
      <div className="glass-panel" style={{
        padding: '24px 30px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        border: '1px solid var(--border-highlight)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-purple">Private Lobby</span>
            <span className="badge badge-cyan">
              <span className="pulse-dot"></span>
              {currentRoom.guest ? '2 / 2 Players' : '1 / 2 Players Connected'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-gaming)' }}>
            Room Code: <span style={{ color: '#06b6d4', letterSpacing: '0.1em' }}>{currentRoom.code}</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Share this code or link with your friend to jump straight into the arena.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={copyCode}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Code Copied!' : 'Copy Code'}
          </button>

          <button
            onClick={copyLink}
            className="btn btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <Share2 size={16} />
            Copy Invite Link
          </button>

          <button
            onClick={leaveRoom}
            className="btn btn-danger"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>
      </div>

      {/* Players Duel Display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {/* Player 1 Card (Host) */}
        <div className="glass-panel" style={{
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.7rem'
          }} className="badge badge-purple">
            HOST (Player 1)
          </div>

          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: hostAvatar.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}>
            {hostAvatar.icon}
          </div>

          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
            {currentRoom.host?.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
            {currentRoom.host?.id === currentUser?.uid ? 'You' : 'Host Player'}
          </p>

          <div className="badge badge-green">
            <span className="pulse-dot"></span>
            Online & Ready
          </div>
        </div>

        {/* VS Center Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            fontFamily: 'var(--font-gaming)',
            fontSize: '2rem',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.2)',
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
          }}>
            VS
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Realtime 1v1 Sync
          </div>
        </div>

        {/* Player 2 Card (Guest or Waiting) */}
        <div className="glass-panel" style={{
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          border: currentRoom.guest ? '1px solid rgba(6, 182, 212, 0.3)' : '1px dashed rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.7rem'
          }} className={currentRoom.guest ? 'badge badge-cyan' : 'badge badge-amber'}>
            {currentRoom.guest ? 'GUEST (Player 2)' : 'WAITING FOR OPPONENT'}
          </div>

          {currentRoom.guest ? (
            <>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: guestAvatar?.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                margin: '0 auto 16px',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}>
                {guestAvatar?.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                {currentRoom.guest.name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                {currentRoom.guest.id === currentUser?.uid ? 'You' : 'Opponent'}
              </p>
              <div className="badge badge-green">
                <span className="pulse-dot"></span>
                Connected
              </div>
            </>
          ) : (
            <div style={{ padding: '16px 0' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-dim)'
              }}>
                <Clock size={32} className="animate-float" />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Waiting for Player 2...
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '16px' }}>
                Send code <strong style={{ color: '#06b6d4' }}>{currentRoom.code}</strong> to your opponent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Game Selection Section */}
      <div className="glass-panel" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.15rem' }}>
              Select Multiplayer Game
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Choose which game both players will duel in.
            </p>
          </div>
          {isHost ? (
            <span className="badge badge-purple">You are Host (Selector)</span>
          ) : (
            <span className="badge badge-cyan">Host chooses game</span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {availableGames.map(game => {
            const isSelected = currentRoom.selectedGame === game.id;

            return (
              <div
                key={game.id}
                onClick={() => {
                  if (isHost) switchGame(game.id);
                }}
                className={`glass-panel ${isHost ? 'glass-panel-interactive' : ''}`}
                style={{
                  padding: '18px',
                  border: isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
                  cursor: isHost ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{game.icon}</span>
                  <span className={`badge ${isSelected ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                    {isSelected ? 'ACTIVE' : game.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: '4px', color: '#ffffff' }}>
                  {game.name}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {game.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
