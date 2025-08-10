'use strict';

// Uncomment the next lines to use your game instance in the browser
const Game = require('../Game.class');
const game = new Game();

const SIZE = 4;
const WIN_TILE = 2048;

function cloneMatrix(m) {
  return m.map((row) => row.slice());
}

class Game {
  /**
   * initialState: optional 2D-array 4x4 with numbers (0 for empty)
   */
  constructor(initialState) {
    // If passed initialState use deep copy, otherwise create empty board
    if (
      initialState &&
      Array.isArray(initialState) &&
      initialState.length === SIZE
    ) {
      this.initialState = cloneMatrix(initialState);
    } else {
      this.initialState = Game.createEmptyBoard();
    }

    this.score = 0;
    this.board = cloneMatrix(this.initialState);
    this.status = 'not_started';
    this._movedOnce = false;
  }

  static createEmptyBoard() {
    const b = [];

    for (let i = 0; i < SIZE; i++) {
      b.push(new Array(SIZE).fill(0));
    }

    return b;
  }

  getState() {
    return cloneMatrix(this.board);
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  // Start new game from initialState: reset score, board and add two tiles
  start() {
    this.board = cloneMatrix(this.initialState);
    this.score = 0;
    this.status = 'playing';
    this._movedOnce = false;

    // Add two initial tiles (standard 2048 behaviour)
    this._addRandomTile();
    this._addRandomTile();
  }

  // Reset to initial state and start
  restart() {
    this.start();
  }

  // Move helpers
  // compress a row to the left and merge, return {newRow, gained, changed}
  static _compressAndMergeRowLeft(row) {
    const filtered = row.filter((v) => v !== 0);
    const newRow = [];
    let gained = 0;
    let i = 0;

    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;

        newRow.push(merged);
        gained += merged;
        i += 2;
      } else {
        newRow.push(filtered[i]);
        i += 1;
      }
    }

    while (newRow.length < SIZE) {
      newRow.push(0);
    }

    const changed = !row.every((v, idx) => v === newRow[idx]);

    return { newRow, gained, changed };
  }

  // rotate matrix clockwise times (90deg per time)
  static _rotateClockwise(matrix, times = 1) {
    let m = cloneMatrix(matrix);

    times = ((times % 4) + 4) % 4;

    for (let t = 0; t < times; t++) {
      const r = Game.createEmptyBoard();

      for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
          r[j][SIZE - 1 - i] = m[i][j];
        }
      }
      m = r;
    }

    return m;
  }

  // generic move left implementation used by others via rotation
  _moveLeftInternal() {
    let moved = false;
    let gainedTotal = 0;
    const newBoard = Game.createEmptyBoard();

    for (let i = 0; i < SIZE; i++) {
      const row = this.board[i];
      const { newRow, gained, changed } = Game._compressAndMergeRowLeft(row);

      newBoard[i] = newRow;

      if (changed) {
        moved = true;
      }
      gainedTotal += gained;
    }

    if (moved) {
      this.board = newBoard;
      this.score += gainedTotal;
      this._movedOnce = true;
    }

    return moved;
  }

  moveLeft() {
    if (this.status !== 'playing') {
      return false;
    }

    const before = JSON.stringify(this.board);
    const moved = this._moveLeftInternal();

    if (moved) {
      this._postMove();
    }

    return moved;
  }

  moveRight() {
    if (this.status !== 'playing') {
      return false;
    }
    // reverse each row, move left, then reverse back
    this.board = this.board.map((row) => row.slice().reverse());

    const moved = this._moveLeftInternal();

    // reverse back
    this.board = this.board.map((row) => row.slice().reverse());

    if (moved) {
      this._postMove();
    }

    return moved;
  }

  moveUp() {
    if (this.status !== 'playing') {
      return false;
    }
    // rotate left (counterclockwise) so that up becomes left: rotate 3 times clockwise
    this.board = Game._rotateClockwise(this.board, 3);

    const moved = this._moveLeftInternal();

    // rotate back
    this.board = Game._rotateClockwise(this.board, 1);

    if (moved) {
      this._postMove();
    }

    return moved;
  }

  moveDown() {
    if (this.status !== 'playing') {
      return false;
    }
    // rotate right (clockwise) so down becomes left: rotate 1 time
    this.board = Game._rotateClockwise(this.board, 1);

    const moved = this._moveLeftInternal();

    // rotate back
    this.board = Game._rotateClockwise(this.board, 3);

    if (moved) {
      this._postMove();
    }

    return moved;
  }

  // Called after a successful move (board and score already updated)
  _postMove() {
    // add random tile
    this._addRandomTile();

    // check win
    if (this._checkWin()) {
      this.status = 'won';

      return;
    }

    // check game over
    if (!this._hasMoves()) {
      this.status = 'lost';
    } else {
      this.status = 'playing';
    }
  }

  // place random tile (2 or 4) in random empty cell; 4 with 10% probability
  _addRandomTile() {
    const empty = [];

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (this.board[i][j] === 0) {
          empty.push([i, j]);
        }
      }
    }

    if (empty.length === 0) {
      return false;
    }

    const idx = Math.floor(Math.random() * empty.length);
    const [r, c] = empty[idx];
    const val = Math.random() < 0.1 ? 4 : 2; // 10% chance for 4

    this.board[r][c] = val;

    return true;
  }

  _checkWin() {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (this.board[i][j] === WIN_TILE) {
          return true;
        }
      }
    }

    return false;
  }

  // check if any move is possible
  _hasMoves() {
    // if there is empty cell -> move possible
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (this.board[i][j] === 0) {
          return true;
        }
      }
    }

    // check adjacent equal horizontally or vertically
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const v = this.board[i][j];

        if (i + 1 < SIZE && this.board[i + 1][j] === v) {
          return true;
        }

        if (j + 1 < SIZE && this.board[i][j + 1] === v) {
          return true;
        }
      }
    }

    return false;
  }
}

module.exports = Game;
