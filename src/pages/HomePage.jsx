import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Users, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Radio, 
  MessageSquare,
  Trophy
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export const HomePage = () => {
  const games = [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe Arena',
      category: 'Classic Strategy',
      desc: 'The timeless 3×3 duel reinvented with real-time turn synchronization, glowing winning streaks, and instant rematches.',
      icon: '⚡',
      accent: '#8b5cf6',
      badge: '2 Players'
    },
    {
      id: 'connectfour',
      title: 'Connect Four Tactical',
      category: 'Gravity Grid',
      desc: 'Connect 4 chips horizontally, vertically, or diagonally on a 7×6 matrix. Pure tactical foresight and counterplay.',
      icon: '🔴',
      accent: '#06b6d4',
      badge: '2 Players'
    },
    {
      id: 'playerquiz',
      title: 'Player Quiz Showdown',
      category: 'Trivia & Intellect',
      desc: 'Test your gamer instincts, pop culture lore, and tactical knowledge in a fast-paced 10-question face-off.',
      icon: '🧠',
      accent: '#ec4899',
      badge: 'Head-to-Head'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Create a Private Room',
      desc: 'Hit "Create Room" to generate an encrypted 6-character room code in milliseconds.'
    },
    {
      num: '02',
      title: 'Invite Your Opponent',
      desc: 'Send the unique room code or share a direct link to any friend on another phone, PC, or tablet.'
    },
    {
      num: '03',
      title: 'Battle in Real Time',
      desc: 'Compete in Tic-Tac-Toe, Connect Four, or Player Quiz with live in-game chat and instant move sync.'
    }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        padding: '80px 0 60px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Status Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '24px' }}>
            <div className="badge badge-purple" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
              <span className="pulse-dot"></span>
              Real-Time Multiplayer Platform
            </div>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'var(--font-gaming)',
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            lineHeight: 1.15,
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            Play Together. <br />
            <span className="text-gradient-gaming">Compete Anywhere.</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            marginBottom: '36px',
            maxWidth: '620px',
            margin: '0 auto 36px'
          }}>
            Your personal multiplayer gaming space. Connect with friends across devices in private rooms with real-time moves, live chat, and zero friction.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/lobby"
              onClick={() => soundFx.click()}
              className="btn btn-primary"
              style={{ padding: '16px 36px', fontSize: '1.05rem' }}
            >
              <Gamepad2 size={20} />
              Start Playing
            </Link>

            <a
              href="#games"
              onClick={() => soundFx.click()}
              className="btn btn-secondary"
              style={{ padding: '16px 32px', fontSize: '1.05rem' }}
            >
              Explore Games
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Available Games Section */}
      <section id="games" style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-cyan" style={{ marginBottom: '10px' }}>
              Featured Roster
            </span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-gaming)' }}>
              Choose Your Battleground
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '8px auto 0' }}>
              Competitive two-player games optimized for instantaneous real-time responsiveness.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {games.map(game => (
              <div
                key={game.id}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${game.accent}`
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>{game.icon}</span>
                    <span className="badge badge-purple">{game.badge}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: game.accent, fontWeight: 700, marginBottom: '6px' }}>
                    {game.category}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#ffffff' }}>
                    {game.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    {game.desc}
                  </p>
                </div>

                <Link
                  to="/lobby"
                  onClick={() => soundFx.click()}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    border: `1px solid ${game.accent}40`,
                    background: `${game.accent}15`,
                    color: '#ffffff'
                  }}
                >
                  Play {game.title.split(' ')[0]}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Multiplayer Rooms Work Section */}
      <section style={{
        padding: '80px 0',
        backgroundColor: 'rgba(10, 15, 28, 0.4)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
              Simple & Instant
            </span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-gaming)' }}>
              How Multiplayer Rooms Work
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '8px auto 0' }}>
              No complicated server setups or downloads. Connect two screens in 3 simple steps.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '32px 24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-gaming)',
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: 'rgba(139, 92, 246, 0.1)',
                  position: 'absolute',
                  top: '12px',
                  right: '20px',
                  lineHeight: 1
                }}>
                  {step.num}
                </div>

                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid var(--border-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  marginBottom: '20px'
                }}>
                  {step.num}
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ffffff' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '80px 0 40px' }}>
        <div className="container">
          <div className="glass-panel" style={{
            padding: '50px 30px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.15))',
            border: '1px solid var(--border-highlight)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '2.4rem', marginBottom: '14px' }}>
              Ready to Challenge Your Friend?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 28px' }}>
              Jump straight into the multiplayer lobby now. Create a room, pick a game, and start competing.
            </p>
            <Link
              to="/lobby"
              onClick={() => soundFx.click()}
              className="btn btn-primary"
              style={{ padding: '16px 40px', fontSize: '1.1rem' }}
            >
              Enter Match Lobby
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
