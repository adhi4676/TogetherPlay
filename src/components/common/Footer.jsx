import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Shield, Zap, Users, HeartHandshake, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'rgba(7, 10, 18, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '50px 0 24px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gamepad2 size={20} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-gaming)', fontWeight: 800, fontSize: '1.25rem' }}>
                Together<span className="text-gradient-purple">Play</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
              Play Together. Compete Anywhere. Private real-time multiplayer gaming designed for two players across devices.
            </p>
            <div className="badge badge-green">
              <span className="pulse-dot"></span>
              Multiplayer Matchmaking Online
            </div>
          </div>

          {/* Quick Games */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-gaming)', fontSize: '0.95rem', marginBottom: '16px', color: '#ffffff' }}>
              Multiplayer Games
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/lobby" onClick={() => soundFx.click()} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                ⚡ Tic-Tac-Toe Arena
              </Link>
              <Link to="/lobby" onClick={() => soundFx.click()} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                🔴 Connect Four Tactical
              </Link>
              <Link to="/lobby" onClick={() => soundFx.click()} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                🧠 Player Quiz Showdown
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-gaming)', fontSize: '0.95rem', marginBottom: '16px', color: '#ffffff' }}>
              Platform Tech
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} color="#06b6d4" />
                Firebase Realtime Synchronization
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#8b5cf6" />
                Private 6-Digit Room Security
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#10b981" />
                Instant Cross-Device Peer Access
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          color: 'var(--text-dim)',
          fontSize: '0.85rem'
        }}>
          <div>
            © {new Date().getFullYear()} TogetherPlay Gaming Arena. Built with React, Vite & Firebase.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Zero Ads</span>
            <span>•</span>
            <span>Private Rooms</span>
            <span>•</span>
            <span>Pure Competition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
