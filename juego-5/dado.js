let fichas = 500; // Saldo inicial de fichas

function rollDice() {
    const apuesta = parseInt(document.getElementById("apuesta").value); // Obtener la apuesta del jugador
    const resultElement = document.getElementById("result");
    const fichasElement = document.getElementById("fichas");

    // Verificamos si la apuesta es válida
    if (isNaN(apuesta) || apuesta <= 0 || apuesta > fichas) {
        resultElement.textContent = "Introduce una apuesta válida.";
        resultElement.style.color = "red";
        return;
    }

    // Tiradas de los dados
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const computerRoll = Math.floor(Math.random() * 6) + 1;
    let resultText = `Tú lanzaste un ${playerRoll} y la computadora lanzó un ${computerRoll}.`;

    // Lógica para determinar el resultado
    if (playerRoll > computerRoll) {
        resultText += " ¡Ganaste!";
        resultElement.style.color = "green";
        fichas += apuesta; // Ganas lo que apostaste
    } else if (playerRoll < computerRoll) {
        resultText += " Perdiste.";
        resultElement.style.color = "red";
        fichas -= apuesta; // Pierdes lo que apostaste
    } else {
        resultText += " ¡Empate!";
        resultElement.style.color = "orangered";
        // En caso de empate, no se suma ni se resta
    }

    // Actualizar los elementos de la interfaz
    resultElement.textContent = resultText;
    fichasElement.textContent = fichas;

    // Verificar si el jugador se ha quedado sin fichas
    if (fichas <= 0) {
        resultElement.textContent = "Te has quedado sin fichas. ¡Juego terminado!";
        resultElement.style.color = "red";
        document.querySelector("button").disabled = true; // Deshabilitar el botón de jugar
    }
}