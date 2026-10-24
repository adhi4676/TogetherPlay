import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRoom } from '../../../context/RoomContext';
import { checkWinner } from './tttLogic';
import { soundFx } from '../../../utils/soundEffects';

export const TicTacToe = () => {
  const { currentUser, recordMatchResult } = useAuth();
  const { currentRoom, isHost, opponent, updateGameState, restartGame } = useRoom();
  const [resultRecorded, setResultRecorded] = useState(false);

  const gameState = currentRoom?.gameState || {
    board: Array(9).fill(null),
    currentTurn: currentRoom?.host?.id,
    winner: null,
    winningLine: null
  };

  const isMyTurn = Boolean(currentUser && gameState.currentTurn === currentUser.uid);
  const mySymbol = isHost ? 'X' : 'O';
  const opponentSymbol = isHost ? 'O' : 'X';

  const isGameOver = Boolean(gameState.winner);
  const isDraw = gameState.winner === 'draw';
  const isWinnerMe = Boolean(gameState.winner && gameState.winner === currentUser?.uid);
  const isWinnerOpponent = Boolean(gameState.winner && !isDraw && !isWinnerMe);

  // Victory fanfare and stat record
  useEffect(() => {
    if (gameState.winner && !resultRecorded) {
      if (gameState.winner === 'draw') {
        recordMatchResult('Tic-Tac-Toe', opponent?.name || 'Opponent', 'draw');
      } else if (gameState.winner === currentUser?.uid) {
        soundFx.win();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        recordMatchResult('Tic-Tac-Toe', opponent?.name || 'Opponent', 'win');
      } else {
        recordMatchResult('Tic-Tac-Toe', opponent?.name || 'Opponent', 'loss');
      }
      setResultRecorded(true);
    } else if (!gameState.winner) {
      setResultRecorded(false);
    }
  }, [gameState.winner, currentUser?.uid]);

  const handleCellClick = (index) => {
    // Prevent move if:
    // 1. Not my turn
    // 2. Cell already occupied
    // 3. Game already ended
    // 4. Opponent not connected yet
    if (!currentRoom?.guest) return;
    if (!isMyTurn || gameState.board[index] !== null || gameState.winner) return;

    soundFx.move();

    const newBoard = [...gameState.board];
    newBoard[index] = mySymbol;

    const winResult = checkWinner(newBoard);

    let winnerId = null;
    let winningLine = null;

    if (winResult) {
      if (winResult.winnerSymbol === 'draw') {
        winnerId = 'draw';
      } else {
        winnerId = currentUser.uid;
        winningLine = winResult.line;
      }
    }

    const nextTurn = opponent?.id;

    const updatedGameState = {
      ...gameState,
      board: newBoard,
      currentTurn: winnerId ? null : nextTurn,
      winner: winnerId,
      winningLine: winningLine,
      lastMoveAt: Date.now()
    };

    // Update scores if match ended
    let updatedScores = null;
    if (winnerId) {
      updatedScores = {
        ...currentRoom.scores,
        [winnerId === 'draw' ? 'draws' : winnerId]: (currentRoom.scores?.[winnerId === 'draw' ? 'draws' : winnerId] || 0) + 1
      };
    }

    updateGameState(updatedGameState, updatedScores);
  };

  const handleRestart = () => {
    restartGame();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
      maxWidth: '520px',
      margin: '0 auto'
    }}>
      {/* Game Turn & Status Banner */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: isGameOver 
          ? (isWinnerMe ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)')
          : (isMyTurn ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)')
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: mySymbol === 'X' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-gaming)',
            fontWeight: 800,
            fontSize: '1.2rem',
            color: mySymbol === 'X' ? '#c084fc' : '#67e8f9'
          }}>
            {mySymbol}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              You are playing as
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {mySymbol === 'X' ? 'Player X (Purple)' : 'Player O (Cyan)'}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        {!currentRoom?.guest ? (
          <span className="badge badge-amber">Waiting for Player 2</span>
        ) : isGameOver ? (
          isDraw ? (
            <span className="badge badge-amber">Match Drawn!</span>
          ) : isWinnerMe ? (
            <span className="badge badge-purple" style={{ boxShadow: '0 0 15px var(--accent-purple-glow)' }}>
              <Trophy size={14} /> You Won!
            </span>
          ) : (
            <span className="badge badge-cyan">Opponent Won</span>
          )
        ) : (
          <span className={`badge ${isMyTurn ? 'badge-green' : 'badge-purple'}`}>
            <span className="pulse-dot" style={{ backgroundColor: isMyTurn ? '#10b981' : '#8b5cf6' }}></span>
            {isMyTurn ? 'Your Turn to Move' : `${opponent?.name || 'Opponent'}'s Turn`}
          </span>
        )}
      </div>

      {/* 3x3 Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '420px',
        aspectRatio: '1 / 1',
        padding: '16px',
        background: 'rgba(12, 17, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {gameState.board.map((cell, idx) => {
          const isWinningCell = gameState.winningLine?.includes(idx);
          const canClick = isMyTurn && cell === null && !isGameOver && currentRoom?.guest;

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={!canClick}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                background: isWinningCell 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isWinningCell 
                  ? '2px solid var(--accent-cyan)' 
                  : '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontFamily: 'var(--font-gaming)',
                fontWeight: 900,
                cursor: canClick ? 'pointer' : 'default',
                color: cell === 'X' ? '#c084fc' : '#67e8f9',
                textShadow: cell === 'X' 
                  ? '0 0 20px rgba(139, 92, 246, 0.6)' 
                  : '0 0 20px rgba(6, 182, 212, 0.6)',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isWinningCell ? '0 0 20px rgba(6, 182, 212, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (canClick) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'scale(0.97)';
                }
              }}
              onMouseLeave={(e) => {
                if (canClick) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {/* Restart / Game Controls */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <button
          onClick={handleRestart}
          className="btn btn-secondary"
          style={{ padding: '10px 20px', borderRadius: '12px' }}
        >
          <RotateCcw size={16} />
          {isGameOver ? 'Play Again' : 'Reset Board'}
        </button>
      </div>
    </div>
  );
};
