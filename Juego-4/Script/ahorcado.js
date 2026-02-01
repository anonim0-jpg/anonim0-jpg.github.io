// Mezcla de palabras técnicas y corrientes
const words = [
     // Tech
    "JAVASCRIPT", "PYTHON", "HTML", "ALGORITMO", "SERVIDOR", "INTERNET", "JAVA", "LINUX", "DEBIAN", "UBUNTU", "UNIX", "IA", "PROGRAMACION",

    // Generales
    "ELEFANTE", "GUITARRA", "PANTALLA", "CHOCOLATE", "UNIVERSO", "ASTROLOGIA", "ASTROLOGO",
    "AVENTURA", "BICICLETA", "ESTRELLA", "MONTAÑA", "MUSICA", "ALGUACIL", "CASA", "PERRO", "GATO",
    "ARBOL", "COCHE", "CALLE", "CIUDAD", "PUEBLO", "MAR", "RIO", "MONTE", "CIELO", "TIERRA",
    "FUEGO", "AGUA", "VIENTO", "TIEMPO", "DIA", "NOCHE", "AÑO", "HOMBRE", "MUJER", "NIÑO",
    "AMIGO", "FAMILIA", "TRABAJO", "DINERO", "COMIDA", "BEBIDA", "PAN", "QUESO", "CARNE",
    "PESCADO", "FRUTA", "VERDURA", "SALUD", "ENFERMEDAD", "ESCUELA", "LIBRO", "PALABRA",
    "IDEA", "PENSAMIENTO", "MEMORIA", "HISTORIA", "PAIS", "GOBIERNO", "LEY", "JUSTICIA",
    "POLICIA", "GUERRA", "PAZ", "AMOR", "ODIO", "MIEDO", "ALEGRIA", "TRISTEZA", "RISA",
    "LLANTO", "SUEÑO", "REALIDAD", "IMAGEN", "SONIDO", "COLOR", "FORMA", "TAMAÑO",
    "FUERZA", "ENERGIA", "MOVIMIENTO", "CAMINO", "VIAJE", "LUGAR", "ESPACIO", "CUERPO",
    "MENTE", "CORAZON", "SANGRE", "HUESO", "PIEL", "MANO", "PIE", "CABEZA", "OJOS",
    "BOCA", "NARIZ", "OREJA", "VOZ", "SILENCIO", "RUIDO", "ORDEN", "CAOS", "INICIO",
    "FINAL", "ERROR", "EXITO", "RIESGO", "CONTROL", "CAMBIO", "PROBLEMA", "SOLUCION",
    "RESPUESTA", "DECISION", "VALOR", "OPINION", "SOL", "LUNA", "PLANETA", "ESTACION",
    "INVIERNO", "VERANO", "OTOÑO", "PRIMAVERA", "CLIMA", "TEMPERATURA", "LLUVIA",
    "NIEVE", "TORMENTA", "NUBE", "RAYO", "TRUENO", "CAMPO", "BOSQUE", "SELVA", "DESIERTO",
    "ISLA", "PLAYA", "ARENA", "PIEDRA", "METAL", "MADERA", "PLASTICO", "VIDRIO", "PAPEL",
    "TINTA", "MESA", "SILLA", "PUERTA", "VENTANA", "PARED", "TECHO", "SUELO", "COCINA",
    "BAÑO", "DORMITORIO", "ROPA", "ZAPATO", "CAMISA", "PANTALON", "ABRIGO", "SOMBRERO",
    "RELOJ", "LLAVE", "BOLSO", "MOCHILA", "HERRAMIENTA", "MARTILLO", "CLAVO", "CUCHILLO",
    "TIJERA", "CUERDA", "CADENA", "RUEDA", "MOTOR", "MAQUINA", "CIENCIA", "TECNICA",
    "ARTE", "CULTURA", "RELIGION", "FILOSOFIA", "LOGICA", "NUMERO", "CUENTA", "MEDIDA",
    "PRECIO", "COSTE", "BENEFICIO", "PERDIDA", "MERCADO", "EMPRESA", "CLIENTE", "SERVICIO", "PRODUCTO", "CALVO"

];

const word = words[Math.floor(Math.random() * words.length)];
let guessedLetters = Array(word.length).fill("_");
let wrongAttempts = 0;
const maxAttempts = 6;
let gameActive = true;
const usedKeys = [];

const wordDisplay = document.getElementById("wordDisplay");
const messageDisplay = document.getElementById("message");
const keyboardDiv = document.getElementById("keyboard");

function updateDisplay() {
    wordDisplay.textContent = guessedLetters.join(" ");
}

// Generar teclado QWERTY en 3 filas
function createKeyboard() {
    // Filas del teclado estándar español
    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKLÑ",
        "ZXCVBNM"
    ];

    keyboardDiv.innerHTML = "";
    
    rows.forEach(rowString => {
        // Crear contenedor para la fila
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";
        
        // Crear botones para cada letra de la fila
        rowString.split("").forEach(letter => {
            const btn = document.createElement("button");
            btn.textContent = letter;
            btn.classList.add("key-btn");
            btn.id = `key-${letter}`;
            btn.onclick = () => handleGuess(letter);
            rowDiv.appendChild(btn);
        });

        keyboardDiv.appendChild(rowDiv);
    });
}

function handleGuess(letter) {
    if (!gameActive || usedKeys.includes(letter)) return;

    usedKeys.push(letter);
    
    const btn = document.getElementById(`key-${letter}`);
    if (btn) btn.disabled = true;

    if (word.includes(letter)) {
        if (btn) btn.classList.add("correct");
        word.split("").forEach((char, index) => {
            if (char === letter) guessedLetters[index] = letter;
        });
        messageDisplay.textContent = "¡Bien!";
    } else {
        if (btn) btn.classList.add("wrong");
        drawBodyPart(wrongAttempts);
        wrongAttempts++;
        messageDisplay.textContent = "¡Fallaste!";
    }

    updateDisplay();
    checkWinCondition();
}

function drawBodyPart(index) {
    const part = document.getElementById(`part-${index}`);
    if (part) part.classList.add("visible");
}

function checkWinCondition() {
    if (!guessedLetters.includes("_")) {
        messageDisplay.textContent = "¡GANASTE! 🎉";
        messageDisplay.style.color = "#a3ffac";
        gameActive = false;
        disableAllKeys();
        setTimeout(() => location.reload(), 2500);
    } else if (wrongAttempts >= maxAttempts) {
        messageDisplay.textContent = `¡PERDISTE! Era: ${word}`;
        messageDisplay.style.color = "#ffb3b3";
        gameActive = false;
        disableAllKeys();
        setTimeout(() => location.reload(), 2500);
    }
}

function disableAllKeys() {
    const buttons = document.querySelectorAll(".key-btn");
    buttons.forEach(btn => btn.disabled = true);
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toUpperCase();
    if (/^[A-ZÑ]$/.test(key) && gameActive) {
        handleGuess(key);
    }
});

// Iniciar
createKeyboard();
updateDisplay();