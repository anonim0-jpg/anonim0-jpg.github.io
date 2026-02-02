// ============================================
// BLACKJACK CON TODAS LAS REGLAS IMPLEMENTADAS
// ============================================

// --- VARIABLES GLOBALES ---
let fichas = 50000;
let apuesta = 0;
let jugando = false;

// Baraja de 4 mazos de 52 cartas (208 cartas total)
let baraja = [];

// Manos
let casa = [];
let jugador = [];
let manoSplit = []; // Segunda mano si se divide
let jugandoManoSplit = false; // Para saber en qué mano estamos jugando
let splitRealizado = false;

// Referencias DOM
let fichasElement = document.getElementById("fichas");
let resultElement = document.getElementById("result");
let playerCardsContainer = document.getElementById("playerCards");
let dealerCardsContainer = document.getElementById("dealerCards");
let puntosJugadorElement = document.getElementById("puntosJugador");
let puntosCasaElement = document.getElementById("puntosCasa");
let playerHandsContainer = document.getElementById("playerHandsContainer");

let btnDoblar = document.getElementById("btnDoblar");
let btnPedir = document.getElementById("btnPedir");
let btnPlantarse = document.getElementById("btnPlantarse");
let btnNueva = document.querySelector("button[onclick='nuevaRonda()']");
let btnDividir = document.getElementById("btnDividir");
let inputApuesta = document.getElementById("apuesta");

const palos = ['♥️', '♦️', '♣️', '♠️'];

// ============================================
// FUNCIONES DE BARAJA
// ============================================

function crearBaraja() {
    const valores = [
        { valor: 11, nombre: 'A' },
        { valor: 2, nombre: '2' }, { valor: 3, nombre: '3' },
        { valor: 4, nombre: '4' }, { valor: 5, nombre: '5' },
        { valor: 6, nombre: '6' }, { valor: 7, nombre: '7' },
        { valor: 8, nombre: '8' }, { valor: 9, nombre: '9' },
        { valor: 10, nombre: '10' }, { valor: 10, nombre: 'J' },
        { valor: 10, nombre: 'Q' }, { valor: 10, nombre: 'K' }
    ];
    
    baraja = [];
    
    // Crear 4 mazos de 52 cartas
    for (let mazo = 0; mazo < 4; mazo++) {
        for (let palo of palos) {
            for (let valorObj of valores) {
                baraja.push({
                    valor: valorObj.valor,
                    nombre: valorObj.nombre,
                    palo: palo
                });
            }
        }
    }
    
    // Mezclar la baraja usando algoritmo Fisher-Yates
    for (let i = baraja.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
}

function sacarCarta() {
    if (baraja.length === 0) {
        crearBaraja(); // Si se acaban las cartas, crear nueva baraja
    }
    return baraja.pop();
}

// ============================================
// CÁLCULO DE PUNTOS
// ============================================

function sumaMano(mano) {
    let suma = 0;
    let ases = 0;
    
    for (let carta of mano) {
        suma += carta.valor;
        if (carta.nombre === 'A') ases++;
    }
    
    // Ajustar ases de 11 a 1 si es necesario
    while (suma > 21 && ases > 0) {
        suma -= 10;
        ases--;
    }
    
    return suma;
}

function esManoSuave(mano) {
    // Una mano suave tiene un As que cuenta como 11
    let suma = 0;
    let tieneAs = false;
    
    for (let carta of mano) {
        suma += carta.valor;
        if (carta.nombre === 'A') tieneAs = true;
    }
    
    // Si tiene As y la suma es <= 21 con el As contando como 11, es suave
    return tieneAs && suma <= 21 && mano.some(c => c.nombre === 'A' && c.valor === 11);
}

// ============================================
// INICIO DE NUEVA RONDA
// ============================================

function nuevaRonda() {
    // Limpieza
    resultElement.textContent = "";
    resultElement.className = "";
    dealerCardsContainer.innerHTML = "";
    playerCardsContainer.innerHTML = "";
    puntosJugadorElement.textContent = "";
    puntosCasaElement.textContent = "";
    
    // Resetear variables de split
    splitRealizado = false;
    jugandoManoSplit = false;
    manoSplit = [];
    
    // Restaurar contenedor de manos del jugador a vista simple
    playerHandsContainer.innerHTML = `
        <div class="hand-area">
            <div class="hand-title">Tu Mano <span id="puntosJugador"></span></div>
            <div id="playerCards" class="cards-row"></div>
        </div>
    `;
    playerCardsContainer = document.getElementById("playerCards");
    puntosJugadorElement = document.getElementById("puntosJugador");
    
    // Validaciones
    if (fichas <= 0) {
        alert("Te has quedado sin fichas. Recarga la página para reiniciar.");
        return;
    }

    apuesta = parseInt(inputApuesta.value);
    
    // Validar límites de apuesta
    if (isNaN(apuesta) || apuesta < 1000) {
        alert("La apuesta mínima es de 1000 fichas.");
        inputApuesta.value = 1000;
        return;
    }
    if (apuesta > 50000) {
        alert("La apuesta máxima es de 50000 fichas.");
        inputApuesta.value = 50000;
        return;
    }
    if (apuesta > fichas) {
        alert("No tienes suficientes fichas para esa apuesta.");
        return;
    }

    // Crear y mezclar baraja si es necesario
    if (baraja.length < 20) {
        crearBaraja();
    }

    jugando = true;
    
    // Deshabilitar controles durante el reparto
    btnNueva.disabled = true;
    inputApuesta.disabled = true;
    btnPedir.disabled = true;
    btnPlantarse.disabled = true;
    btnDoblar.disabled = true;
    btnDividir.disabled = true;

    // Generar manos
    jugador = [sacarCarta(), sacarCarta()];
    casa = [sacarCarta(), sacarCarta()];

    // Animación de reparto
    repartirCartaVisual(jugador[0], playerCardsContainer, 0);
    
    setTimeout(() => {
        repartirCartaVisual(casa[0], dealerCardsContainer, 0);
        actualizarPuntos(false);
    }, 500);

    setTimeout(() => {
        repartirCartaVisual(jugador[1], playerCardsContainer, 0);
        actualizarPuntos(false);
    }, 1000);

    setTimeout(() => {
        const cartaOcultaDiv = crearCartaHTML(casa[1], true);
        dealerCardsContainer.appendChild(cartaOcultaDiv);
        
        setTimeout(verificarBlackjackInicial, 600);
    }, 1500);
}

// ============================================
// VERIFICAR BLACKJACK INICIAL
// ============================================

function verificarBlackjackInicial() {
    const bjJugador = sumaMano(jugador) === 21;
    const bjCasa = sumaMano(casa) === 21;

    actualizarPuntos(false);

    if (bjCasa) {
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
        // Blackjack paga 3 a 2
        const ganancia = Math.floor(apuesta * 1.5);
        fichas += ganancia;
        fichasElement.textContent = fichas;
        resultElement.textContent = `¡BLACKJACK! Ganaste ${ganancia} fichas (3 a 2).`;
        resultElement.className = "win";
        terminarControles();
        return;
    }

    // Habilitar controles
    btnPedir.disabled = false;
    btnPlantarse.disabled = false;
    
    // Doblar solo si hay saldo suficiente
    if (fichas >= apuesta) {
        btnDoblar.disabled = false;
    }
    
    // Dividir solo si las dos cartas tienen el mismo valor
    if (jugador[0].valor === jugador[1].valor && fichas >= apuesta) {
        btnDividir.disabled = false;
    }
}

// ============================================
// ACCIONES DEL JUGADOR
// ============================================

function pedirCarta() {
    if (!jugando) return;
    
    btnDoblar.disabled = true;
    btnDividir.disabled = true;

    const nuevaCarta = sacarCarta();
    const manoActual = jugandoManoSplit ? manoSplit : jugador;
    const contenedorActual = jugandoManoSplit ? 
        document.getElementById("playerCardsSplit") : playerCardsContainer;
    
    manoActual.push(nuevaCarta);
    repartirCartaVisual(nuevaCarta, contenedorActual, 0);
    
    actualizarPuntos(false);
    
    // Verificar Charlie de 7 cartas
    if (manoActual.length === 7 && sumaMano(manoActual) <= 21) {
        if (jugandoManoSplit && splitRealizado) {
            // Terminar esta mano y pasar a resolver
            resultElement.textContent = "¡Charlie de 7 cartas en mano dividida!";
            resultElement.className = "win";
            setTimeout(plantarse, 1500);
        } else {
            // Charlie de 7 cartas - gana automáticamente
            const ganancia = apuesta;
            fichas += ganancia;
            fichasElement.textContent = fichas;
            resultElement.textContent = `¡CHARLIE DE 7 CARTAS! Ganas automáticamente ${ganancia} fichas.`;
            resultElement.className = "win";
            terminarControles();
        }
        return;
    }

    if (sumaMano(manoActual) > 21) {
        if (jugandoManoSplit && splitRealizado) {
            // Si nos pasamos en la mano split, pasamos a la principal
            resultElement.textContent = "Mano dividida se pasó de 21.";
            setTimeout(() => {
                jugandoManoSplit = false;
                resultElement.textContent = "Juega tu mano principal.";
                actualizarPuntos(false);
            }, 1500);
        } else {
            finalizarJuego("Te pasaste de 21. La casa gana.", "lose");
        }
    }
}

function doblar() {
    if (!jugando) return;
    if (fichas < apuesta) {
        alert("No tienes suficientes fichas para doblar.");
        return;
    }
    
    // Doblar apuesta
    fichas -= apuesta;
    apuesta *= 2;
    fichasElement.textContent = fichas;
    inputApuesta.value = apuesta;

    const manoActual = jugandoManoSplit ? manoSplit : jugador;
    const contenedorActual = jugandoManoSplit ? 
        document.getElementById("playerCardsSplit") : playerCardsContainer;

    const nuevaCarta = sacarCarta();
    manoActual.push(nuevaCarta);
    repartirCartaVisual(nuevaCarta, contenedorActual, 0);
    actualizarPuntos(false);

    if (sumaMano(manoActual) > 21) {
        if (jugandoManoSplit && splitRealizado) {
            setTimeout(() => {
                jugandoManoSplit = false;
                resultElement.textContent = "Mano dividida se pasó al doblar.";
            }, 1000);
        } else {
            finalizarJuego("Te pasaste al doblar. La casa gana.", "lose");
        }
    } else {
        setTimeout(plantarse, 1000);
    }
}

function dividir() {
    if (!jugando || splitRealizado) return;
    if (fichas < apuesta) {
        alert("No tienes suficientes fichas para dividir.");
        return;
    }
    
    // Restar apuesta para la segunda mano
    fichas -= apuesta;
    fichasElement.textContent = fichas;
    
    splitRealizado = true;
    btnDividir.disabled = true;
    
    // Dividir las cartas
    manoSplit = [jugador.pop()]; // Segunda carta va a mano split
    jugador = [jugador[0]]; // Primera carta se queda en mano principal
    
    // Dar una carta nueva a cada mano
    jugador.push(sacarCarta());
    manoSplit.push(sacarCarta());
    
    // Crear vista de manos divididas
    playerHandsContainer.innerHTML = `
        <div class="split-container">
            <div class="split-hand hand-area" id="hand1">
                <div class="hand-title">Mano 1 <span id="puntosJugador"></span></div>
                <div id="playerCards" class="cards-row"></div>
            </div>
            <div class="split-hand hand-area" id="hand2">
                <div class="hand-title">Mano 2 (Split) <span id="puntosJugadorSplit"></span></div>
                <div id="playerCardsSplit" class="cards-row"></div>
            </div>
        </div>
    `;
    
    // Actualizar referencias
    playerCardsContainer = document.getElementById("playerCards");
    puntosJugadorElement = document.getElementById("puntosJugador");
    const playerCardsSplitContainer = document.getElementById("playerCardsSplit");
    const puntosJugadorSplitElement = document.getElementById("puntosJugadorSplit");
    
    // Mostrar cartas de la mano 1
    jugador.forEach(carta => repartirCartaVisual(carta, playerCardsContainer, 0));
    
    // Mostrar cartas de la mano 2
    manoSplit.forEach(carta => repartirCartaVisual(carta, playerCardsSplitContainer, 0));
    
    // Actualizar puntos
    puntosJugadorElement.textContent = `(Total: ${sumaMano(jugador)})`;
    puntosJugadorSplitElement.textContent = `(Total: ${sumaMano(manoSplit)})`;
    
    resultElement.textContent = "Manos divididas. Juega primero la Mano 1.";
    resultElement.className = "";
    
    // Resaltar mano activa
    document.getElementById("hand1").style.border = "2px solid yellow";
}

function plantarse() {
    if (!jugando) return;
    
    // Si estamos jugando con split y es la primera mano
    if (splitRealizado && !jugandoManoSplit) {
        jugandoManoSplit = true;
        document.getElementById("hand1").style.border = "1px solid rgba(255,255,255,0.05)";
        document.getElementById("hand2").style.border = "2px solid yellow";
        resultElement.textContent = "Ahora juega la Mano 2 (Split).";
        btnDoblar.disabled = false; // Permitir doblar en la segunda mano
        return;
    }
    
    // Turno de la casa
    voltearCartaCasa();
    actualizarPuntos(true);
    
    setTimeout(jugarCasa, 800);
}

// ============================================
// JUEGO DE LA CASA
// ============================================

function jugarCasa() {
    const totalCasa = sumaMano(casa);
    const esSuave = esManoSuave(casa);
    
    // El crupier roba hasta alcanzar al menos 17 suave (17 con As que cuenta como 11)
    if (totalCasa < 17 || (totalCasa === 17 && esSuave)) {
        setTimeout(() => {
            const nuevaCarta = sacarCarta();
            casa.push(nuevaCarta);
            repartirCartaVisual(nuevaCarta, dealerCardsContainer, 0);
            actualizarPuntos(true);
            jugarCasa();
        }, 800);
    } else {
        determinarGanador();
    }
}

// ============================================
// DETERMINAR GANADOR
// ============================================

function determinarGanador() {
    const totalCasa = sumaMano(casa);
    
    if (!splitRealizado) {
        // Juego normal sin split
        const totalJugador = sumaMano(jugador);
        
        if (totalCasa > 21) {
            finalizarJuego("La casa se pasó. ¡Ganaste!", "win");
        } else if (totalJugador > 21) {
            finalizarJuego("Te pasaste. La casa gana.", "lose");
        } else if (totalJugador > totalCasa) {
            finalizarJuego("¡Tienes mejor mano! Ganaste.", "win");
        } else if (totalJugador === totalCasa) {
            finalizarJuego("Empate. Recuperas tu apuesta.", "draw");
        } else {
            finalizarJuego("La casa tiene mejor mano. Perdiste.", "lose");
        }
    } else {
        // Juego con split - evaluar ambas manos
        const totalMano1 = sumaMano(jugador);
        const totalMano2 = sumaMano(manoSplit);
        
        let resultadoMano1 = "";
        let resultadoMano2 = "";
        let gananciaTotal = 0;
        
        // Evaluar Mano 1
        if (totalMano1 > 21) {
            resultadoMano1 = "Mano 1: Perdida (pasada)";
            gananciaTotal -= apuesta;
        } else if (totalCasa > 21 || totalMano1 > totalCasa) {
            resultadoMano1 = "Mano 1: ¡Ganada!";
            gananciaTotal += apuesta;
        } else if (totalMano1 === totalCasa) {
            resultadoMano1 = "Mano 1: Empate";
        } else {
            resultadoMano1 = "Mano 1: Perdida";
            gananciaTotal -= apuesta;
        }
        
        // Evaluar Mano 2
        if (totalMano2 > 21) {
            resultadoMano2 = "Mano 2: Perdida (pasada)";
            gananciaTotal -= apuesta;
        } else if (totalCasa > 21 || totalMano2 > totalCasa) {
            resultadoMano2 = "Mano 2: ¡Ganada!";
            gananciaTotal += apuesta;
        } else if (totalMano2 === totalCasa) {
            resultadoMano2 = "Mano 2: Empate";
        } else {
            resultadoMano2 = "Mano 2: Perdida";
            gananciaTotal -= apuesta;
        }
        
        fichas += gananciaTotal;
        fichasElement.textContent = fichas;
        
        let mensaje = `${resultadoMano1} | ${resultadoMano2}`;
        if (gananciaTotal > 0) {
            mensaje += ` | Ganaste ${gananciaTotal} fichas`;
            resultElement.className = "win";
        } else if (gananciaTotal < 0) {
            mensaje += ` | Perdiste ${Math.abs(gananciaTotal)} fichas`;
            resultElement.className = "lose";
        } else {
            mensaje += ` | Empate total`;
            resultElement.className = "draw";
        }
        
        resultElement.textContent = mensaje;
        terminarControles();
    }
}

// ============================================
// FINALIZAR JUEGO
// ============================================

function finalizarJuego(mensaje, tipo) {
    if (tipo === "win") {
        fichas += apuesta;
    } else if (tipo === "lose") {
        fichas -= apuesta;
    }
    // draw no modifica fichas

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
    btnDividir.disabled = true;
    btnNueva.disabled = false;
    inputApuesta.disabled = false;
}

// ============================================
// FUNCIONES VISUALES
// ============================================

function repartirCartaVisual(carta, contenedor, delay) {
    const div = crearCartaHTML(carta);
    if (delay > 0) div.style.animationDelay = `${delay}s`;
    contenedor.appendChild(div);
}

function crearCartaHTML(carta, oculta = false) {
    const div = document.createElement('div');
    div.classList.add('card');
    
    if (oculta) {
        div.id = "cartaOculta";
        div.style.background = `repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)`;
        div.style.borderColor = "#fff";
        return div;
    }

    if (carta.palo === '♥️' || carta.palo === '♦️') {
        div.classList.add('red');
    } else {
        div.classList.add('black');
    }

    div.innerHTML = `
        <span class="card-corner top-left">${carta.nombre}<br>${carta.palo}</span>
        <span class="card-suit-center">${carta.palo}</span>
        <span class="card-corner bottom-right">${carta.nombre}<br>${carta.palo}</span>
    `;
    return div;
}

function actualizarPuntos(mostrarCasaCompleta) {
    if (!splitRealizado) {
        puntosJugadorElement.textContent = `(Total: ${sumaMano(jugador)})`;
    } else {
        const puntosJugadorSplitElement = document.getElementById("puntosJugadorSplit");
        if (puntosJugadorElement) {
            puntosJugadorElement.textContent = `(Total: ${sumaMano(jugador)})`;
        }
        if (puntosJugadorSplitElement) {
            puntosJugadorSplitElement.textContent = `(Total: ${sumaMano(manoSplit)})`;
        }
    }
    
    if (mostrarCasaCompleta) {
        puntosCasaElement.textContent = `(Total: ${sumaMano(casa)})`;
    } else {
        if (casa.length > 0) {
            let valorVisible = casa[0].valor;
            puntosCasaElement.textContent = `(Visible: ${valorVisible})`;
        }
    }
}

function voltearCartaCasa() {
    const cartaOcultaDiv = document.getElementById("cartaOculta");
    if (cartaOcultaDiv) {
        const nuevaCarta = crearCartaHTML(casa[1]);
        cartaOcultaDiv.replaceWith(nuevaCarta);
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Crear baraja al cargar la página
crearBaraja();