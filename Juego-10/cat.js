const tablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');
const botonReiniciar = document.getElementById('reiniciar');

const filas = 9;
const columnas = 9;
const tableroEstado = [];
let posicionGato = { x: 4, y: 4 };

// Inicializar el juego
function iniciarJuego() {
    tablero.innerHTML = '';
    tableroEstado.length = 0;
    mensaje.textContent = "Intenta atrapar al gato antes de que escape del tablero.";

    // Crear el tablero y añadir celdas
    for (let y = 0; y < filas; y++) {
        const fila = [];
        for (let x = 0; x < columnas; x++) {
            const celda = document.createElement('div');
            celda.classList.add('hex');
            celda.dataset.x = x;
            celda.dataset.y = y;
            celda.addEventListener('click', bloquearCelda);
            tablero.appendChild(celda);
            fila.push(celda);
        }
        tableroEstado.push(fila);
    }

    // Colocar el gato en el centro
    tableroEstado[posicionGato.y][posicionGato.x].classList.add('gato');
}

// Manejar el clic para bloquear una celda
function bloquearCelda(event) {
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (x === posicionGato.x && y === posicionGato.y) return;
    if (event.target.classList.contains('bloqueado')) return;

    event.target.classList.add('bloqueado');

    moverGato();
}

// Mover el gato
function moverGato() {
    const direcciones = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 1 },
        { dx: 1, dy: -1 }
    ];

    let gatoMovido = false;

    for (const { dx, dy } of direcciones) {
        const nuevoX = posicionGato.x + dx;
        const nuevoY = posicionGato.y + dy;

        if (
            nuevoX >= 0 &&
            nuevoY >= 0 &&
            nuevoX < columnas &&
            nuevoY < filas &&
            !tableroEstado[nuevoY][nuevoX].classList.contains('bloqueado')
        ) {
            tableroEstado[posicionGato.y][posicionGato.x].classList.remove('gato');
            posicionGato = { x: nuevoX, y: nuevoY };
            tableroEstado[nuevoY][nuevoX].classList.add('gato');
            gatoMovido = true;
            break;
        }
    }

    if (!gatoMovido) {
        mensaje.textContent = "¡Has atrapado al gato!";
    } else if (
        posicionGato.x === 0 ||
        posicionGato.y === 0 ||
        posicionGato.x === columnas - 1 ||
        posicionGato.y === filas - 1
    ) {
        mensaje.textContent = "¡El gato ha escapado!";
    }
}

// Reiniciar el juego
botonReiniciar.addEventListener('click', () => {
    posicionGato = { x: 4, y: 4 };
    iniciarJuego();
});

// Iniciar el juego al cargar la página
iniciarJuego();
