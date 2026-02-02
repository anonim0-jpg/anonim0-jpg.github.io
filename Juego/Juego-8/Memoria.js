const tablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');
const botonReiniciar = document.getElementById('reiniciar');

const iconos = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍍', '🍓', '🥝'];
let cartas = [...iconos, ...iconos]; // Duplicar los iconos para formar los pares
let cartaVolteada = null;
let bloqueado = false;
let paresEncontrados = 0;

// Iniciar el juego
function iniciarJuego() {
    tablero.innerHTML = '';
    mensaje.textContent = 'Encuentra todos los pares.';
    paresEncontrados = 0;
    cartaVolteada = null;
    bloqueado = false;

    // Mezclar cartas
    cartas = cartas.sort(() => Math.random() - 0.5);

    // Crear cada carta en el tablero
    cartas.forEach((icono) => {
        const carta = document.createElement('div');
        carta.classList.add('carta');
        carta.dataset.icono = icono;
        carta.addEventListener('click', voltearCarta);
        tablero.appendChild(carta);
    });
}

function voltearCarta() {
    if (bloqueado) return;
    if (this === cartaVolteada) return;

    this.classList.add('volteada');
    this.textContent = this.dataset.icono;

    if (!cartaVolteada) {
        // Primer clic en una carta
        cartaVolteada = this;
    } else {
        // Segundo clic en una carta
        compararCartas(this);
    }
}

function compararCartas(cartaActual) {
    bloqueado = true;

    if (cartaVolteada.dataset.icono === cartaActual.dataset.icono) {
        // Si las cartas coinciden
        cartaVolteada.classList.add('correcto');
        cartaActual.classList.add('correcto');
        paresEncontrados++;

        if (paresEncontrados === iconos.length) {
            mensaje.textContent = '¡Felicidades! Has encontrado todos los pares.';
            messageElement.style.color = 'green';
        }

        resetCartas();
    } else {
        // Si las cartas no coinciden, ocultarlas después de un momento
        setTimeout(() => {
            cartaVolteada.classList.remove('volteada');
            cartaVolteada.textContent = '';
            cartaActual.classList.remove('volteada');
            cartaActual.textContent = '';
            resetCartas();
        }, 1000);
    }
}

function resetCartas() {
    cartaVolteada = null;
    bloqueado = false;
}

// Reiniciar el juego al hacer clic en el botón
botonReiniciar.addEventListener('click', iniciarJuego);

// Iniciar el juego al cargar la página
iniciarJuego();
