'use strict';

export class Game {
  constructor(initialState) {
    this.size = 4;
    this.score = 0;
    this.status = 'idle'; // idle, playing, win, lose

    this.board =
      initialState ||
      Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  getState() {
    return this.board;
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  start() {
    this.status = 'playing';
    this.addRandomTile();
    this.addRandomTile();
  }

  restart() {
    this.score = 0;
    this.status = 'playing';

    this.board = Array.from({ length: this.size }, () =>
      Array(this.size).fill(0),
    );
    this.addRandomTile();
    this.addRandomTile();
  }

  moveLeft() {
    this.move('left');
  }

  moveRight() {
    this.move('right');
  }

  moveUp() {
    this.move('up');
  }

  moveDown() {
    this.move('down');
  }

  // --------------------
  // Вспомогательные методы
  // --------------------
  addRandomTile() {
    const emptyCells = [];

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { r, c } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];

      this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  move(direction) {
    // Здесь реализуешь механику слияния и движения
    console.log(`Move: ${direction}`);
  }
}
