import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Gamepad2, 
  User, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Radio, 
  Sparkles, 
  Trophy, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRoom } from '../../context/RoomContext';
import { soundFx } from '../../utils/soundEffects';
import { getAvatarById } from '../../utils/avatars';

export const Navbar = () => {
  const { currentUser, logout, isFirebaseConfigured } = useAuth();
  const { currentRoom } = useRoom();
  const navigate = useNavigate();
  const location = useLocation();

  const [soundEnabled, setSoundEnabled] = useState(soundFx.isSoundEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleSound = () => {
    const newState = soundFx.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFx.click();
  };

  const handleLogout = async () => {
    soundFx.click();
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const userAvatar = currentUser ? getAvatarById(currentUser.avatar) : null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '14px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => soundFx.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)'
          }}>
            <Gamepad2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-gaming)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ color: '#ffffff' }}>Together</span>
              <span className="text-gradient-purple">Play</span>
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600
            }}>
              Multiplayer Arena
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '28px',
        }} className="desktop-nav">
          <Link 
            to="/" 
            onClick={() => soundFx.click()}
            style={{
              color: location.pathname === '/' ? '#8b5cf6' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Home
          </Link>

          <Link 
            to="/lobby" 
            onClick={() => soundFx.click()}
            style={{
              color: location.pathname.startsWith('/lobby') ? '#8b5cf6' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={16} color="#06b6d4" />
            Play Lobby
          </Link>

          <Link 
            to="/dashboard" 
            onClick={() => soundFx.click()}
            style={{
              color: location.pathname === '/dashboard' ? '#8b5cf6' : 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trophy size={16} color="#f59e0b" />
            Dashboard
          </Link>

          {/* Active room indicator badge if in a room */}
          {currentRoom && (
            <Link
              to={`/room/${currentRoom.id}`}
              onClick={() => soundFx.click()}
              className="badge badge-purple"
              style={{
                textDecoration: 'none',
                padding: '6px 12px',
                animation: 'pulseAnim 2s infinite'
              }}
            >
              <span className="pulse-dot" style={{ backgroundColor: '#a855f7' }}></span>
              In Room ({currentRoom.code})
            </Link>
          )}
        </div>

        {/* Right Action Icons & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Sound FX Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              color: soundEnabled ? '#06b6d4' : 'var(--text-dim)',
              background: 'rgba(255, 255, 255, 0.04)'
            }}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* User profile dropdown button */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '30px',
                  padding: '4px 14px 4px 6px',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: userAvatar?.bg || 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  {userAvatar?.icon || '🎮'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="username-display">
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>
                    {currentUser.displayName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {currentUser.isGuest ? 'Guest Player' : 'Pro Member'}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '220px',
                    padding: '12px',
                    zIndex: 200,
                    backgroundColor: 'rgba(14, 20, 36, 0.95)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentUser.displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.email}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => {
                      soundFx.click();
                      setProfileDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trophy size={16} color="#8b5cf6" />
                    Gaming Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      color: '#f43f5e',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    {currentUser.isGuest ? 'Switch Player' : 'Log Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" onClick={() => soundFx.click()} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'rgba(10, 15, 28, 0.98)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Link
            to="/"
            onClick={() => { setMobileMenuOpen(false); soundFx.click(); }}
            style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}
          >
            Home
          </Link>
          <Link
            to="/lobby"
            onClick={() => { setMobileMenuOpen(false); soundFx.click(); }}
            style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}
          >
            Play Lobby
          </Link>
          <Link
            to="/dashboard"
            onClick={() => { setMobileMenuOpen(false); soundFx.click(); }}
            style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}
          >
            Dashboard
          </Link>
        </div>
      )}

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .username-display { display: block !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
