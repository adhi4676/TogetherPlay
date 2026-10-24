import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{ maxWidth: '440px', padding: '40px 30px' }}>
        <div style={{
          fontFamily: 'var(--font-gaming)',
          fontSize: '4.5rem',
          fontWeight: 900,
          color: 'var(--accent-purple)',
          lineHeight: 1,
          marginBottom: '16px'
        }}>
          404
        </div>
        <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.4rem', marginBottom: '10px' }}>
          Game Zone Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          The requested coordinate does not exist in the TogetherPlay arena.
        </p>
        <Link
          to="/"
          onClick={() => soundFx.click()}
          className="btn btn-primary"
        >
          <ArrowLeft size={16} />
          Back to Arena Home
        </Link>
      </div>
    </div>
  );
};
