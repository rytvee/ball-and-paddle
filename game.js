// ========================================
// CREATE BALL & PADDLE
// ========================================

// Access HTML elements for board display, status message, and scoreboard
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ballX = canvas.width / 20;
let ballY = canvas.height - 30;
let ballRadius = 10;
let dx = 2;
let dy = -2;

// Game Variable
let score = 0;
let level = 0;
let lives = 5;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controls
let rightPressed = false;
let leftPressed = false;

// Event listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}


// ===========================================
// DRAW AND ANIMATE BALL & PADDLE
// ===========================================

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#ff0";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Level: " + level, 410, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Lives: " + lives, 410, 50);
}

function resetGame() {
    score = 0;
    level = 0;
    lives = 5;
    ballX = canvas.width / 20;
    ballY = canvas.height - 30;
    ballRadius = 10;
    dx = 2;
    dy = -2;
}

// game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawLevel();
    drawLives();

    //Update ball position
    ballX += dx;
    ballY += dy;

    // Ball collision with side walls
    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
    }
    // Ball collision with top
    if (ballY + dy < ballRadius) {
        dy = -dy;
    } else if  (ballY + dy > canvas.height - ballRadius) {
        // ball hits bottom
        if (
            ballY + ballRadius >= canvas.height - paddleHeight && // ball touches top of paddle
            ballX > paddleX &&
            ballX < paddleX + paddleWidth
        ) {
            dy = -dy;
            score++; // Only increment score if ball hits paddle
        } else if (ballY + ballRadius >= canvas.height) {
            // Ball hits bottom (misses paddle)
            lives--;
            if (lives > 0) {
                ballX = canvas.width / 20;
                ballY = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            } else {
                lives = 0;
                return; //Restart game
            }
        }
    }

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 5;
    }

    requestAnimationFrame(draw);
}

draw();
