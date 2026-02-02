const tablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');
const botonReiniciar = document.getElementById('reiniciar');

let tableroEstado = ['', '', '', '', '', '', '', '', ''];
let turno = 'X';
let juegoActivo = true;

// Combinaciones ganadoras
const combinacionesGanadoras = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Maneja el clic en cada celda
function manejarClickCelda(event) {
    const index = event.target.getAttribute('data-index');

    if (tableroEstado[index] !== '' || !juegoActivo) return;

    tableroEstado[index] = turno;
    event.target.classList.add(turno.toLowerCase());
    event.target.textContent = turno;

    verificarResultado();
}

// Verifica si hay un ganador o un empate
function verificarResultado() {
    let rondaGanada = false;

    for (const combinacion of combinacionesGanadoras) {
        const [a, b, c] = combinacion;
        if (tableroEstado[a] && tableroEstado[a] === tableroEstado[b] && tableroEstado[a] === tableroEstado[c]) {
            rondaGanada = true;
            break;
        }
    }

    if (rondaGanada) {
        mensaje.textContent = `¡${turno} ha ganado!`;
        juegoActivo = false;
        return;
    }

    if (!tableroEstado.includes('')) {
        mensaje.textContent = '¡Empate!';
        juegoActivo = false;
        return;
    }

    turno = turno === 'X' ? 'O' : 'X';
    mensaje.textContent = `Turno de: ${turno}`;
}

// Reiniciar el juego
function reiniciarJuego() {
    tableroEstado = ['', '', '', '', '', '', '', '', ''];
    turno = 'X';
    juegoActivo = true;
    mensaje.textContent = `Turno de: ${turno}`;

    document.querySelectorAll('.celda').forEach(celda => {
        celda.textContent = '';
        celda.classList.remove('x', 'o');
    });
}

// Añadir eventos a las celdas y al botón de reiniciar
document.querySelectorAll('.celda').forEach(celda => celda.addEventListener('click', manejarClickCelda));
botonReiniciar.addEventListener('click', reiniciarJuego);
