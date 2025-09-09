'use strict';

export class Game {
  constructor(size = 4) {
    this.size = size;
    this.board = this.createBoard();
    this.score = 0;
    this.status = 'idle';
  }

  createBoard() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  restart() {
    this.board = this.createBoard();
    this.score = 0;
    this.status = 'playing';
    this.addRandomTile();
    this.addRandomTile();
  }

  getState() {
    return this.board.map((row) => [...row]);
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  addRandomTile() {
    const empty = [];

    for (let er = 0; er < this.size; er++) {
      for (let ec = 0; ec < this.size; ec++) {
        if (this.board[er][ec] === 0) {
          empty.push({ er, ec });
        }
      }
    }

    if (empty.length === 0) {
      return;
    }

    const { er: row, ec: col } =
      empty[Math.floor(Math.random() * empty.length)];

    this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
  }

  moveLeft() {
    let moved = false;

    for (let r = 0; r < this.size; r++) {
      const row = this.board[r].filter((val) => val !== 0);

      for (let c = 0; c < row.length - 1; c++) {
        if (row[c] === row[c + 1]) {
          row[c] *= 2;
          this.score += row[c];
          row[c + 1] = 0;
          c++;
        }
      }

      const newRow = row.filter((val) => val !== 0);

      while (newRow.length < this.size) {
        newRow.push(0);
      }

      if (newRow.toString() !== this.board[r].toString()) {
        moved = true;
        this.board[r] = newRow;
      }
    }

    if (moved) {
      this.addRandomTile();
      this.checkGameOver();
    }

    return moved;
  }

  moveRight() {
    this.reverse();

    const moved = this.moveLeft();

    this.reverse();

    return moved;
  }

  moveUp() {
    this.transpose();

    const moved = this.moveLeft();

    this.transpose();

    return moved;
  }

  moveDown() {
    this.transpose();

    const moved = this.moveRight();

    this.transpose();

    return moved;
  }

  reverse() {
    this.board = this.board.map((row) => row.reverse());
  }

  transpose() {
    const newBoard = this.createBoard();

    for (let tr = 0; tr < this.size; tr++) {
      for (let tc = 0; tc < this.size; tc++) {
        newBoard[tr][tc] = this.board[tc][tr];
      }
    }

    this.board = newBoard;
  }

  checkGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 2048) {
          this.status = 'win';

          return;
        }
      }
    }

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) {
          return;
        }

        if (
          (c < this.size - 1 && this.board[r][c] === this.board[r][c + 1]) ||
          (r < this.size - 1 && this.board[r][c] === this.board[r + 1][c])
        ) {
          return;
        }
      }
    }

    this.status = 'lose';
  }
}
