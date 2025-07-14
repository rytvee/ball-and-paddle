const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ball properties
let ballX = canvas.width / 20;
let ballY = canvas.height - 30;
let ballRadius = 10;
let dx = 2;
let dy = -2;

// Game variables
let score = 0;
let level = 1;
let lives = 5;
let isGameOver = false;
const speedMultiplier = 1.2;

// Button for Game Over
const button = {
  x: canvas.width / 2 - 50,
  y: canvas.height / 2 + 30,
  width: 100,
  height: 40,
  color: "#4285F4",
  text: "Restart"
};

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Draw functions
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

function drawButton() {
    ctx.fillStyle = button.color;
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
}

// Game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawPaddle();
    drawScore();
    drawLevel();
    drawLives();

    if (isGameOver) {
        ctx.font = "24px Arial";
        ctx.fillStyle = "#f00";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
        drawButton();
        return;
    }

    ballX += dx;
    ballY += dy;

    // Ball collision with side walls
    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
    }
    // Ball collision with top
    if (ballY + dy < ballRadius) {
        dy = -dy;
    } else if (ballY + dy > canvas.height - ballRadius) {
        // ball hits bottom
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            dy = -dy;
            score++; // score increment

            // Speed increase after 5 points
            if (score % 5 === 0) {
                dx *= speedMultiplier;
                dy *= speedMultiplier;
                level++;
            }
        } else {
            lives--;
            if (lives === 0) {
                isGameOver = true;
            } else {
                resetBallAndPaddle();
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 5;
    }

    requestAnimationFrame(draw);
}

function resetBallAndPaddle() {
    ballX = canvas.width / 20;
    ballY = canvas.height - 30;

    // Calculate current speed magnitude
    const speed = Math.hypot(dx, dy);

    // Use consistent direction (right and up), normalize to keep speed
    dx = speed * 0.7;   // X component of speed
    dy = -speed * 0.7;  // Y component of speed (upward)

    paddleX = (canvas.width - paddleWidth) / 2;
}


// Restart game if button clicked
canvas.addEventListener("click", function(e) {
    if (!isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
    ) {
        // Reset everything
        score = 0;
        level = 1;
        lives = 3;
        dx = 2;
        dy = -2;
        isGameOver = false;
        resetBallAndPaddle();
        draw();
    }
});

// Cursor pointer on hover
canvas.addEventListener("mousemove", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (
        isGameOver &&
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
    ) {
        canvas.style.cursor = "pointer";
    } else {
        canvas.style.cursor = "default";
    }
});

draw();
