let wins = 0;
let losses = 0;
let ties = 0;

function playGame(playerChoice) {
    const choices = ['Piedra', 'Papel', 'Tijera'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const messageElement = document.getElementById('message');
    let result;

    // Determinar el resultado del juego
    if (playerChoice === computerChoice) {
        result = "Empate";
        ties++;
    } else if (
        (playerChoice === 'Piedra' && computerChoice === 'Tijera') ||
        (playerChoice === 'Tijera' && computerChoice === 'Papel') ||
        (playerChoice === 'Papel' && computerChoice === 'Piedra')
    ) {
        result = "¡Ganaste!";
        wins++;
    } else {
        result = "Perdiste";
        losses++;
    }

    // Mostrar el resultado y actualizar el contador
    messageElement.textContent = `Tú elegiste: ${playerChoice} | Computadora eligió: ${computerChoice} | Resultado: ${result}`;
    messageElement.style.color = result === "¡Ganaste!" ? 'green' : result === "Empate" ? 'orangered' : 'red';

    // Actualizar los contadores en la interfaz
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('ties').textContent = ties;
}

function resetGame() {
    wins = 0;
    losses = 0;
    ties = 0;
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('ties').textContent = ties;
    document.getElementById('message').textContent = "Juego reiniciado. ¡Elige tu jugada!";
    document.getElementById('message').style.color = 'white';
}
