let randomNumber = Math.floor(Math.random() * 200) + 1;
let attempts = 0;
const maxAttempts = 15;

function checkGuess() {
    const userGuess = Number(document.getElementById('guess').value);
    attempts++;
    const messageElement = document.getElementById('message');

    if (attempts > maxAttempts) {
        messageElement.textContent = `Has superado el número máximo de intentos (${maxAttempts}). El número era ${randomNumber}.`;
        messageElement.style.color = 'red';
        // Deshabilitar el botón después de exceder los intentos
        document.querySelector('button').disabled = true;
        return;
    }

    if (userGuess === randomNumber) {
        messageElement.textContent = `¡Correcto! El número era ${randomNumber}. Lo adivinaste en ${attempts} intentos.`;
        messageElement.style.color = 'green';
        // Deshabilitar el botón al acertar
        document.querySelector('button').disabled = true;
    } else if (userGuess < randomNumber) {
        messageElement.textContent = 'Demasiado bajo. Intenta de nuevo.';
        messageElement.style.color = 'orangered';
    } else {
        messageElement.textContent = 'Demasiado alto. Intenta de nuevo.';
        messageElement.style.color = 'orangered';
    }
}