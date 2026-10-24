import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRoom } from '../../../context/RoomContext';
import { QUIZ_QUESTIONS } from './quizQuestions';
import { soundFx } from '../../../utils/soundEffects';

export const PlayerQuiz = () => {
  const { currentUser, recordMatchResult } = useAuth();
  const { currentRoom, isHost, opponent, updateGameState, restartGame } = useRoom();
  const [resultRecorded, setResultRecorded] = useState(false);

  const gameState = currentRoom?.gameState || {
    currentQuestionIndex: 0,
    answers: {},
    scores: {},
    status: 'playing'
  };

  const currentQIndex = gameState.currentQuestionIndex || 0;
  const currentQuestion = QUIZ_QUESTIONS[currentQIndex] || QUIZ_QUESTIONS[0];

  const currentQuestionAnswers = gameState.answers?.[currentQIndex] || {};
  const myAnswerIndex = currentQuestionAnswers[currentUser?.uid];
  const opponentAnswerIndex = opponent ? currentQuestionAnswers[opponent.uid] : undefined;

  const bothAnswered = myAnswerIndex !== undefined && opponentAnswerIndex !== undefined;
  const isLastQuestion = currentQIndex >= QUIZ_QUESTIONS.length - 1;
  const isQuizCompleted = gameState.status === 'completed';

  const myScore = gameState.scores?.[currentUser?.uid] || 0;
  const opponentScore = opponent ? (gameState.scores?.[opponent.uid] || 0) : 0;

  // Final results processing
  useEffect(() => {
    if (isQuizCompleted && !resultRecorded) {
      if (myScore > opponentScore) {
        soundFx.win();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        recordMatchResult('Player Quiz', opponent?.name || 'Opponent', 'win');
      } else if (myScore < opponentScore) {
        recordMatchResult('Player Quiz', opponent?.name || 'Opponent', 'loss');
      } else {
        recordMatchResult('Player Quiz', opponent?.name || 'Opponent', 'draw');
      }
      setResultRecorded(true);
    } else if (!isQuizCompleted) {
      setResultRecorded(false);
    }
  }, [isQuizCompleted, myScore, opponentScore, currentUser?.uid]);

  const handleSelectOption = (optionIndex) => {
    if (!currentRoom?.guest) return;
    if (myAnswerIndex !== undefined || isQuizCompleted) return;

    soundFx.click();

    // Check if correct
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    const point = isCorrect ? 100 : 0;

    const newAnswers = {
      ...gameState.answers,
      [currentQIndex]: {
        ...currentQuestionAnswers,
        [currentUser.uid]: optionIndex
      }
    };

    const newScores = {
      ...gameState.scores,
      [currentUser.uid]: (gameState.scores?.[currentUser.uid] || 0) + point,
      [opponent?.id || 'guest']: gameState.scores?.[opponent?.id || 'guest'] || 0
    };

    const updatedGameState = {
      ...gameState,
      answers: newAnswers,
      scores: newScores,
      lastMoveAt: Date.now()
    };

    updateGameState(updatedGameState);
  };

  const handleNextQuestion = () => {
    if (!bothAnswered) return;
    soundFx.click();

    if (isLastQuestion) {
      // Complete quiz
      const updatedGameState = {
        ...gameState,
        status: 'completed',
        lastMoveAt: Date.now()
      };
      updateGameState(updatedGameState);
    } else {
      const updatedGameState = {
        ...gameState,
        currentQuestionIndex: currentQIndex + 1,
        lastMoveAt: Date.now()
      };
      updateGameState(updatedGameState);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
      maxWidth: '620px',
      margin: '0 auto'
    }}>
      {/* Quiz Progress & Score Header */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* My Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid var(--border-highlight)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#c084fc',
            fontFamily: 'var(--font-gaming)'
          }}>
            {myScore} PTS
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser?.displayName}</div>
          </div>
        </div>

        {/* Question Counter Pill */}
        <div style={{ textAlign: 'center' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            Question {currentQIndex + 1} / {QUIZ_QUESTIONS.length}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {currentQuestion.category}
          </div>
        </div>

        {/* Opponent Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row-reverse' }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.2)',
            border: '1px solid var(--border-cyan)',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#67e8f9',
            fontFamily: 'var(--font-gaming)'
          }}>
            {opponentScore} PTS
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opponent</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opponent?.name || 'Waiting...'}</div>
          </div>
        </div>
      </div>

      {/* Main Question Card or Completed Results */}
      {!isQuizCompleted ? (
        <div className="glass-panel" style={{
          width: '100%',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Question Text */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontFamily: 'var(--font-gaming)',
              fontSize: '1.25rem',
              lineHeight: 1.5,
              color: '#ffffff'
            }}>
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            {currentQuestion.options.map((option, idx) => {
              const isSelectedByMe = myAnswerIndex === idx;
              const isSelectedByOpponent = bothAnswered && opponentAnswerIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let buttonBg = 'rgba(255, 255, 255, 0.03)';
              let buttonBorder = '1px solid rgba(255, 255, 255, 0.08)';
              let textColor = 'var(--text-main)';

              if (isSelectedByMe) {
                buttonBg = 'rgba(139, 92, 246, 0.25)';
                buttonBorder = '2px solid var(--accent-purple)';
                textColor = '#ffffff';
              }

              if (bothAnswered) {
                if (isCorrect) {
                  buttonBg = 'rgba(16, 185, 129, 0.2)';
                  buttonBorder = '2px solid var(--accent-emerald)';
                  textColor = '#6ee7b7';
                } else if (isSelectedByMe && !isCorrect) {
                  buttonBg = 'rgba(244, 63, 94, 0.2)';
                  buttonBorder = '2px solid var(--accent-rose)';
                  textColor = '#fda4af';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={myAnswerIndex !== undefined || !currentRoom?.guest}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: buttonBg,
                    border: buttonBorder,
                    color: textColor,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: myAnswerIndex === undefined ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (myAnswerIndex === undefined) {
                      e.currentTarget.style.borderColor = 'var(--accent-purple)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (myAnswerIndex === undefined && !isSelectedByMe) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-gaming)',
                      flexShrink: 0
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {bothAnswered && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                  {bothAnswered && isSelectedByMe && !isCorrect && <XCircle size={18} color="#f43f5e" />}
                </button>
              );
            })}
          </div>

          {/* Turn Answer Status */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ color: myAnswerIndex !== undefined ? '#10b981' : 'var(--text-dim)' }}>
                {myAnswerIndex !== undefined ? '✓ You Locked In' : '⏳ Waiting for your pick'}
              </span>
              <span style={{ color: opponentAnswerIndex !== undefined ? '#06b6d4' : 'var(--text-dim)' }}>
                {opponentAnswerIndex !== undefined ? '✓ Opponent Locked In' : '⏳ Opponent choosing'}
              </span>
            </div>

            {bothAnswered && (
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {isLastQuestion ? 'View Results' : 'Next Question'}
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Fun fact explanation when both answered */}
          {bothAnswered && currentQuestion.funFact && (
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              💡 {currentQuestion.funFact}
            </div>
          )}
        </div>
      ) : (
        /* Final Results Podium */
        <div className="glass-panel" style={{
          width: '100%',
          padding: '36px 24px',
          textAlign: 'center',
          border: '1px solid var(--accent-purple)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px var(--accent-purple-glow)'
          }}>
            <Trophy size={40} color="#ffffff" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-gaming)', fontSize: '1.8rem', marginBottom: '8px' }}>
            {myScore > opponentScore ? 'Victory Is Yours!' : (myScore < opponentScore ? `${opponent?.name || 'Opponent'} Won!` : 'Glorious Tie!')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Final score comparison across all 10 showdown questions.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '16px 24px',
              borderRadius: '16px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid var(--border-highlight)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c084fc', fontFamily: 'var(--font-gaming)' }}>
                {myScore} PTS
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderRadius: '16px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid var(--border-cyan)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opponent?.name || 'Opponent'}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#67e8f9', fontFamily: 'var(--font-gaming)' }}>
                {opponentScore} PTS
              </div>
            </div>
          </div>

          <button
            onClick={restartGame}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            <RotateCcw size={18} />
            Play Another Match
          </button>
        </div>
      )}
    </div>
  );
};
