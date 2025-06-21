class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lengthElement = document.getElementById('length');
        this.aliveElement = document.getElementById('alive');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalLengthElement = document.getElementById('finalLength');
        this.playAgainButton = document.getElementById('playAgain');
        
        // Game constants (matching your Python version)
        this.SCALE = 30;
        this.CANVAS_WIDTH = 600;
        this.CANVAS_HEIGHT = 700;
        this.GAME_AREA_TOP = 100; // Top area for stats
        
        // Colors (matching your Python version)
        this.WHITE = '#FFFFFF';
        this.GREY = '#7F7F7F';
        this.BLACK = '#000000';
        this.RED = '#FF0000';
        this.GREEN = '#00FF00';
        this.DGREEN = '#007F00';
        
        // Game state
        this.snake = {
            alive: true,
            length: 1,
            tail: [],
            x: 0,
            y: 0,
            xV: 0,
            yV: 1,
            tick: 0
        };
        
        this.food = {
            x: 0,
            y: 0
        };
        
        this.gameRunning = true;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.resetGame();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    resetGame() {
        this.snake = {
            alive: true,
            length: 1,
            tail: [],
            x: 0,
            y: 0,
            xV: 0,
            yV: 1,
            tick: 0
        };
        
        this.generateFood();
        this.updateStats();
        this.gameOverElement.classList.add('hidden');
        this.gameRunning = true;
    }
    
    generateFood() {
        const maxX = Math.floor(this.CANVAS_WIDTH / this.SCALE) - 1;
        const maxY = Math.floor((this.CANVAS_HEIGHT - this.GAME_AREA_TOP) / this.SCALE) - 1;
        
        do {
            this.food.x = Math.floor(Math.random() * maxX);
            this.food.y = Math.floor(Math.random() * maxY);
        } while (this.isPositionOccupied(this.food.x, this.food.y));
    }
    
    isPositionOccupied(x, y) {
        return this.snake.tail.some(segment => segment[0] === x && segment[1] === y);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (this.snake.alive) {
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    if (this.snake.xV !== 1) { // Prevent moving in opposite direction
                        this.snake.yV = 0;
                        this.snake.xV = -1;
                    }
                } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    if (this.snake.xV !== -1) {
                        this.snake.yV = 0;
                        this.snake.xV = 1;
                    }
                } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                    if (this.snake.yV !== 1) {
                        this.snake.xV = 0;
                        this.snake.yV = -1;
                    }
                } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                    if (this.snake.yV !== -1) {
                        this.snake.xV = 0;
                        this.snake.yV = 1;
                    }
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Play again button
        this.playAgainButton.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    updateSnake() {
        if (!this.snake.alive) return;
        
        if (this.snake.tick >= 10) {
            this.snake.x += this.snake.xV;
            this.snake.y += this.snake.yV;
            
            // Check collision with self
            for (let segment of this.snake.tail) {
                if (segment[0] === this.snake.x && segment[1] === this.snake.y) {
                    this.snake.alive = false;
                    break;
                }
            }
            
            this.snake.tick = 0;
            this.snake.tail.push([this.snake.x, this.snake.y]);
        } else {
            this.snake.tick++;
        }
        
        // Remove excess tail segments
        while (this.snake.tail.length > this.snake.length) {
            this.snake.tail.shift();
        }
        
        // Check wall collisions
        if (this.snake.x < 0) {
            this.snake.alive = false;
            this.snake.x = 0;
        }
        if (this.snake.x >= this.CANVAS_WIDTH / this.SCALE) {
            this.snake.alive = false;
            this.snake.x = (this.CANVAS_WIDTH / this.SCALE) - 1;
        }
        if (this.snake.y < 0) {
            this.snake.alive = false;
            this.snake.y = 0;
        }
        if (this.snake.y >= (this.CANVAS_HEIGHT - this.GAME_AREA_TOP) / this.SCALE) {
            this.snake.alive = false;
            this.snake.y = ((this.CANVAS_HEIGHT - this.GAME_AREA_TOP) / this.SCALE) - 1;
        }
    }
    
    updateFood() {
        if (this.snake.x === this.food.x && this.snake.y === this.food.y) {
            this.snake.length++;
            this.generateFood();
        }
    }
    
    updateStats() {
        this.lengthElement.textContent = this.snake.length;
        this.aliveElement.textContent = this.snake.alive ? 'True' : 'False';
        
        if (!this.snake.alive && this.gameRunning) {
            this.gameRunning = false;
            this.finalLengthElement.textContent = this.snake.length;
            this.gameOverElement.classList.remove('hidden');
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.BLACK;
        this.ctx.lineWidth = 3;
        
        // Draw horizontal lines
        for (let i = 0; i < Math.floor((this.CANVAS_HEIGHT - this.GAME_AREA_TOP) / this.SCALE) - 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.GAME_AREA_TOP + (i * this.SCALE) + this.SCALE);
            this.ctx.lineTo(this.CANVAS_WIDTH, this.GAME_AREA_TOP + (i * this.SCALE) + this.SCALE);
            this.ctx.stroke();
        }
        
        // Draw vertical lines
        for (let i = 0; i < Math.floor(this.CANVAS_WIDTH / this.SCALE) - 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo((i * this.SCALE) + this.SCALE, this.GAME_AREA_TOP);
            this.ctx.lineTo((i * this.SCALE) + this.SCALE, this.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
    }
    
    drawSeparator() {
        this.ctx.strokeStyle = this.BLACK;
        this.ctx.lineWidth = 7;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.GAME_AREA_TOP);
        this.ctx.lineTo(this.CANVAS_WIDTH, this.GAME_AREA_TOP);
        this.ctx.stroke();
    }
    
    drawSnake() {
        this.ctx.fillStyle = this.WHITE;
        for (let segment of this.snake.tail) {
            this.ctx.fillRect(
                segment[0] * this.SCALE,
                segment[1] * this.SCALE + this.GAME_AREA_TOP,
                this.SCALE,
                this.SCALE
            );
        }
    }
    
    drawFood() {
        this.ctx.fillStyle = this.RED;
        this.ctx.fillRect(
            this.food.x * this.SCALE,
            this.food.y * this.SCALE + this.GAME_AREA_TOP,
            this.SCALE,
            this.SCALE
        );
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = this.GREY;
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        // Draw game elements
        this.drawSeparator();
        this.drawGrid();
        this.drawFood();
        this.drawSnake();
    }
    
    gameLoop() {
        this.updateSnake();
        this.updateFood();
        this.updateStats();
        this.render();
        
        // Continue game loop
        if (this.gameRunning || this.snake.alive) {
            setTimeout(() => this.gameLoop(), 20); // ~50 FPS (matching your Python version)
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
}); 