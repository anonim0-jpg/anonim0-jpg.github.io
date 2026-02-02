/* DIAMOND CASINO ROULETTE (GTA V STYLE)
   Lógica completa v3.0
*/

let wallet = 1000;
let currentBet = 0;
const chips = [10, 50, 100, 500, 1000, 5000];
// Colores de fichas: Cian, Violeta, Negro, Verde lima, Oro, Rojo
const chipColors = ['#00e5ff', '#d500f9', '#111', '#76ff03', '#ffd700', '#f44336'];
let chipIdx = 2; // Empezamos con la ficha de 100
let bets = {};

// Orden REAL de la Ruleta Americana (0, 28, 9, ... 2)
const wheelNums = [
  "0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1",
  "00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"
];

// Números que son rojos en el tablero
const redNums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

// Variables de estado para rotación (crucial para no resetear la animación bruscamente)
let currentWheelRot = 0;
let currentBallRot = 0;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    renderWheel();
    renderBoard();
    updateHUD();
}

// 1. DIBUJAR RUEDA
function renderWheel() {
    const wheel = document.getElementById('wheel');
    const angle = 360 / 38;
    
    wheelNums.forEach((num, i) => {
        const slot = document.createElement('div');
        slot.className = 'wheel-slot';
        // Giramos cada número para formar el círculo
        slot.style.transform = `rotate(${i * angle}deg)`;
        
        // Colores de la rueda
        if (num === '0' || num === '00') slot.style.backgroundColor = '#2e7d32'; // Verde
        else if (redNums.includes(parseInt(num))) slot.style.backgroundColor = '#b71c1c'; // Rojo
        else slot.style.backgroundColor = '#111'; // Negro
        
        slot.innerText = num;
        wheel.appendChild(slot);
    });
}

// 2. DIBUJAR TABLERO (Números 1-36)
function renderBoard() {
    const grid = document.getElementById('numbers-grid');
    grid.innerHTML = ''; // Limpiamos por seguridad
    
    for(let i=1; i<=36; i++) {
        const d = document.createElement('div');
        const isRed = redNums.includes(i);
        d.className = `cell ${isRed ? 'red' : 'black'}`;
        d.innerText = i;
        // Asignamos el evento de click
        d.onclick = () => placeBet(i.toString());
        grid.appendChild(d);
    }
}

// 3. SISTEMA DE GESTIÓN DE APUESTAS
function changeChip(dir) {
    chipIdx += dir;
    // Límites del array de fichas
    if(chipIdx < 0) chipIdx = 0;
    if(chipIdx >= chips.length) chipIdx = chips.length - 1;
    updateHUD();
}

function updateHUD() {
    // Actualizar textos de saldo y apuesta
    document.getElementById('wallet-display').innerText = `$${wallet.toLocaleString()}`;
    document.getElementById('current-bet-display').innerText = `$${currentBet.toLocaleString()}`;
    
    // Actualizar visualización de la ficha seleccionada
    const prev = document.getElementById('chip-preview');
    const val = document.getElementById('chip-val');
    
    prev.style.backgroundColor = chipColors[chipIdx];
    val.innerText = chips[chipIdx];
    
    // Texto blanco si la ficha es oscura para que se lea
    if(['#111', '#4a148c', '#b71c1c', '#00e5ff'].includes(chipColors[chipIdx])) {
        val.style.color = (chipColors[chipIdx] === '#00e5ff') ? 'black' : 'white';
    } else {
        val.style.color = 'black';
    }
}

function placeBet(id) {
    const amount = chips[chipIdx];
    
    if(wallet < amount) {
        alert("NO TIENES SUFICIENTE SALDO"); // Alerta simple estilo GTA
        return;
    } 
    
    // Transacción
    wallet -= amount;
    currentBet += amount;
    
    // Registro lógico
    if(!bets[id]) bets[id] = 0;
    bets[id] += amount;
    
    // Registro visual
    drawChipOnBoard(id, bets[id]);
    updateHUD();
}

function drawChipOnBoard(betId, amount) {
    // Buscar la celda correcta en el DOM
    const cells = document.querySelectorAll('.cell');
    let target = null;
    cells.forEach(c => {
        // Buscamos en el atributo onclick el ID de la apuesta
        if(c.getAttribute('onclick').includes(`'${betId}'`)) target = c;
    });

    if(target) {
        let chip = target.querySelector('.chip-placed');
        // Si no hay ficha visual, la creamos
        if(!chip) {
            chip = document.createElement('div');
            chip.className = 'chip-placed';
            target.appendChild(chip);
        }
        
        // Actualizamos estilo según la ficha seleccionada actualmente
        chip.style.backgroundColor = chipColors[chipIdx];
        
        // Ajuste de contraste para el texto
        if(['#111', '#b71c1c'].includes(chipColors[chipIdx])) {
            chip.classList.add('chip-dark');
        } else {
            chip.classList.remove('chip-dark');
        }
        
        // Formato k para miles (ej: 1k)
        chip.innerText = amount >= 1000 ? (amount/1000) + 'k' : amount;
    }
}

function clearBets() {
    // Devolvemos el dinero al "bolsillo" antes de girar
    wallet += currentBet;
    currentBet = 0;
    bets = {};
    
    // Borramos todas las fichas visuales
    document.querySelectorAll('.chip-placed').forEach(e => e.remove());
    updateHUD();
}

// 4. LÓGICA DE GIRO Y ANIMACIÓN
function spin() {
    if(currentBet === 0) return alert("¡HAZ UNA APUESTA PRIMERO!");
    
    document.getElementById('spin-btn').disabled = true;

    // A. Elegir ganador aleatorio
    const winIdx = Math.floor(Math.random() * wheelNums.length);
    const winNum = wheelNums[winIdx];

    // B. Calcular Ángulos Matemáticos
    const slotArc = 360 / 38;
    
    // Queremos que el número ganador quede en 0 grados (arriba, donde está la flecha).
    // Si el número está en la posición 'winIdx', su ángulo actual es winIdx * slotArc.
    // Para llevarlo a 0, debemos restar ese ángulo.
    const targetWheelAngle = -(winIdx * slotArc);
    
    // Sumamos vueltas completas para la animación (mínimo 5 vueltas)
    const spins = 5;
    const extraDegrees = 360 * spins;
    
    // Calculamos la nueva rotación acumulativa para evitar saltos
    const newWheelRot = currentWheelRot - (currentWheelRot % 360) - extraDegrees + targetWheelAngle;
    
    // La bola gira en sentido contrario visualmente
    const newBallRot = currentBallRot + (360 * (spins + 2)); 

    // C. Ejecutar Animación CSS
    const wheel = document.getElementById('wheel');
    const ballCont = document.getElementById('ball-container');
    
    wheel.style.transform = `rotate(${newWheelRot}deg)`;
    ballCont.style.transform = `rotate(${newBallRot}deg)`;

    // Guardar estados para la próxima tirada
    currentWheelRot = newWheelRot;
    currentBallRot = newBallRot;

    // Esperar a que termine la animación (5s)
    setTimeout(() => {
        showResult(winNum);
        document.getElementById('spin-btn').disabled = false;
    }, 5100); 
}

function showResult(numStr) {
    const num = (numStr === '00') ? -1 : parseInt(numStr);
    let color = "Verde";
    if(num > 0) color = redNums.includes(num) ? "ROJO" : "NEGRO";
    
    let totalWin = 0;
    
    // Calcular ganancias
    for(let id in bets) {
        if(checkWin(id, num, color)) {
            totalWin += getPayout(id, bets[id]);
        }
    }
    
    // Mostrar Modal de Resultado (Estilo GTA)
    const modal = document.getElementById('overlay');
    const title = document.getElementById('res-title');
    const bigNum = document.getElementById('res-number');
    const txt = document.getElementById('res-text');
    
    bigNum.innerText = numStr;
    // Color del número en el modal
    if (color === 'ROJO') bigNum.style.color = '#ff1744';
    else if (color === 'NEGRO') bigNum.style.color = 'white';
    else bigNum.style.color = '#00e676'; // Verde

    txt.innerText = `${color}`;
    
    if(totalWin > 0) {
        title.innerText = `¡GANASTE $${totalWin}!`;
        title.style.color = '#00e5ff'; // Azul neón
        wallet += totalWin;
        currentBet = 0; 
        updateHUD();
    } else {
        title.innerText = "LA CASA GANA";
        title.style.color = 'white';
        currentBet = 0;
        updateHUD();
    }
    
    modal.classList.remove('hidden');
}

function closeOverlay() {
    document.getElementById('overlay').classList.add('hidden');
    // Limpiamos la mesa visual y lógica para la siguiente ronda
    bets = {};
    document.querySelectorAll('.chip-placed').forEach(e => e.remove());
}

// 5. REGLAS DE LA RULETA (Pagos y condiciones)
function checkWin(id, num, colorStr) {
    // Plenos
    if(id === num.toString()) return true;
    if(id === '00' && num === -1) return true;
    
    // Si sale 0 o 00, todas las apuestas externas pierden
    if(num === 0 || num === -1) return false; 
    
    const isRed = (colorStr === 'ROJO');
    const isEven = (num % 2 === 0);
    
    // Apuestas externas
    if(id === 'red' && isRed) return true;
    if(id === 'black' && !isRed) return true;
    if(id === 'even' && isEven) return true;
    if(id === 'odd' && !isEven) return true;
    if(id === '1-18' && num <= 18) return true;
    if(id === '19-36' && num >= 19) return true;
    
    // Docenas
    if(id === '1st12' && num <= 12) return true;
    if(id === '2nd12' && num > 12 && num <= 24) return true;
    if(id === '3rd12' && num > 24) return true;
    
    // Columnas (2 to 1)
    if(id === 'row1' && num % 3 === 1) return true; // Columna del 1, 4...
    if(id === 'row2' && num % 3 === 2) return true; // Columna del 2, 5...
    if(id === 'row3' && num % 3 === 0) return true; // Columna del 3, 6...
    
    return false;
}

function getPayout(id, bet) {
    // Pagos 1 a 1
    if(['red','black','even','odd','1-18','19-36'].includes(id)) return bet * 2;
    // Pagos 2 a 1 (Docenas y Columnas)
    if(['1st12','2nd12','3rd12','row1','row2','row3'].includes(id)) return bet * 3;
    // Pagos 35 a 1 (Pleno)
    return bet * 36;
}