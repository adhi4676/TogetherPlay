export const WINNING_LINES = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // cols
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6]
];

export const checkWinner = (board) => {
  for (let i = 0; i < WINNING_LINES.length; i++) {
    const [a, b, c] = WINNING_LINES[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winnerSymbol: board[a],
        line: WINNING_LINES[i]
      };
    }
  }

  // Check if board is full (Draw)
  const isFull = board.every(cell => cell !== null);
  if (isFull) {
    return { winnerSymbol: 'draw', line: null };
  }

  return null;
};
