# Ball and Paddle Game
A simple and elegant Ball-and-Paddle browser game built with plain HTML, CSS, and JavaScript—perfect for testing game logic, animation, and user interaction fundamentals.

## 🚀 Live Demo
Play it here:
[Live Ball and Paddle Game](https://rytvee.github.io/ball-and-paddle/)

## 📌 Features
- Ball bouncing off walls and paddle
- Simple collision detection
- Keyboard controls for paddle movement
- Pure HTML/CSS/JavaScript (no external libraries)
- Mobile controls

## 📂 Folder Structure
```text
tic-tac-toe/
│── index.html        # Main game layout
│── style.css         # Styling for the game board & UI
│── game.js           # Game logic (players, computer AI, score)
│── sounds/           # music, sounds 
└── images/           # Icon, game play gif
```

## 🎮 Gameplay Overview

| Part                   | Role                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Ball**               | Moves up/down & bounces off walls and paddle. Position updates using `requestAnimationFrame`. |
| **Paddle**             | Controlled by user (move left/right or up/down depending on implementation).                  |
| **Collision Logic**    | Detects overlap between ball and paddle or walls. Reverses direction upon impact.             |
| **Scoring (optional)** | Could be added to track missed hits or keep points.                                           |


## 🎮 Game Play

![2-Players Mode](images/game-play.gif)
