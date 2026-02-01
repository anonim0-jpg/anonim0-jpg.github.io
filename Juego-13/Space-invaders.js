const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const mensajeElement = document.getElementById("mensaje");
const reiniciarButton = document.getElementById("reiniciar");

const playerWidth = 50;
const playerHeight = 20;
const invaderWidth = 30;
const invaderHeight = 20;
const invaderRowCount = 5;
const invaderColumnCount = 10;
const bulletWidth = 5;
const bulletHeight = 10;

let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height - playerHeight - 10;
let playerSpeed = 5;
let bullets = [];
let invaders = [];
let score = 0;
let gameRunning = true;

// Inicializar los invasores
function initInvaders() {
    invaders = [];
    for (let row = 0; row < invaderRowCount; row++) {
        invaders[row] = [];
        for (let col = 0; col < invaderColumnCount; col++) {
            invaders[row][col] = { x: col * (invaderWidth + 10), y: row * (invaderHeight + 10), alive: true };
        }
    }
}

// Dibujar el jugador
function drawPlayer() {
    ctx.fillStyle = "green";
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
}

// Dibujar los invasores
function drawInvaders() {
    ctx.fillStyle = "red";
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            if (invaders[row][col].alive) {
                ctx.fillRect(invaders[row][col].x, invaders[row][col].y, invaderWidth, invaderHeight);
            }
        }
    }
}

// Dibujar las balas
function drawBullets() {
    ctx.fillStyle = "yellow";
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillRect(bullets[i].x, bullets[i].y, bulletWidth, bulletHeight);
    }
}

// Mover las balas
function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 5;

        // Eliminar balas fuera de la pantalla
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// Comprobar colisiones entre balas e invasores
function checkBulletCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let row = 0; row < invaderRowCount; row++) {
            for (let col = 0; col < invaderColumnCount; col++) {
                if (invaders[row][col].alive) {
                    if (
                        bullets[i].x < invaders[row][col].x + invaderWidth &&
                        bullets[i].x + bulletWidth > invaders[row][col].x &&
                        bullets[i].y < invaders[row][col].y + invaderHeight &&
                        bullets[i].y + bulletHeight > invaders[row][col].y
                    ) {
                        invaders[row][col].alive = false;
                        bullets.splice(i, 1);
                        score += 10;
                        scoreElement.textContent = `Puntuación: ${score}`;
                        i--;
                    }
                }
            }
        }
    }
}

// Mover el jugador
function movePlayerLeft() {
    if (playerX > 0) {
        playerX -= playerSpeed;
    }
}

function movePlayerRight() {
    if (playerX + playerWidth < canvas.width) {
        playerX += playerSpeed;
    }
}

// Disparar una bala
function shootBullet() {
    bullets.push({ x: playerX + playerWidth / 2 - bulletWidth / 2, y: playerY });
}

// Actualizar el estado del juego
function updateGame() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveBullets();
    checkBulletCollisions();
    drawPlayer();
    drawInvaders();
    drawBullets();

    // Comprobar si los invasores llegaron al fondo
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            if (invaders[row][col].alive && invaders[row][col].y + invaderHeight >= playerY) {
                endGame(false);
            }
        }
    }

    // Comprobar si todos los invasores han sido derrotados
    let allInvadersDefeated = true;
    for (let row = 0; row < invaderRowCount; row++) {
        for (let col = 0; col < invaderColumnCount; col++) {
            if (invaders[row][col].alive) {
                allInvadersDefeated = false;
                break;
            }
        }
        if (!allInvadersDefeated) break;
    }

    if (allInvadersDefeated) {
        endGame(true);
    }
}

// Finalizar el juego
function endGame(victory) {
    gameRunning = false;
    if (victory) {
        mensajeElement.textContent = "¡Has ganado! Todos los invasores han sido derrotados.";
    } else {
        mensajeElement.textContent = "¡Has perdido! Los invasores han llegado a la tierra.";
    }
}

// Reiniciar el juego
function restartGame() {
    playerX = canvas.width / 2 - playerWidth / 2;
    playerY = canvas.height - playerHeight - 10;
    score = 0;
    scoreElement.textContent = `Puntuación: ${score}`;
    bullets = [];
    initInvaders();
    gameRunning = true;
    mensajeElement.textContent = "¡Destruye a todos los invasores!";
    drawGame();
}

// Manejar las teclas
document.addEventListener("keydown", function (event) {
    if (!gameRunning) return;

    if (event.key === "ArrowLeft") {
        movePlayerLeft();
    } else if (event.key === "ArrowRight") {
        movePlayerRight();
    } else if (event.key === " ") {
        shootBullet();
    }

    drawGame();
});

// Iniciar el juego
reiniciarButton.addEventListener("click", restartGame);
initInvaders();
drawGame();
