//  =======================
//          Setup
//  =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleHitSound = document.getElementById("paddleHitSound");
const loseLifeSound = document.getElementById("loseLifeSound");
const bgMusic = document.getElementById("bgMusic");
const gameOverSound = document.getElementById("gameOverSound");
const winSound = document.getElementById("winSound");
const levelUpSound = document.getElementById("levelUpSound");

let highScore = localStorage.getItem("highScore") || 0;

let ballX, ballY;
let dx = 0;
let dy = 0;
let ballRadius, paddleHeight, paddleWidth;
let paddleX;
let score = 0;
let level = 1;
let lives = 5;
let nextLevelScore = 5;
let isGameStarted = false;
let isGameOver = false;
let isPaused = false;
let animationId;
let rightPressed = false;
let leftPressed = false;

const MAX_LEVEL = 3;
const WINNING_SCORE = (MAX_LEVEL - 1) * 5;

const button = {
  x: 0,
  y: 0,
  width: 100,
  height: 40,
  color: "#4285F4",
  text: "Restart"
};

function resizeCanvas() {
  const aspectRatio = 3 / 4;
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight;

  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

function updateDimensions() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ballRadius = canvas.height * 0.015;
  paddleHeight = canvas.height * 0.02;
  paddleWidth = canvas.width * 0.15;

  paddleX = (canvas.width - paddleWidth) / 2;
  ballX = canvas.width / 4;
  ballY = canvas.height - 30;
}

window.addEventListener("resize", () => {
  updateDimensions();
  resetBallAndPaddle();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
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
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawHighScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("High Score: " + highScore, 8, 40);
}

function drawLevel() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText("Level: " + level, canvas.width - 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText("Lives: " + lives, canvas.width - 8, 50);
}

function drawButton() {
  button.x = canvas.width / 2 - button.width / 2;
  button.y = canvas.height / 2 + 30;

  ctx.fillStyle = button.color;
  ctx.fillRect(button.x, button.y, button.width, button.height);

  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
}

function update() {
  if (isPaused || isGameOver || !isGameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawScore();
  drawHighScore();
  drawLevel();
  drawLives();

  ballX += dx;
  ballY += dy;

  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
    dx = -dx;
  }

  if (ballY + dy < ballRadius) {
    dy = -dy;
  } else if (ballY + dy > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      dy = -dy;
      paddleHitSound.currentTime = 0;
      paddleHitSound.play();
      score++;

      if (score >= nextLevelScore && score < WINNING_SCORE) {
        level++;
        nextLevelScore += 5;

        levelUpSound.currentTime = 0;
        levelUpSound.play().catch(e => console.warn("Level up sound error:", e));

        dx += dx > 0 ? 0.5 : -0.5;
        dy += dy > 0 ? 0.5 : -0.5;
      }

      if (score >= WINNING_SCORE) {
        isGameOver = true;
        cancelAnimationFrame(animationId);
        drawStartOrGameOverScreen();
        return;
      }
    } else {
      lives--;
      loseLifeSound.currentTime = 0;
      loseLifeSound.play();

      if (lives === 0) {
        isGameOver = true;
        cancelAnimationFrame(animationId);
        drawStartOrGameOverScreen();
        return;
      } else {
        resetBallAndPaddle();
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
  else if (leftPressed && paddleX > 0) paddleX -= 6;

  animationId = requestAnimationFrame(update);
}

function resetBallAndPaddle() {
  paddleX = (canvas.width - paddleWidth) / 2;
  ballX = canvas.width / 2;
  ballY = ballRadius + 10;

  const baseSpeed = Math.min(1.5 + level * 0.5, 6);
  const direction = Math.random() < 0.5 ? -1 : 1;
  dx = baseSpeed * direction;
  dy = baseSpeed;
}

function drawStartOrGameOverScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore();
  drawLevel();
  drawLives();

  bgMusic.pause();
  ctx.font = "28px Arial";
  ctx.textAlign = "center";

  if (!isGameStarted) {
    ctx.fillStyle = "#fff";
    ctx.fillText("Press play to start", canvas.width / 2, canvas.height / 2 - 40);
    button.text = "Play";
  } else if (isGameOver) {
    const isWin = (lives > 0);

    if (isWin) {
      winSound.currentTime = 0;
      winSound.play().catch(e => console.warn("Win sound error:", e));
    } else {
      gameOverSound.currentTime = 0;
      gameOverSound.play().catch(e => console.warn("Game Over sound error:", e));
    }

    // Update high score if current score is higher
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    ctx.fillStyle = isWin ? "#FFD700" : "#f00";
    const message = isWin ? "You Win!" : "Game Over";
    button.text = isWin ? "Play Again" : "Restart";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

    // Display high score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("High Score: " + highScore, canvas.width / 2, canvas.height / 2 + 20);

    document.getElementById("leftBtn").disabled = true;
    document.getElementById("rightBtn").disabled = true;
    document.getElementById("pauseBtn").disabled = true;
  }

  drawButton();
}

canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const clickedButton =
    mouseX >= button.x &&
    mouseX <= button.x + button.width &&
    mouseY >= button.y &&
    mouseY <= button.y + button.height;

  if (clickedButton) {
    isGameStarted = true;
    isGameOver = false;
    score = 0;
    level = 1;
    lives = 5;
    isPaused = false;

    document.getElementById("leftBtn").disabled = false;
    document.getElementById("rightBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = false;

    bgMusic.currentTime = 0;
    bgMusic.play();

    gameOverSound.muted = true;
    gameOverSound.play().then(() => {
      gameOverSound.pause();
      gameOverSound.currentTime = 0;
      gameOverSound.muted = false;
    }).catch(() => {});

    updateDimensions();
    resetBallAndPaddle();
    update();
  }

  document.getElementById("pauseBtn").innerHTML =
    '<i class="fas fa-pause" style="margin-right: 8px;"></i>Pause';
});

canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const hoveringButton =
    mouseX >= button.x &&
    mouseX <= button.x + button.width &&
    mouseY >= button.y &&
    mouseY <= button.y + button.height;

  canvas.style.cursor =
    (!isGameStarted || isGameOver) && hoveringButton ? "pointer" : "default";
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  if (isGameOver || !isGameStarted) return;

  isPaused = !isPaused;
  const pauseBtn = document.getElementById("pauseBtn");

  pauseBtn.innerHTML = isPaused
    ? '<i class="fas fa-play" style="margin-right: 8px;"></i>Resume'
    : '<i class="fas fa-pause" style="margin-right: 8px;"></i>Pause';

  if (isPaused) {
    cancelAnimationFrame(animationId);
  } else {
    update();
  }
});

// Touch controls (only for mobile)
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.getElementById("leftBtn").style.display = "inline-block";
  document.getElementById("rightBtn").style.display = "inline-block";
  document.getElementById("pause-label").style.display = "none";

  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  leftBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    leftPressed = true;
  });
  leftBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    leftPressed = false;
  });

  rightBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    rightPressed = true;
  });
  rightBtn.addEventListener("touchend", (e) => {
    e.preventDefault();
    rightPressed = false;
  });
}

// Initial setup
updateDimensions();
drawStartOrGameOverScreen();
