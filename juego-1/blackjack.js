let fichas = 50000;
let jugador = [];
let casa = [];
let jugando = false;
let apuesta = 0;

// Referencias a elementos del DOM
let fichasElement = document.getElementById("fichas");
let resultElement = document.getElementById("result");
let playerCardsContainer = document.getElementById("playerCards");
let dealerCardsContainer = document.getElementById("dealerCards");
let puntosJugadorElement = document.getElementById("puntosJugador");
let puntosCasaElement = document.getElementById("puntosCasa");
let btnDoblar = document.getElementById("btnDoblar");
let btnPedir = document.querySelector("button[onclick='pedirCarta()']");
let btnPlantarse = document.querySelector("button[onclick='plantarse()']");
let btnNueva = document.querySelector("button[onclick='nuevaRonda()']");
let inputApuesta = document.getElementById("apuesta");

const palos = ['♥️', '♦️', '♣️', '♠️'];

function nuevaRonda() {
    // 1. Limpieza y Validaciones
    resultElement.textContent = "";
    resultElement.className = "";
    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";
    puntosJugadorElement.textContent = "";
    puntosCasaElement.textContent = "";

    if (fichas <= 0) {
        alert("Te has quedado sin fichas. Recarga la página para reiniciar.");
        return;
    }

    apuesta = parseInt(inputApuesta.value);
    if (isNaN(apuesta) || apuesta <= 0) {
        alert("Introduce una apuesta válida mayor a 0.");
        return;
    }
    if (apuesta > fichas) {
        alert("No tienes suficientes fichas para esa apuesta.");
        return;
    }

    // 2. Configuración Inicial
    jugando = true;
    
    // Deshabilitar TODO mientras se reparten las cartas
    btnNueva.disabled = true;
    inputApuesta.disabled = true;
    btnPedir.disabled = true;
    btnPlantarse.disabled = true;
    btnDoblar.disabled = true;

    // Generar manos internamente
    jugador = [generarCarta(), generarCarta()];
    casa = [generarCarta(), generarCarta()];

    // 3. Secuencia de Reparto Animada (P -> C -> P -> C)
    // Usamos setTimeout para simular el reparto una a una
    
    // Carta 1 Jugador (0ms)
    repartirCartaVisual(jugador[0], playerCardsContainer, 0);
    
    // Carta 1 Casa (500ms) - Visible
    setTimeout(() => {
        repartirCartaVisual(casa[0], dealerCardsContainer, 0);
        actualizarPuntos(false); // Mostrar valor de la carta visible
    }, 500);

    // Carta 2 Jugador (1000ms)
    setTimeout(() => {
        repartirCartaVisual(jugador[1], playerCardsContainer, 0);
        actualizarPuntos(false);
    }, 1000);

    // Carta 2 Casa (1500ms) - Oculta
    setTimeout(() => {
        // La segunda carta de la casa se crea oculta
        const cartaOcultaDiv = crearCartaHTML(casa[1], true);
        dealerCardsContainer.appendChild(cartaOcultaDiv);
        
        // Una vez terminadas las animaciones (aprox 2000ms), chequeamos Blackjack
        setTimeout(verificarBlackjackInicial, 600); 
    }, 1500);
}

function verificarBlackjackInicial() {
    const bjJugador = sumaMano(jugador) === 21;
    const bjCasa = sumaMano(casa) === 21;

    // Actualizar puntos visibles
    actualizarPuntos(false);

    if (bjCasa) {
        // Si la casa tiene Blackjack, voltea inmediatamente y termina
        voltearCartaCasa();
        actualizarPuntos(true);
        
        if (bjJugador) {
            finalizarJuego("Empate. Ambos tienen Blackjack.", "draw");
        } else {
            finalizarJuego("La casa tiene Blackjack. Pierdes.", "lose");
        }
        return;
    }

    if (bjJugador) {
        // Jugador tiene Blackjack y casa NO (ya verificado arriba)
        // Paga 3 a 2
        fichas += Math.floor(apuesta * 1.5);
        // Restamos la apuesta "virtualmente" porque finalizarJuego la suma en modo 'win' simple,
        // pero aquí ya pagamos el bonus. Truco para usar la misma función:
        // Mejor lógica: pasar un flag especial o manejar fichas aquí.
        // Lo haremos simple: manejamos el pago aquí y llamamos finalizar con un tipo neutro visualmente.
        
        fichasElement.textContent = fichas;
        resultElement.textContent = "¡BLACKJACK! Ganaste 3 a 2.";
        resultElement.className = "win";
        
        terminarControles();
        return;
    }

    // Si nadie tiene Blackjack instantáneo, habilitamos controles
    btnPedir.disabled = false;
    btnPlantarse.disabled = false;
    
    // Doblar solo si hay saldo
    if (fichas >= apuesta * 2) {
        btnDoblar.disabled = false;
    }
}

function generarCarta() {
    const cartas = [
        { valor: 11, nombre: 'A' },
        { valor: 2, nombre: '2' }, { valor: 3, nombre: '3' },
        { valor: 4, nombre: '4' }, { valor: 5, nombre: '5' },
        { valor: 6, nombre: '6' }, { valor: 7, nombre: '7' },
        { valor: 8, nombre: '8' }, { valor: 9, nombre: '9' },
        { valor: 10, nombre: '10' }, { valor: 10, nombre: 'J' },
        { valor: 10, nombre: 'Q' }, { valor: 10, nombre: 'K' }
    ];
    const cartaBase = cartas[Math.floor(Math.random() * cartas.length)];
    const carta = { ...cartaBase }; 
    carta.palo = palos[Math.floor(Math.random() * palos.length)];
    return carta;
}

function sumaMano(mano) {
    let suma = 0;
    let ases = 0;
    for (let carta of mano) {
        suma += carta.valor;
        if (carta.nombre === 'A') ases++;
    }
    while (suma > 21 && ases > 0) {
        suma -= 10;
        ases--;
    }
    return suma;
}

// Función auxiliar para añadir carta al DOM sin lógica extra
function repartirCartaVisual(carta, contenedor, delay) {
    const div = crearCartaHTML(carta);
    if(delay > 0) div.style.animationDelay = `${delay}s`;
    contenedor.appendChild(div);
}

function crearCartaHTML(carta, oculta = false) {
    const div = document.createElement('div');
    div.classList.add('card');
    
    if (oculta) {
        div.id = "cartaOculta"; // ID para encontrarla luego
        div.style.background = `repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)`;
        div.style.borderColor = "#fff";
        return div;
    }

    if (carta.palo === '♥️' || carta.palo === '♦️') div.classList.add('red');
    else div.classList.add('black');

    div.innerHTML = `
        <span class="card-corner top-left">${carta.nombre}<br>${carta.palo}</span>
        <span class="card-suit-center">${carta.palo}</span>
        <span class="card-corner bottom-right">${carta.nombre}<br>${carta.palo}</span>
    `;
    return div;
}

function actualizarPuntos(mostrarCasaCompleta) {
    puntosJugadorElement.textContent = `(Total: ${sumaMano(jugador)})`;
    
    if (mostrarCasaCompleta) {
        puntosCasaElement.textContent = `(Total: ${sumaMano(casa)})`;
    } else {
        // Solo mostrar el valor de la primera carta
        // Si hay cartas en la mesa...
        if (casa.length > 0) {
            // Calculamos valor de carta visible (si es As vale 11 visualmente)
            let valorVisible = casa[0].valor; 
            puntosCasaElement.textContent = `(Visible: ${valorVisible})`;
        }
    }
}

function voltearCartaCasa() {
    const cartaOcultaDiv = document.getElementById("cartaOculta");
    if (cartaOcultaDiv) {
        // Reemplazamos el div oculto por la carta real
        const nuevaCarta = crearCartaHTML(casa[1]);
        // Insertamos antes de borrar para mantener flujo o usamos replaceWith
        cartaOcultaDiv.replaceWith(nuevaCarta);
    }
}

function pedirCarta() {
    if (!jugando) return;
    btnDoblar.disabled = true; // Ya no se puede doblar

    const nuevaCarta = generarCarta();
    jugador.push(nuevaCarta);
    repartirCartaVisual(nuevaCarta, playerCardsContainer, 0);
    
    actualizarPuntos(false);

    if (sumaMano(jugador) > 21) {
        finalizarJuego("Te pasaste de 21. La casa gana.", "lose");
    }
}

function doblar() {
    if (!jugando) return;
    
    // Restar fichas (apuesta adicional)
    // Nota: La resta real se hace al perder, o se calcula al ganar.
    // Para simplificar lógica visual:
    apuesta *= 2;
    document.getElementById("apuesta").value = apuesta;

    // Carta única
    const nuevaCarta = generarCarta();
    jugador.push(nuevaCarta);
    repartirCartaVisual(nuevaCarta, playerCardsContainer, 0);
    actualizarPuntos(false);

    if (sumaMano(jugador) > 21) {
        finalizarJuego("Te pasaste al doblar. La casa gana.", "lose");
    } else {
        plantarse();
    }
}

function plantarse() {
    if (!jugando) return;
    
    // Turno de la casa
    voltearCartaCasa();
    actualizarPuntos(true);

    // Animación de pedir cartas la casa con delay
    // Hacemos una función recursiva simple o bucle con delays
    jugarCasa();
}

function jugarCasa() {
    if (sumaMano(casa) < 17) {
        setTimeout(() => {
            const nuevaCarta = generarCarta();
            casa.push(nuevaCarta);
            repartirCartaVisual(nuevaCarta, dealerCardsContainer, 0);
            actualizarPuntos(true);
            jugarCasa(); // Recursión para la siguiente carta
        }, 800); // 800ms entre cartas de la casa
    } else {
        determinarGanador();
    }
}

function determinarGanador() {
    const totalJugador = sumaMano(jugador);
    const totalCasa = sumaMano(casa);

    if (totalCasa > 21) {
        finalizarJuego("La casa se pasó. ¡Ganaste!", "win");
    } else if (totalJugador > totalCasa) {
        finalizarJuego("¡Tienes mejor mano! Ganaste.", "win");
    } else if (totalJugador === totalCasa) {
        finalizarJuego("Empate. Nadie gana.", "draw");
    } else {
        finalizarJuego("La casa tiene mejor mano. Perdiste.", "lose");
    }
}

function finalizarJuego(mensaje, tipo) {
    // Calcular fichas
    if (tipo === "win") {
        fichas += apuesta;
    } else if (tipo === "lose") {
        fichas -= apuesta;
    }
    // Draw no hace nada

    fichasElement.textContent = fichas;
    resultElement.textContent = mensaje;
    resultElement.className = tipo;

    terminarControles();
}

function terminarControles() {
    jugando = false;
    btnPedir.disabled = true;
    btnPlantarse.disabled = true;
    btnDoblar.disabled = true;
    btnNueva.disabled = false;
    inputApuesta.disabled = false;
    
    // Restaurar apuesta base visualmente si se dobló (opcional)
    // inputApuesta.value = apuesta / (apuesta > parseInt(inputApuesta.value) ? 2 : 1);
}