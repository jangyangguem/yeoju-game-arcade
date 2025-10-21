// 테트리스 게임 클래스
class TetrisGame {
    constructor() {
        // 캔버스 설정
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // 게임 보드 설정
        this.COLS = 10;
        this.ROWS = 20;
        this.BLOCK_SIZE = 30;
        
        // 게임 상태
        this.board = this.createBoard();
        this.gameState = 'READY'; // READY, PLAYING, PAUSED, GAME_OVER
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.highScore = this.loadHighScore();
        
        // 블록 속도
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // 현재 블록과 다음 블록
        this.currentPiece = null;
        this.nextPiece = this.createPiece();
        
        // 파티클 배열
        this.particles = [];
        
        // 테트로미노 정의
        this.tetrominoes = {
            'I': {
                shape: [[1, 1, 1, 1]],
                color: '#00ffff'
            },
            'O': {
                shape: [[1, 1], [1, 1]],
                color: '#ffff00'
            },
            'T': {
                shape: [[0, 1, 0], [1, 1, 1]],
                color: '#ff00ff'
            },
            'S': {
                shape: [[0, 1, 1], [1, 1, 0]],
                color: '#00ff00'
            },
            'Z': {
                shape: [[1, 1, 0], [0, 1, 1]],
                color: '#ff0000'
            },
            'J': {
                shape: [[1, 0, 0], [1, 1, 1]],
                color: '#0000ff'
            },
            'L': {
                shape: [[0, 0, 1], [1, 1, 1]],
                color: '#ff8800'
            }
        };
        
        this.init();
    }
    
    // 게임 초기화
    init() {
        this.updateDisplay();
        this.drawBoard();
        this.drawNextPiece();
        this.setupEventListeners();
        this.showOverlay('PRESS SPACE TO START', 'Use Arrow Keys to Move<br>Space to Rotate<br>ESC to Pause');
    }
    
    // 보드 생성
    createBoard() {
        return Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
    }
    
    // 새로운 블록 생성
    createPiece() {
        const types = Object.keys(this.tetrominoes);
        const type = types[Math.floor(Math.random() * types.length)];
        const tetromino = this.tetrominoes[type];
        
        return {
            shape: tetromino.shape.map(row => [...row]),
            color: tetromino.color,
            x: Math.floor(this.COLS / 2) - Math.floor(tetromino.shape[0].length / 2),
            y: 0
        };
    }
    
    // 충돌 감지
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return true;
                    }
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 블록 이동
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gameState !== 'PLAYING') return false;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.drawBoard();
            return true;
        }
        return false;
    }
    
    // 블록 회전
    rotatePiece() {
        if (!this.currentPiece || this.gameState !== 'PLAYING') return;
        
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const previousShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision(this.currentPiece)) {
            this.currentPiece.shape = previousShape;
        } else {
            this.drawBoard();
        }
    }
    
    // 블록 고정
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                        this.createParticles(boardX, boardY, this.currentPiece.color);
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        this.drawNextPiece();
        
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    // 라인 클리어
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.ROWS - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // 라인 클리어 이펙트
                for (let x = 0; x < this.COLS; x++) {
                    this.createParticles(x, y, this.board[y][x], true);
                }
                
                this.board.splice(y, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                y++; // 같은 줄 다시 체크
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // 점수 계산 (테트리스 공식)
            const lineScores = [0, 100, 300, 500, 800];
            this.score += lineScores[linesCleared] * this.level;
            
            // 레벨 업 (10라인마다)
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
            
            this.updateDisplay();
        }
    }
    
    // 파티클 생성
    createParticles(x, y, color, isLineClear = false) {
        const count = isLineClear ? 10 : 5;
        const centerX = x * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
        const centerY = y * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    // 파티클 업데이트
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // 중력
            p.life -= 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // 보드 그리기
    drawBoard() {
        // 배경 클리어
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 그리드 그리기
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        for (let y = 0; y <= this.ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.COLS * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let x = 0; x <= this.COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.ROWS * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // 보드의 고정된 블록 그리기
        for (let y = 0; y < this.ROWS; y++) {
            for (let x = 0; x < this.COLS; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // 현재 블록 그리기
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // 파티클 그리기
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            this.ctx.globalAlpha = 1;
        });
    }
    
    // 블록 그리기
    drawBlock(x, y, color) {
        const size = this.BLOCK_SIZE;
        const px = x * size;
        const py = y * size;
        
        // 메인 블록
        this.ctx.fillStyle = color;
        this.ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
        
        // 네온 효과
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.strokeRect(px + 2, py + 2, size - 4, size - 4);
        this.ctx.shadowBlur = 0;
        
        // 하이라이트
        const gradient = this.ctx.createLinearGradient(px, py, px + size, py + size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(px + 1, py + 1, size / 2, size / 2);
    }
    
    // 다음 블록 그리기
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const blockSize = 25;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    const px = offsetX + x * blockSize;
                    const py = offsetY + y * blockSize;
                    
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(px + 1, py + 1, blockSize - 2, blockSize - 2);
                    
                    this.nextCtx.strokeStyle = this.nextPiece.color;
                    this.nextCtx.lineWidth = 2;
                    this.nextCtx.strokeRect(px + 2, py + 2, blockSize - 4, blockSize - 4);
                }
            }
        }
    }
    
    // 디스플레이 업데이트
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('highscore').textContent = this.highScore;
    }
    
    // 오버레이 표시
    showOverlay(title, message) {
        document.getElementById('overlayTitle').innerHTML = title;
        document.getElementById('overlayMessage').innerHTML = message;
        document.getElementById('gameOverlay').classList.remove('hidden');
    }
    
    // 오버레이 숨기기
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    // 게임 시작
    startGame() {
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.particles = [];
        this.gameState = 'PLAYING';
        this.lastDropTime = Date.now();
        this.updateDisplay();
        this.drawNextPiece();
        this.hideOverlay();
        this.gameLoop();
    }
    
    // 게임 일시정지
    pauseGame() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.showOverlay('PAUSED', 'Press ESC to Resume');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.hideOverlay();
            this.lastDropTime = Date.now();
        }
    }
    
    // 게임 오버
    gameOver() {
        this.gameState = 'GAME_OVER';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.showOverlay('GAME OVER - NEW HIGH SCORE!', 
                `Score: ${this.score}<br>Press SPACE to Restart`);
        } else {
            this.showOverlay('GAME OVER', 
                `Score: ${this.score}<br>Press SPACE to Restart`);
        }
        
        this.updateDisplay();
    }
    
    // 로컬 스토리지에서 최고 점수 불러오기
    loadHighScore() {
        const saved = localStorage.getItem('tetrisHighScore');
        return saved ? parseInt(saved) : 0;
    }
    
    // 로컬 스토리지에 최고 점수 저장
    saveHighScore() {
        localStorage.setItem('tetrisHighScore', this.highScore.toString());
    }
    
    // 게임 루프
    gameLoop() {
        if (this.gameState !== 'PLAYING') return;
        
        const now = Date.now();
        const delta = now - this.lastDropTime;
        
        if (delta > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
            this.lastDropTime = now;
        }
        
        this.updateParticles();
        this.drawBoard();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'READY' || this.gameState === 'GAME_OVER') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.startGame();
                }
                return;
            }
            
            if (e.code === 'Escape') {
                e.preventDefault();
                this.pauseGame();
                return;
            }
            
            if (this.gameState !== 'PLAYING') return;
            
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.movePiece(0, 1)) {
                        this.score += 1;
                        this.updateDisplay();
                    }
                    break;
                case 'Space':
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
            }
        });
        
        // 모바일 터치 이벤트
        document.getElementById('leftBtn').addEventListener('click', () => {
            this.movePiece(-1, 0);
        });
        
        document.getElementById('rightBtn').addEventListener('click', () => {
            this.movePiece(1, 0);
        });
        
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.movePiece(0, 1)) {
                this.score += 1;
                this.updateDisplay();
            }
        });
        
        document.getElementById('rotateBtn').addEventListener('click', () => {
            this.rotatePiece();
        });
        
        // 터치 이벤트 개선 (스와이프)
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameState !== 'PLAYING') {
                if (this.gameState === 'READY' || this.gameState === 'GAME_OVER') {
                    this.startGame();
                }
                return;
            }
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // 수평 스와이프
                if (Math.abs(dx) > 50) {
                    this.movePiece(dx > 0 ? 1 : -1, 0);
                }
            } else {
                // 수직 스와이프
                if (dy > 50) {
                    if (this.movePiece(0, 1)) {
                        this.score += 1;
                        this.updateDisplay();
                    }
                } else if (dy < -50) {
                    this.rotatePiece();
                }
            }
        });
    }
}

// 게임 시작
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new TetrisGame();
});