let level = 1;
let sequence = [];
let playerSequence = [];
let colors = ["red", "green", "blue", "yellow"];
let isPlayerTurn = false;

// Función para iniciar el juego
function startGame() {
    level = 1;
    sequence = [];
    playerSequence = [];
    document.getElementById("level").textContent = `Nivel: ${level}`;
    document.getElementById("message").textContent = "";
    nextRound();
}

// Función para avanzar a la siguiente ronda
function nextRound() {
    playerSequence = [];
    sequence.push(colors[Math.floor(Math.random() * 4)]);
    playSequence();
}

// Reproduce la secuencia de colores
function playSequence() {
    let index = 0;
    isPlayerTurn = false;

    const interval = setInterval(() => {
        flashColor(sequence[index]);
        index++;

        if (index >= sequence.length) {
            clearInterval(interval);
            isPlayerTurn = true;
            document.getElementById("message").textContent = "Tu turno";
        }
    }, 800);
}

// Muestra un destello en el color dado
function flashColor(color) {
    const colorElement = document.getElementById(color);
    colorElement.style.opacity = "1";
    setTimeout(() => {
        colorElement.style.opacity = "0.8";
    }, 400);
}

// Maneja el movimiento del jugador
function playerMove(color) {
    if (!isPlayerTurn) return;
    
    playerSequence.push(color);
    flashColor(color);

    // Compara la secuencia del jugador con la secuencia generada
    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
        gameOver();
        return;
    }

    // Si el jugador ha repetido toda la secuencia, avanza de nivel
    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        level++;
        document.getElementById("level").textContent = `Nivel: ${level}`;
        setTimeout(nextRound, 1000);
    }
}

// Función de fin de juego
function gameOver() {
    document.getElementById("message").textContent = `¡Juego terminado! Llegaste al nivel ${level}. Presiona "Empezar Juego" para volver a intentar.`;
    isPlayerTurn = false;
    sequence = [];
    playerSequence = [];
}
