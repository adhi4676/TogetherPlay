export const ROWS = 6;
export const COLS = 7;

export const findLowestEmptyRow = (board, colIndex) => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][colIndex] === null) {
      return r;
    }
  }
  return -1; // Column full
};

export const checkConnectFourWinner = (board) => {
  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r][c + 1] && val === board[r][c + 2] && val === board[r][c + 3]) {
        return {
          winner: val,
          winningCells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]]
        };
      }
    }
  }

  // Check vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = board[r][c];
      if (val && val === board[r + 1][c] && val === board[r + 2][c] && val === board[r + 3][c]) {
        return {
          winner: val,
          winningCells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]]
        };
      }
    }
  }

  // Check diagonal (down-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const val = board[r][c];
      if (val && val === board[r + 1][c + 1] && val === board[r + 2][c + 2] && val === board[r + 3][c + 3]) {
        return {
          winner: val,
          winningCells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]
        };
      }
    }
  }

  // Check diagonal (down-left)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      const val = board[r][c];
      if (val && val === board[r + 1][c - 1] && val === board[r + 2][c - 2] && val === board[r + 3][c - 3]) {
        return {
          winner: val,
          winningCells: [[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]]
        };
      }
    }
  }

  // Check draw (top row full)
  const isFull = board[0].every(cell => cell !== null);
  if (isFull) {
    return { winner: 'draw', winningCells: [] };
  }

  return null;
};
