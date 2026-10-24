import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, CircleDot } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRoom } from '../../../context/RoomContext';
import { 
  ROWS, 
  COLS, 
  findLowestEmptyRow, 
  checkConnectFourWinner 
} from './connectFourLogic';
import { soundFx } from '../../../utils/soundEffects';

export const ConnectFour = () => {
  const { currentUser, recordMatchResult } = useAuth();
  const { currentRoom, isHost, opponent, updateGameState, restartGame } = useRoom();
  const [hoveredCol, setHoveredCol] = useState(null);
  const [resultRecorded, setResultRecorded] = useState(false);

  const gameState = currentRoom?.gameState || {
    board: Array(6).fill(null).map(() => Array(7).fill(null)),
    currentTurn: currentRoom?.host?.id,
    winner: null,
    winningCells: []
  };

  const isMyTurn = Boolean(currentUser && gameState.currentTurn === currentUser.uid);
  const myPlayerId = currentUser?.uid;
  const isGameOver = Boolean(gameState.winner);
  const isDraw = gameState.winner === 'draw';
  const isWinnerMe = Boolean(gameState.winner && gameState.winner === currentUser?.uid);

  // My chip color vs Opponent chip color
  // Host gets electric purple (#8b5cf6), Guest gets electric cyan (#06b6d4)
  const myColor = isHost ? '#8b5cf6' : '#06b6d4';
  const myChipLabel = isHost ? 'Purple' : 'Cyan';

  // Fanfare & match record
  useEffect(() => {
    if (gameState.winner && !resultRecorded) {
      if (gameState.winner === 'draw') {
        recordMatchResult('Connect Four', opponent?.name || 'Opponent', 'draw');
      } else if (gameState.winner === currentUser?.uid) {
        soundFx.win();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
        recordMatchResult('Connect Four', opponent?.name || 'Opponent', 'win');
      } else {
        recordMatchResult('Connect Four', opponent?.name || 'Opponent', 'loss');
      }
      setResultRecorded(true);
    } else if (!gameState.winner) {
      setResultRecorded(false);
    }
  }, [gameState.winner, currentUser?.uid]);

  const handleColumnClick = (colIndex) => {
    if (!currentRoom?.guest) return;
    if (!isMyTurn || isGameOver) return;

    const targetRow = findLowestEmptyRow(gameState.board, colIndex);
    if (targetRow === -1) return; // Column full

    soundFx.drop();

    // Clone 2D board
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetRow][colIndex] = myPlayerId;

    const winResult = checkConnectFourWinner(newBoard);

    let winnerId = null;
    let winningCells = [];

    if (winResult) {
      if (winResult.winner === 'draw') {
        winnerId = 'draw';
      } else {
        winnerId = winResult.winner;
        winningCells = winResult.winningCells;
      }
    }

    const nextTurn = opponent?.id;

    const updatedGameState = {
      ...gameState,
      board: newBoard,
      currentTurn: winnerId ? null : nextTurn,
      winner: winnerId,
      winningCells: winningCells,
      lastMoveAt: Date.now()
    };

    let updatedScores = null;
    if (winnerId) {
      updatedScores = {
        ...currentRoom.scores,
        [winnerId === 'draw' ? 'draws' : winnerId]: (currentRoom.scores?.[winnerId === 'draw' ? 'draws' : winnerId] || 0) + 1
      };
    }

    updateGameState(updatedGameState, updatedScores);
  };

  const isCellWinning = (r, c) => {
    return gameState.winningCells?.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto'
    }}>
      {/* Turn & Status Header */}
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
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: myColor,
            boxShadow: `0 0 14px ${myColor}`
          }}></div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Your Chip Color
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {myChipLabel} {isHost ? '(Host)' : '(Guest)'}
            </div>
          </div>
        </div>

        {!currentRoom?.guest ? (
          <span className="badge badge-amber">Waiting for Opponent</span>
        ) : isGameOver ? (
          isDraw ? (
            <span className="badge badge-amber">Game Drawn!</span>
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
            {isMyTurn ? 'Your Turn (Click Column)' : `${opponent?.name || 'Opponent'}'s Turn`}
          </span>
        )}
      </div>

      {/* Column Hover Indicator Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: '8px',
        width: '100%',
        maxWidth: '480px',
        height: '24px',
        padding: '0 12px'
      }}>
        {Array(COLS).fill(0).map((_, cIdx) => (
          <div
            key={cIdx}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {hoveredCol === cIdx && isMyTurn && !isGameOver && (
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: myColor,
                boxShadow: `0 0 10px ${myColor}`,
                animation: 'pulseAnim 1s infinite'
              }}></div>
            )}
          </div>
        ))}
      </div>

      {/* 7x6 Connect Four Board */}
      <div style={{
        background: 'linear-gradient(145deg, #0d1424, #151d34)',
        padding: '16px',
        borderRadius: '24px',
        border: '2px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.1)',
        width: '100%',
        maxWidth: '480px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '8px',
          background: 'rgba(5, 8, 16, 0.9)',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {Array(COLS).fill(0).map((_, colIndex) => {
            const canDrop = isMyTurn && !isGameOver && currentRoom?.guest && gameState.board[0][colIndex] === null;

            return (
              <div
                key={colIndex}
                onClick={() => handleColumnClick(colIndex)}
                onMouseEnter={() => setHoveredCol(colIndex)}
                onMouseLeave={() => setHoveredCol(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: canDrop ? 'pointer' : 'default',
                  padding: '4px 2px',
                  borderRadius: '12px',
                  transition: 'background 0.15s',
                  background: (hoveredCol === colIndex && canDrop) ? 'rgba(255, 255, 255, 0.04)' : 'transparent'
                }}
              >
                {Array(ROWS).fill(0).map((_, rowIndex) => {
                  const cellOwner = gameState.board[rowIndex][colIndex];
                  const isWin = isCellWinning(rowIndex, colIndex);

                  let cellBg = 'rgba(255, 255, 255, 0.03)';
                  let cellShadow = 'none';
                  let cellBorder = '1px solid rgba(255, 255, 255, 0.04)';

                  if (cellOwner) {
                    const isHostChip = cellOwner === currentRoom.host?.id;
                    cellBg = isHostChip 
                      ? 'linear-gradient(135deg, #7c3aed, #a855f7)' 
                      : 'linear-gradient(135deg, #0891b2, #06b6d4)';
                    cellShadow = isHostChip
                      ? '0 0 14px rgba(139, 92, 246, 0.5)'
                      : '0 0 14px rgba(6, 182, 212, 0.5)';
                    cellBorder = 'none';
                  }

                  if (isWin) {
                    cellShadow = '0 0 24px #ffffff, 0 0 14px #f59e0b';
                    cellBorder = '2px solid #ffffff';
                  }

                  return (
                    <div
                      key={rowIndex}
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '50%',
                        background: cellBg,
                        border: cellBorder,
                        boxShadow: cellShadow,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {isWin && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 0 10px #ffffff'
                        }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <button
          onClick={restartGame}
          className="btn btn-secondary"
          style={{ padding: '10px 20px', borderRadius: '12px' }}
        >
          <RotateCcw size={16} />
          {isGameOver ? 'Play Again' : 'Reset Grid'}
        </button>
      </div>
    </div>
  );
};
