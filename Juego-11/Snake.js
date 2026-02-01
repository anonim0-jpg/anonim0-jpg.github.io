const gameBoard = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay-message');
const msgTitle = document.getElementById('msg-title');
const btnRestart = document.getElementById('btn-restart');

// Configuración
const COLS = 21; 
const ROWS = 21;
let cellSize;
let speed = 110;

// Estado
let snake = [];
let food = {};
let direction = { x: 0, y: 0 };
let inputQueue = [];
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let isGameActive = false;

highScoreEl.textContent = highScore;

// --- INICIALIZACIÓN ---
function initGrid() {
    // Reducimos un pelín el tamaño máximo para dejar sitio al nuevo borde grueso
    // Antes era 0.90 y 0.6, ahora 0.85 y 0.55 para que no se salga de la pantalla
    const maxWidth = Math.min(window.innerWidth * 0.85, 420);
    const maxHeight = window.innerHeight * 0.55;
    
    const sizeW = Math.floor(maxWidth / COLS);
    const sizeH = Math.floor(maxHeight / ROWS);
    cellSize = Math.min(sizeW, sizeH);

    // Aplicamos el tamaño EXACTO a la rejilla
    gameBoard.style.gridTemplateColumns = `repeat(${COLS}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${ROWS}, ${cellSize}px)`;
    gameBoard.style.width = `${cellSize * COLS}px`;
    gameBoard.style.height = `${cellSize * ROWS}px`;

    gameBoard.innerHTML = '';
    for (let i = 0; i < ROWS * COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        
        // Patrón de ajedrez visual
        const x = i % COLS;
        const y = Math.floor(i / COLS);
        if ((x + y) % 2 === 0) cell.classList.add('even');
        else cell.classList.add('odd');
        
        gameBoard.appendChild(cell);
    }
}

// --- DIBUJADO ---
function draw() {
    const activeElements = document.querySelectorAll('.snake-body, .snake-head, .food');
    activeElements.forEach(el => el.remove());

    const cells = gameBoard.children;

    // Dibujar Comida
    const foodIdx = food.y * COLS + food.x;
    if (cells[foodIdx]) {
        const foodDiv = document.createElement('div');
        foodDiv.className = 'food';
        cells[foodIdx].appendChild(foodDiv);
    }

    // Dibujar Serpiente
    snake.forEach((part, index) => {
        const idx = part.y * COLS + part.x;
        if (!cells[idx]) return;

        const partDiv = document.createElement('div');
        
        if (index === 0) {
            partDiv.className = 'snake-head';
            const eyeL = document.createElement('div'); eyeL.className = 'eye left';
            const eyeR = document.createElement('div'); eyeR.className = 'eye right';
            partDiv.appendChild(eyeL);
            partDiv.appendChild(eyeR);

            // Rotación visual
            let deg = 0;
            if (direction.x === 1) deg = 90;
            if (direction.x === -1) deg = -90;
            if (direction.y === 1) deg = 180;
            partDiv.style.transform = `rotate(${deg}deg)`;
        } else {
            partDiv.className = 'snake-body';
        }
        cells[idx].appendChild(partDiv);
    });
}

// --- LÓGICA ---
function spawnFood() {
    while (true) {
        const x = Math.floor(Math.random() * COLS);
        const y = Math.floor(Math.random() * ROWS);
        // Evitar que la comida nazca dentro de la serpiente
        const onSnake = snake.some(p => p.x === x && p.y === y);
        if (!onSnake) {
            food = { x, y };
            break;
        }
    }
}

function update() {
    if (!isGameActive) return;

    let nextDir = direction;

    // --- FILTRO ANTI-SUICIDIO (NUEVO) ---
    // Procesamos la cola hasta encontrar un movimiento que NO nos mate contra una pared
    while (inputQueue.length > 0) {
        const candidateDir = inputQueue.shift();
        
        // 1. Verificar giro de 180 grados (ilegal en snake)
        const oppositeX = candidateDir.x === -direction.x && candidateDir.x !== 0;
        const oppositeY = candidateDir.y === -direction.y && candidateDir.y !== 0;
        if (oppositeX || oppositeY) continue; // Descartar movimiento inverso

        // 2. Verificar si este movimiento nos estampa contra una pared INMEDIATAMENTE
        const futureHead = { x: snake[0].x + candidateDir.x, y: snake[0].y + candidateDir.y };
        if (futureHead.x < 0 || futureHead.x >= COLS || futureHead.y < 0 || futureHead.y >= ROWS) {
            // ¡Este movimiento nos mataría contra la pared!
            // Lo ignoramos (como si el usuario no hubiera pulsado la tecla prohibida)
            // y esperamos a ver si hay otro movimiento en la cola (ej: el giro correcto).
            continue; 
        }

        // Si pasa los filtros, aceptamos la nueva dirección
        nextDir = candidateDir;
        break; // Ya tenemos dirección, salimos del bucle
    }

    direction = nextDir;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // 1. Choque PAREDES (Ahora es difícil que pase por error gracias al filtro, pero si sigues recto mueres)
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return gameOver();
    }

    // 2. Choque CUERPO
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    // Comer
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.innerText = score;
        spawnFood();
        // Aumentar velocidad
        if (score % 5 === 0 && speed > 70) {
            clearInterval(gameInterval);
            speed -= 4;
            gameInterval = setInterval(update, speed);
        }
    } else {
        snake.pop();
    }

    draw();
}

function gameOver() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.innerText = highScore;
        msgTitle.innerText = "¡NUEVO RÉCORD!";
    } else {
        msgTitle.innerText = "GAME OVER";
    }
    
    overlay.classList.remove('hidden');
    btnRestart.style.display = 'block';
}

function queueMove(x, y) {
    if (!isGameActive) return;
    
    // Solo añadimos a la cola, el filtrado "inteligente" se hace en update()
    if (inputQueue.length < 3) { // Permitimos un poco más de buffer
        inputQueue.push({ x, y });
    }
}

function startGame() {
    snake = [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}];
    direction = {x: 0, y: -1};
    inputQueue = [];
    score = 0;
    speed = 110;
    scoreEl.innerText = "0";
    
    overlay.classList.add('hidden');
    isGameActive = true;

    initGrid();
    spawnFood();
    draw();

    clearInterval(gameInterval);
    gameInterval = setInterval(update, speed);
}

// Eventos Teclado
document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': queueMove(0, -1); break;
        case 'ArrowDown': case 's': case 'S': queueMove(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': queueMove(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': queueMove(1, 0); break;
    }
});

// Eventos Táctiles
const bindTouch = (id, x, y) => {
    const btn = document.getElementById(id);
    // Usamos touchstart para respuesta inmediata en móvil
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        queueMove(x, y);
        btn.style.transform = "scale(0.9)";
        btn.style.background = "rgba(255,255,255,0.3)";
    }, { passive: false });
    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.style.transform = "scale(1)";
        btn.style.background = "rgba(255,255,255,0.1)";
    }, { passive: false });
    
    btn.addEventListener('mousedown', () => queueMove(x, y));
};

bindTouch('btn-up', 0, -1);
bindTouch('btn-down', 0, 1);
bindTouch('btn-left', -1, 0);
bindTouch('btn-right', 1, 0);

btnRestart.addEventListener('click', startGame);

window.addEventListener('resize', () => {
    initGrid();
    if(isGameActive) draw();
});

initGrid();
overlay.classList.remove('hidden');
msgTitle.innerText = "SNAKE";
btnRestart.innerText = "JUGAR";