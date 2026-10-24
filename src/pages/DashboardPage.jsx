import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Gamepad2, 
  Award, 
  Swords, 
  TrendingUp, 
  Clock, 
  Edit3, 
  Check, 
  Radio, 
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS, getAvatarById } from '../utils/avatars';
import { soundFx } from '../utils/soundEffects';

export const DashboardPage = () => {
  const { currentUser, userStats, updateAvatar, updateUsername, isFirebaseConfigured } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.displayName || '');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const userAvatar = currentUser ? getAvatarById(currentUser.avatar) : AVATARS[0];

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateUsername(nameInput.trim());
      setEditingName(false);
      soundFx.click();
    }
  };

  const handleSelectAvatar = async (avatarId) => {
    await updateAvatar(avatarId);
    setAvatarModalOpen(false);
    soundFx.click();
  };

  const totalGames = userStats?.gamesPlayed || 0;
  const wins = userStats?.wins || 0;
  const losses = userStats?.losses || 0;
  const draws = userStats?.draws || 0;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const matchHistory = userStats?.history || [];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Profile Header Card */}
        <div className="glass-panel" style={{
          padding: '36px 32px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          border: '1px solid var(--border-highlight)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar with edit overlay */}
            <div
              onClick={() => { setAvatarModalOpen(true); soundFx.click(); }}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: userAvatar.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                cursor: 'pointer',
                boxShadow: '0 0 24px var(--accent-purple-glow)',
                position: 'relative'
              }}
              title="Click to change avatar"
            >
              {userAvatar.icon}
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #090d16'
              }}>
                <Edit3 size={12} color="#ffffff" />
              </div>
            </div>

            {/* User info & name edit */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                {editingName ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="input-field"
                      style={{ padding: '6px 12px', fontSize: '1rem', width: '180px' }}
                      maxLength={20}
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-gaming)' }}>
                      {currentUser?.displayName}
                    </h1>
                    <button
                      onClick={() => { setEditingName(true); setNameInput(currentUser?.displayName || ''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Edit Gamer Tag"
                    >
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-green">
                  <span className="pulse-dot"></span>
                  Active Challenger
                </span>
                <span className="badge badge-purple">
                  {currentUser?.isGuest ? 'Guest Player' : 'Verified Member'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  ID: {currentUser?.uid?.substring(0, 10)}...
                </span>
              </div>
            </div>
          </div>

          {/* Quick Matchmaking CTA */}
          <div>
            <Link
              to="/lobby"
              onClick={() => soundFx.click()}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <Radio size={18} />
              Enter Match Lobby
            </Link>
          </div>
        </div>

        {/* Player Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Total Matches */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Matches</span>
              <Swords size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-gaming)' }}>
              {totalGames}
            </div>
          </div>

          {/* Victories */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Victories</span>
              <Trophy size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-gaming)', color: '#34d399' }}>
              {wins}
            </div>
          </div>

          {/* Defeats */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Defeats</span>
              <TrendingUp size={20} color="#f43f5e" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-gaming)', color: '#fda4af' }}>
              {losses}
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Win Rate</span>
              <Percent size={20} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-gaming)', color: '#67e8f9' }}>
              {winRate}%
            </div>
          </div>
        </div>

        {/* Lower Split: Match History & Available Games */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '28px'
        }}>
          {/* Recent Match History */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.2rem' }}>
                Recent Matches
              </h3>
              <span className="badge badge-purple">
                {matchHistory.length} Matches Logged
              </span>
            </div>

            {matchHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No matches recorded yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Create or join a room to play your first match!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {matchHistory.map((match) => {
                  const isWin = match.result === 'win';
                  const isLoss = match.result === 'loss';

                  return (
                    <div
                      key={match.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {match.game}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          vs {match.opponent} • {new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <span className={`badge ${isWin ? 'badge-green' : (isLoss ? 'badge-amber' : 'badge-purple')}`}>
                        {isWin ? 'VICTORY' : (isLoss ? 'DEFEAT' : 'DRAW')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Launch Games */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.2rem', marginBottom: '20px' }}>
              Instant Quick Play
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Link
                to="/lobby"
                onClick={() => soundFx.click()}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.8rem' }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tic-Tac-Toe Arena</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3×3 fast-paced duel</div>
                  </div>
                </div>
                <ArrowRight size={18} color="#8b5cf6" />
              </Link>

              <Link
                to="/lobby"
                onClick={() => soundFx.click()}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🔴</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Connect Four Tactical</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7×6 gravity strategy</div>
                  </div>
                </div>
                <ArrowRight size={18} color="#06b6d4" />
              </Link>

              <Link
                to="/lobby"
                onClick={() => soundFx.click()}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🧠</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Player Quiz Showdown</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10-question face-off</div>
                  </div>
                </div>
                <ArrowRight size={18} color="#ec4899" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {avatarModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '460px',
            width: '100%',
            padding: '30px',
            backgroundColor: 'rgba(14, 20, 36, 0.95)',
            border: '1px solid var(--border-highlight)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.3rem', marginBottom: '8px' }}>
              Select Gaming Avatar
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Choose your profile emblem visible to all opponents in match lobbies.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {AVATARS.map(avatar => (
                <div
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.id)}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '14px',
                    background: avatar.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    boxShadow: currentUser?.avatar === avatar.id ? '0 0 16px rgba(255,255,255,0.6)' : 'none',
                    border: currentUser?.avatar === avatar.id ? '3px solid #ffffff' : '2px solid transparent',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={avatar.name}
                >
                  {avatar.icon}
                </div>
              ))}
            </div>

            <button
              onClick={() => setAvatarModalOpen(false)}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
