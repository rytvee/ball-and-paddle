//  =======================
//  Setup
//  =======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const pauseBtn = document.getElementById("pauseBtn");
const pauseIcon = document.getElementById("pause-icon");
const pauseLabel = document.getElementById("pause-label");

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

const MAX_LEVEL = 6;
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

  // Make paddle wider on mobile
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    paddleWidth = canvas.width * 0.25; // 25% of screen width on mobile
  } else {
    paddleWidth = canvas.width * 0.15; // 15% on desktop
  }

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

// =======================
// Music Toggle
// =======================
let musicMuted = false;
const musicIcon = {
  x: 100,
  y: 10,
  size: 20
};

function drawMusicIcon() {
  const iconX = canvas.width - 25;
  const iconY = 60;

  // Clear previous icon area
  ctx.clearRect(iconX - 2, iconY - 2, musicIcon.size + 4, musicIcon.size + 4);

  ctx.save();
  ctx.font = `900 ${musicIcon.size}px "Font Awesome 6 Free"`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Draw only the correct icon
  const icon = musicMuted ? "\uf6a9" : "\uf028"; // mute / volume
  ctx.fillText(icon, iconX, iconY);

  ctx.restore();

  // Update clickable area
  musicIcon.x = iconX - musicIcon.size / 2;
  musicIcon.y = iconY;
  musicIcon.width = musicIcon.size;
  musicIcon.height = musicIcon.size;
}

// =======================
// Game Canvas Functions
// =======================

function update() {
  if (isPaused || isGameOver || !isGameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawScore();
  drawHighScore();
  drawLevel();
  drawLives();
  drawMusicIcon();

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

  // Check if music icon is clicked
  if (
    mouseX >= musicIcon.x &&
    mouseX <= musicIcon.x + musicIcon.width &&
    mouseY >= musicIcon.y &&
    mouseY <= musicIcon.y + musicIcon.height
  ) {
    musicMuted = !musicMuted;
    bgMusic.muted = musicMuted; // toggle the actual music
    drawMusicIcon(); // redraw the icon immediately
    return; // stop further click actions
  }

  // Check if the restart/play button is clicked
  const clickedButton =
    mouseX >= button.x &&
    mouseX <= button.x + button.width &&
    mouseY >= button.y &&
    mouseY <= button.y + button.height;

  if (clickedButton) {
    // Start/restart game logic
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

    updateDimensions();
    resetBallAndPaddle();
    update();
  }
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


pauseBtn.addEventListener("click", () => {
  if (isGameOver || !isGameStarted) return;

  isPaused = !isPaused;

  if (isPaused) {
    pauseIcon.className = "fas fa-play"; // show play icon
    pauseLabel.textContent = "Resume";
    cancelAnimationFrame(animationId);
  } else {
    pauseIcon.className = "fas fa-pause"; // show pause icon
    pauseLabel.textContent = "Pause";
    update();
  }
});


// =======================
// Touch controls (only for mobile)
// =======================
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

// =======================
// Desktop Mouse Control
// =======================
document.getElementById("leftBtn").addEventListener("mousedown", () => leftPressed = true);
document.getElementById("leftBtn").addEventListener("mouseup", () => leftPressed = false);
document.getElementById("rightBtn").addEventListener("mousedown", () => rightPressed = true);
document.getElementById("rightBtn").addEventListener("mouseup", () => rightPressed = false);

// Initial setup
updateDimensions();
drawStartOrGameOverScreen();
