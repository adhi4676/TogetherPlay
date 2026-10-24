import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Mail, Lock, User, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from '../utils/avatars';
import { soundFx } from '../utils/soundEffects';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, loginAsGuest, isFirebaseConfigured } = useAuth();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('cyber-ninja');
  const [guestName, setGuestName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundFx.click();

    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await signup(email, password, displayName, selectedAvatar);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = async () => {
    soundFx.click();
    setLoading(true);
    try {
      await loginAsGuest(guestName, selectedAvatar);
      navigate('/lobby');
    } catch (err) {
      setError('Guest login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '36px 32px',
        border: '1px solid var(--border-highlight)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(124, 58, 237, 0.4)'
          }}>
            <Gamepad2 size={28} color="#ffffff" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.6rem', marginBottom: '6px' }}>
            {isLoginTab ? 'Player Sign In' : 'Create Gamer Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {isLoginTab 
              ? 'Enter your credentials to access your player stats.' 
              : 'Join TogetherPlay to track match history and climb rank.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(null); soundFx.click(); }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: isLoginTab ? 'var(--accent-purple)' : 'transparent',
              color: isLoginTab ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(null); soundFx.click(); }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: !isLoginTab ? 'var(--accent-purple)' : 'transparent',
              color: !isLoginTab ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sign Up Fields */}
          {!isLoginTab && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Choose Your Gaming Avatar
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  {AVATARS.map(avatar => {
                    const isSelected = selectedAvatar === avatar.id;
                    return (
                      <div
                        key={avatar.id}
                        onClick={() => { setSelectedAvatar(avatar.id); soundFx.click(); }}
                        style={{
                          aspectRatio: '1 / 1',
                          borderRadius: '12px',
                          background: avatar.bg,
                          border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 16px rgba(255,255,255,0.5)' : 'none',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.15s ease'
                        }}
                        title={avatar.name}
                      >
                        {avatar.icon}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Player Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. ApexStriker"
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    maxLength={20}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@example.com"
                className="input-field"
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {loading ? 'Processing...' : (isLoginTab ? 'Sign In to Arena' : 'Create Account')}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0 20px',
          color: 'var(--text-dim)',
          fontSize: '0.8rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          <span>OR QUICK PLAY</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        </div>

        {/* Guest Play Button */}
        <button
          type="button"
          onClick={handleGuestPlay}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px' }}
        >
          <Sparkles size={16} color="#06b6d4" />
          Continue as Instant Guest
        </button>
      </div>
    </div>
  );
};
