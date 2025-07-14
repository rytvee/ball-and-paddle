// ========================================
// CREATE BALL & PADDLE
// ========================================


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tryAgainBtn = document.getElementById("tryAgainBtn");
const gameOverScreen = document.getElementById("gameOverScreen");



// Ball properties
let ballX = canvas.width / 20;
let ballY = canvas.height - 30;
let ballRadius = 10;
let dx = 2;
let dy = -2;
let score = 0; // Score variable
let level = 1;
const speedMultiplier = 1.2;
let lives = 5;

// Paddle properies
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controls
let leftPressed = false;
let rightPressed = false;

// Event listeners
document.addEventListener("keydown", KeyDownHandler);
document.addEventListener("keyup", KeyUpHandler);

function KeyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function KeyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// ========================================
// DRAW & ANIMATE BALL & PADDLE
// ========================================

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
    ctx.fillText("Level: " + level, canvas.width - 90, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Lives: " + lives, canvas.width - 90, 50);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawLevel();
    drawLives();

    // Update ball position
    ballX += dx;
    ballY += dy;

    // Ball collision with top
    if (ballY + dy < ballRadius) {
        dy = -dy;
    } else if (ballY + dy > canvas.height - ballRadius) {
        // ball hits bottom
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            dy = -dy;
            score++; // Increases score when ball hits paddle

            // Increase speed every 5 points
            if (score % 5 === 0) {
                // miantain direction but increases speed slightly
                dx *= speedMultiplier;
                dy *= speedMultiplier
                
                level++;
            }
        } else {
           // document.location.reload(); // Restart game
           lives--;
           if (lives === 0) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "#f00";
            ctx.textAlign = "center";
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

            // position button under text
            gameOverScreen.style.display = "block";
            tryAgainBtn.style.display = "inline-block";
            return; // stop game
           } else {
            // Reset ball and paddle position
            ballX = canvas.width / 20;
            ballY = canvas.height - 30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width - paddleWidth) / 2;
           }
        }
    }

    // Ball collision with side walls
    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
    }

    // Paddle Movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    } else if (leftPressed && paddleX > 0) {
        paddleX -=5;
    }


    requestAnimationFrame(draw);
}

tryAgainBtn.addEventListener("click", function() {
    // Reset game state
    score = 0;
    level = 1;
    lives = 5;
    ballX = canvas.width / 20;
    ballY = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    // Hide the button and Game Over screen
    tryAgainBtn.style.display = "none";
    gameOverScreen.style.display = "none";

    // Restart the game loop
    draw();
});


draw();