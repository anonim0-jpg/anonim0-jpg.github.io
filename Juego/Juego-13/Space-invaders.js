const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const scoreElement = document.getElementById("score");
        const levelElement = document.getElementById("level-display");
        const reiniciarButton = document.getElementById("reiniciar");

        // --- CONFIGURACIÓN ---
        const playerWidth = 40;
        const playerHeight = 20;
        const invaderWidth = 30;
        const invaderHeight = 20;
        const invaderPadding = 20;
        const invaderOffsetTop = 40;
        const invaderOffsetLeft = 35;
        
        // Variables de Juego
        let playerX = (canvas.width - playerWidth) / 2;
        let bullets = [];
        let invaders = [];
        let score = 0;
        let level = 1;
        let gameRunning = false;
        let animationId;
        
        // Variables de Dificultad
        let baseInvaderSpeed = 1.5; // Velocidad inicial
        let currentInvaderSpeed = baseInvaderSpeed;
        let invaderDirection = 1; // 1 derecha, -1 izquierda
        let invaderDropDistance = 20;

        // Inputs
        let rightPressed = false;
        let leftPressed = false;

        // --- SISTEMA DE NIVELES ---

        function initLevel(newLevel) {
            level = newLevel;
            levelElement.innerText = "LVL: " + level;
            
            // Aumentar dificultad: velocidad base + un poco por cada nivel
            currentInvaderSpeed = baseInvaderSpeed + (level * 0.5);
            invaderDirection = 1; // Siempre empiezan moviéndose a la derecha
            
            bullets = []; // Limpiar balas viejas
            createInvaders();
        }

        function createInvaders() {
            invaders = [];
            let rows = 4;
            let cols = 10;

            // En niveles altos, añadimos más filas (máximo 6)
            if (level > 2) rows = 5;
            if (level > 4) rows = 6;

            for (let c = 0; c < cols; c++) {
                invaders[c] = [];
                for (let r = 0; r < rows; r++) {
                    let invX = (c * (invaderWidth + invaderPadding)) + invaderOffsetLeft;
                    let invY = (r * (invaderHeight + invaderPadding)) + invaderOffsetTop;
                    let colorHue = (c * 20) + (r * 15); // Color dinámico
                    invaders[c][r] = { x: invX, y: invY, alive: true, hue: colorHue };
                }
            }
        }

        // --- BUCLE PRINCIPAL (UPDATE) ---

        function update() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Mover Jugador
            if (rightPressed && playerX < canvas.width - playerWidth) playerX += 7;
            if (leftPressed && playerX > 0) playerX -= 7;

            // 2. Mover Balas
            for (let i = 0; i < bullets.length; i++) {
                bullets[i].y -= 8;
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                    i--;
                }
            }

            // 3. Mover Invasores
            let edgeTouched = false;
            let activeInvaders = 0;

            // Verificar bordes y conteo de vivos
            invaders.forEach(col => {
                col.forEach(inv => {
                    if (inv.alive) {
                        activeInvaders++;
                        if ((inv.x + invaderWidth > canvas.width && invaderDirection > 0) || 
                            (inv.x < 0 && invaderDirection < 0)) {
                            edgeTouched = true;
                        }
                    }
                });
            });

            if (edgeTouched) {
                invaderDirection = -invaderDirection;
                invaders.forEach(col => {
                    col.forEach(inv => inv.y += invaderDropDistance);
                });
            }

            // Aplicar movimiento horizontal
            invaders.forEach(col => {
                col.forEach(inv => {
                    if (inv.alive) {
                        inv.x += currentInvaderSpeed * invaderDirection;
                        
                        // Game Over si tocan el suelo
                        if (inv.y + invaderHeight > canvas.height - playerHeight) {
                            gameOver();
                        }
                    }
                });
            });

            // 4. Victoria de Nivel
            if (activeInvaders === 0) {
                // Pequeña pausa visual antes del siguiente nivel
                gameRunning = false;
                ctx.fillStyle = "white";
                ctx.font = "30px Courier New";
                ctx.fillText("LEVEL " + level + " CLEARED", canvas.width/2 - 130, canvas.height/2);
                setTimeout(() => {
                    gameRunning = true;
                    initLevel(level + 1);
                    update();
                }, 1500);
                return; // Salimos del update actual para esperar el timeout
            }

            // 5. Colisiones
            invaders.forEach(col => {
                col.forEach(inv => {
                    if (inv.alive) {
                        for (let b = 0; b < bullets.length; b++) {
                            if (bullets[b].x > inv.x && bullets[b].x < inv.x + invaderWidth &&
                                bullets[b].y > inv.y && bullets[b].y < inv.y + invaderHeight) {
                                
                                inv.alive = false;
                                bullets.splice(b, 1);
                                score += 10 + (level * 2); // Puntos escalan con nivel
                                scoreElement.innerText = "SCORE: " + score;
                                break; 
                            }
                        }
                    }
                });
            });

            // 6. Dibujar Todo
            drawEntities();

            animationId = requestAnimationFrame(update);
        }

        // --- DIBUJADO (RENDERING) ---

        function drawEntities() {
            // Jugador
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00ff00";
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(playerX, canvas.height - playerHeight - 10, playerWidth, playerHeight);
            ctx.fillRect(playerX + 15, canvas.height - playerHeight - 20, 10, 10);
            
            // Invasores
            invaders.forEach(col => {
                col.forEach(inv => {
                    if (inv.alive) {
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = `hsl(${inv.hue}, 100%, 50%)`;
                        ctx.fillStyle = `hsl(${inv.hue}, 100%, 70%)`;
                        ctx.fillRect(inv.x, inv.y, invaderWidth, invaderHeight);
                        // Ojos
                        ctx.fillStyle = "black";
                        ctx.fillRect(inv.x + 5, inv.y + 5, 5, 5);
                        ctx.fillRect(inv.x + 20, inv.y + 5, 5, 5);
                    }
                });
            });

            // Balas
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffff00";
            ctx.fillStyle = "#ffff00";
            bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 12));
            
            ctx.shadowBlur = 0; // Reset
        }

        // --- CONTROL Y EVENTOS ---

        function startGame() {
            if (gameRunning) return;
            score = 0;
            scoreElement.innerText = "SCORE: 0";
            playerX = (canvas.width - playerWidth) / 2;
            
            gameRunning = true;
            reiniciarButton.innerText = "ABORTAR";
            reiniciarButton.blur(); // IMPORTANTE: Quitar foco del botón para que Espacio no lo active
            canvas.focus(); // Dar foco al juego
            
            initLevel(1);
            update();
        }

        function gameOver() {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(0,0,canvas.width, canvas.height);
            
            ctx.fillStyle = "red";
            ctx.font = "bold 40px Courier New";
            ctx.fillText("GAME OVER", canvas.width/2 - 110, canvas.height/2);
            
            reiniciarButton.innerText = "REINICIAR";
        }

        function fireBullet() {
            if (gameRunning) {
                bullets.push({ x: playerX + playerWidth / 2 - 2, y: canvas.height - playerHeight - 10 });
            }
        }

        // --- EVENT LISTENERS OPTIMIZADOS ---

        // Teclado (Desktop)
        document.addEventListener("keydown", (e) => {
            // Prevenir scroll con flechas y espacio
            if(["ArrowLeft", "ArrowRight", " "].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
            else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
            else if (e.key === " ") fireBullet();
        });

        document.addEventListener("keyup", (e) => {
            if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
            else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
        });

        // Táctil (Móvil)
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnFire = document.getElementById('btn-fire');

        // Funciones auxiliares para touch para evitar doble disparo/movimiento
        const addTouch = (elem, startAction, endAction) => {
            elem.addEventListener('touchstart', (e) => { e.preventDefault(); startAction(); });
            elem.addEventListener('touchend', (e) => { e.preventDefault(); endAction(); });
            elem.addEventListener('mousedown', (e) => { e.preventDefault(); startAction(); }); // Soporte ratón en PC
            elem.addEventListener('mouseup', (e) => { e.preventDefault(); endAction(); });
        };

        addTouch(btnLeft, () => leftPressed = true, () => leftPressed = false);
        addTouch(btnRight, () => rightPressed = true, () => rightPressed = false);
        addTouch(btnFire, () => fireBullet(), () => {}); // Disparo único al tocar

        // Botón Inicio
        reiniciarButton.addEventListener("click", () => {
            if (gameRunning) {
                gameRunning = false;
                reiniciarButton.innerText = "REINICIAR";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText("PAUSADO", canvas.width/2 - 50, canvas.height/2);
            } else {
                startGame();
            }
        });

        // Pantalla Inicial
        ctx.font = "20px Courier New";
        ctx.fillStyle = "cyan";
        ctx.fillText("PRESIONA INICIAR", canvas.width/2 - 90, canvas.height/2);
