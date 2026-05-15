const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
];
let food = { x: 5, y: 5 };
let gameLoop;
let isPaused = false;
let changingDirection = false; // 用來防止在一個 frame 內多次改變方向

// 監聽鍵盤事件
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (changingDirection) return; // 如果這個 tick 已經改過方向了，就直接回傳

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    // 防止反向移動
    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
        dx = -1;
        dy = 0;
        changingDirection = true;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
        dx = 0;
        dy = -1;
        changingDirection = true;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
        dx = 1;
        dy = 0;
        changingDirection = true;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
        dx = 0;
        dy = 1;
        changingDirection = true;
    }

    // 如果遊戲還沒開始（dx, dy 都是 0），按任意鍵開始
    if (gameLoop === undefined && (dx !== 0 || dy !== 0)) {
        startGame();
    }
}

function startGame() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, 100);
}

function draw() {
    changingDirection = false; // 每個 tick 開始時重設 flag
    moveSnake();
    if (checkGameOver()) {
        handleGameOver();
        return;
    }
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#006400';
    snake.forEach((part, index) => {
        // 蛇頭顏色稍微深一點
        if (index === 0) ctx.fillStyle = '#00cc00';
        else ctx.fillStyle = '#00ff00';
        
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function moveSnake() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score;
        createFood();
    } else {
        snake.pop();
    }
}

function createFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 確保食物不會出現在蛇身上
    let foodOnSnake = false;
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) foodOnSnake = true;
    });
    if (foodOnSnake) createFood();
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function checkGameOver() {
    const head = snake[0];
    
    // 撞牆
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 撞到自己 (從第 2 節開始檢查，因為第 1 節就是頭)
    // 這裡 i 從 4 開始檢查是一個優化，因為蛇長度小於 5 以前不可能撞到自己
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function handleGameOver() {
    clearInterval(gameLoop);
    gameLoop = undefined;
    gameOverElement.style.display = 'block';
}

function resetGame() {
    score = 0;
    scoreElement.innerText = score;
    dx = 0;
    dy = 0;
    // 初始位置改為橫向，避免一開始按向下就撞到自己
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    createFood();
    gameOverElement.style.display = 'none';
    clearCanvas();
    drawSnake();
    drawFood();
}

// 初始渲染
resetGame();

