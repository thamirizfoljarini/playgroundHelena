// script.js

// --- Referências de Elementos ---
const initialScreen = document.getElementById('initialScreen');
const homeTitle = document.getElementById('homeTitle');
const gamesButton = document.getElementById('gamesButton');
const slateButton = document.getElementById('slateButton');
const gamesSection = document.getElementById('gamesSection');
const slateSection = document.getElementById('slateSection');
const sectionTitle = document.getElementById('sectionTitle');
const gameSelectionScreen = document.getElementById('gameSelectionScreen');
const backToHomeButton = document.getElementById('backToHomeButton');
let activeGame = null;

// Botões de Voltar Específicos (adicionados no HTML refatorado)
const backToGameSelectionMemory = document.getElementById('backToGameSelectionMemory');
const backToGameSelectionSnake = document.getElementById('backToGameSelectionSnake');
const backToGameSelectionTicTacToe = document.getElementById('backToGameSelectionTicTacToe');
const backToHomeSlate = document.getElementById('backToHomeSlate');


// --- Lousa Mágica ---
const canvasLousa = document.getElementById('drawingCanvas');
const ctxLousa = canvasLousa.getContext('2d');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
let isDrawing = false, lastX = 0, lastY = 0;

// --- Jogo da Memória ---
const memoryContainer = document.getElementById('memoryContainer');
const memoryGrid = document.getElementById('memoryGrid');
const startGameButton = document.getElementById('startGameButton');
const resetGameButton = document.getElementById('resetGameButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const instructionDisplay = document.getElementById('instructionDisplay');
const cardEmojis = ['🌟', '💖', '🌈', '🚀', '🎈', '🧸', '🍦', '👑'];
let cards = [], flippedCards = [], matchesFound = 0, isProcessing = false;

// --- Jogo da Cobrinha ---
const snakeContainer = document.getElementById('snakeContainer');
const snakeCanvas = document.getElementById('snakeCanvas');
const ctxSnake = snakeCanvas.getContext('2d');
const snakeStartButton = document.getElementById('snakeStartButton');
const snakeStatus = document.getElementById('snakeStatus');
const snakeScore = document.getElementById('snakeScore');
const TILE_SIZE = 20, GRID_SIZE = 20;
let snake = [], food = {}, dx = TILE_SIZE, dy = 0, gameLoopId, snakeCurrentScore = 0, gameIsRunning = false, gameSpeed = 250;

// --- Jogo da Velha ---
const tictactoeContainer = document.getElementById('tictactoeContainer');
const tictactoeGrid = document.getElementById('tictactoeGrid');
const tttStatus = document.getElementById('tttStatus');
const tttResetButton = document.getElementById('tttResetButton');
let board = [], currentPlayer = 'X', gameActive = true;
const winningConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// --- Controle de Telas ---
function stopAllGames() {
    if (activeGame === 'snake' && gameIsRunning) endGame();
    activeGame = null;
}

function showInitialScreen() {
    stopAllGames();
    slateSection.classList.add('hidden');
    gamesSection.classList.add('hidden');
    initialScreen.classList.remove('hidden');
}

function showGameSelection() {
    stopAllGames();
    initialScreen.classList.add('hidden');
    slateSection.classList.add('hidden');
    gamesSection.classList.remove('hidden', 'flex');
    gamesSection.classList.add('flex');
    [memoryContainer, snakeContainer, tictactoeContainer].forEach(c => c.classList.add('hidden'));
    gameSelectionScreen.classList.remove('hidden');
    backToHomeButton.classList.remove('hidden');
    sectionTitle.textContent = '🕹️ Arcade Infantil!';
}

function showSpecificGame(gameName) {
    activeGame = gameName;
    gameSelectionScreen.classList.add('hidden');
    backToHomeButton.classList.add('hidden');
    [memoryContainer, snakeContainer, tictactoeContainer].forEach(c => c.classList.add('hidden'));

    const containers = {
        memory: { el: memoryContainer, title: '🧠 Jogo da Memória! 🧠', init: resetGame },
        snake: { el: snakeContainer, title: '🐍 Cobrinha Clássica! 🍎', init: initSnakeGame },
        tictactoe: { el: tictactoeContainer, title: '❌ Jogo da Velha! ⭕', init: initTicTacToeGame }
    };

    const game = containers[gameName];
    if (game) {
        game.el.classList.remove('hidden');
        sectionTitle.textContent = game.title;
        game.init();
    }
}

function showSlate() {
    stopAllGames();
    initialScreen.classList.add('hidden');
    gamesSection.classList.add('hidden');
    slateSection.classList.remove('hidden', 'flex');
    slateSection.classList.add('flex');
    resizeCanvas();
}


// --- Lógica da Lousa Mágica ---
function setupLousa() {
    if (!ctxLousa) return;
    ctxLousa.lineJoin = 'round';
    ctxLousa.lineCap = 'round';

    canvasLousa.addEventListener('mousedown', startDrawing);
    canvasLousa.addEventListener('mousemove', draw);
    canvasLousa.addEventListener('mouseup', stopDrawing);
    canvasLousa.addEventListener('mouseout', stopDrawing);

    // MELHORIA: Prevenção de comportamento padrão do navegador no toque
    canvasLousa.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
    canvasLousa.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvasLousa.addEventListener('touchend', stopDrawing);
    window.addEventListener('resize', resizeCanvas);
}
function resizeCanvas() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvasLousa.width;
    tempCanvas.height = canvasLousa.height;
    tempCtx.drawImage(canvasLousa, 0, 0);

    // Ajusta o tamanho da canvas
    canvasLousa.width = slateSection.clientWidth;
    canvasLousa.height = Math.min(canvasLousa.width * 0.7 , window.innerHeight * 0.5);

    // Redesenha o conteúdo anterior
    ctxLousa.drawImage(tempCanvas, 0, 0);
    ctxLousa.lineJoin = 'round';
    ctxLousa.lineCap = 'round';
    ctxLousa.strokeStyle = colorPicker.value;
    ctxLousa.lineWidth = sizeSlider.value;
}
function getCoords(e) {
    const rect = canvasLousa.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}
function startDrawing(e) { isDrawing = true; [lastX, lastY] = [getCoords(e).x, getCoords(e).y]; }
function draw(e) {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    ctxLousa.beginPath();
    ctxLousa.moveTo(lastX, lastY);
    ctxLousa.lineTo(x, y);
    ctxLousa.stroke();
    [lastX, lastY] = [x, y];
}
function stopDrawing() { isDrawing = false; }
function clearCanvas() { ctxLousa.clearRect(0, 0, canvasLousa.width, canvasLousa.height); }


// --- Lógica do Jogo da Memória ---
function resetGame() {
    const gameCards = [...cardEmojis, ...cardEmojis].sort(() => 0.5 - Math.random());
    memoryGrid.innerHTML = '';
    cards = gameCards.map(emoji => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.emoji = emoji;
        cardEl.innerHTML = `<div class="card-face card-front">?</div><div class="card-face card-back">${emoji}</div>`;
        cardEl.addEventListener('click', () => flipCard(cardEl));
        memoryGrid.appendChild(cardEl);
        return cardEl;
    });
    flippedCards = []; matchesFound = 0; isProcessing = false;
    scoreDisplay.textContent = `Pares: 0 / 8`;
    memoryGrid.classList.add('locked');
    startGameButton.classList.remove('hidden');
    resetGameButton.classList.add('hidden');
    instructionDisplay.textContent = 'Clique em Iniciar para memorizar!';
}
function startPreviewPhase() {
    startGameButton.classList.add('hidden');
    instructionDisplay.textContent = `Memorize a posição! (3s)`;
    isProcessing = true;
    cards.forEach(card => card.classList.add('flipped'));
    setTimeout(() => {
        cards.forEach(card => card.classList.remove('flipped'));
        instructionDisplay.textContent = 'Agora, encontre os pares!';
        isProcessing = false; memoryGrid.classList.remove('locked');
        resetGameButton.classList.remove('hidden');
    }, 3000);
}
function flipCard(card) {
    if (isProcessing || card.classList.contains('flipped') || flippedCards.length >= 2) return;
    card.classList.add('flipped');
    flippedCards.push(card);
    if (flippedCards.length === 2) { isProcessing = true; setTimeout(checkForMatch, 800); }
}
function checkForMatch() {
    const [c1, c2] = flippedCards;
    if (c1.dataset.emoji === c2.dataset.emoji) {
        [c1, c2].forEach(c => c.classList.add('match'));
        matchesFound++;
        scoreDisplay.textContent = `Pares: ${matchesFound} / 8`;
        if (matchesFound === 8) { instructionDisplay.textContent = 'Parabéns! Você venceu! 🎉'; }
    } else {
        [c1, c2].forEach(c => c.classList.remove('flipped'));
    }
    flippedCards = []; isProcessing = false;
}


// --- Lógica do Jogo da Cobrinha ---
function initSnakeGame() {
    if (gameIsRunning) endGame();
    snake = [{ x: 10 * TILE_SIZE, y: 10 * TILE_SIZE }];
    dx = TILE_SIZE; dy = 0; snakeCurrentScore = 0; gameIsRunning = false;
    snakeStatus.textContent = 'Pronto para jogar!';
    snakeScore.textContent = 'Maçãs: 0';
    snakeStartButton.textContent = '▶️ Iniciar';
    snakeStartButton.classList.remove('hidden');
    generateFood(); drawGame();
}
function startGame() {
    if (gameIsRunning) return;
    gameIsRunning = true;
    snakeStartButton.classList.add('hidden');
    snakeStatus.textContent = 'Use as setas para mover!';
    gameLoopId = setInterval(mainLoop, gameSpeed);
}
function mainLoop() {
    if (didGameEnd()) return endGame();
    moveSnake(); drawGame();
}
function endGame() {
    clearInterval(gameLoopId); gameIsRunning = false;
    snakeStatus.textContent = `FIM DE JOGO! 😔 Pontuação: ${snakeCurrentScore}`;
    snakeStartButton.textContent = 'Jogar Novamente?';
    snakeStartButton.classList.remove('hidden');
}
function drawGame() {
    ctxSnake.fillStyle = '#f0f8ff';
    ctxSnake.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    drawFood(); drawSnake();
}
function drawSnake() {
    snake.forEach((part, i) => {
        ctxSnake.fillStyle = i === 0 ? '#5A3E98' : '#64C5F0';
        ctxSnake.fillRect(part.x, part.y, TILE_SIZE, TILE_SIZE);
    });
}
function drawFood() {
    ctxSnake.fillStyle = '#FF607F';
    ctxSnake.fillRect(food.x, food.y, TILE_SIZE, TILE_SIZE);
}
function generateFood() {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE) * TILE_SIZE,
        y: Math.floor(Math.random() * GRID_SIZE) * TILE_SIZE
    };
    if (snake.some(p => p.x === food.x && p.y === food.y)) generateFood();
}
function moveSnake() {
    let headX = snake[0].x + dx, headY = snake[0].y + dy;
    if (headX < 0) headX = snakeCanvas.width - TILE_SIZE; else if (headX >= snakeCanvas.width) headX = 0;
    if (headY < 0) headY = snakeCanvas.height - TILE_SIZE; else if (headY >= snakeCanvas.height) headY = 0;
    const head = { x: headX, y: headY };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        snakeCurrentScore++;
        snakeScore.textContent = `Maçãs: ${snakeCurrentScore}`;
        generateFood();
    } else { snake.pop(); }
}
function didGameEnd() { return snake.slice(1).some(p => p.x === snake[0].x && p.y === snake[0].y); }
function changeDirection(e) {
    if (!gameIsRunning) return;
    const key = e.key;
    const goingUp = dy === -TILE_SIZE, goingDown = dy === TILE_SIZE;
    const goingRight = dx === TILE_SIZE, goingLeft = dx === -TILE_SIZE;
    if (key === 'ArrowLeft' && !goingRight) { dx = -TILE_SIZE; dy = 0; }
    else if (key === 'ArrowUp' && !goingDown) { dx = 0; dy = -TILE_SIZE; }
    else if (key === 'ArrowRight' && !goingLeft) { dx = TILE_SIZE; dy = 0; }
    else if (key === 'ArrowDown' && !goingUp) { dx = 0; dy = TILE_SIZE; }
}


// --- Lógica do Jogo da Velha ---
function initTicTacToeGame() {
    board = Array(9).fill(''); currentPlayer = 'X'; gameActive = true;
    updateTicTacToeStatus(`Vez do Jogador ${currentPlayer} (❌)`);
    drawTicTacToeBoard();
}
function drawTicTacToeBoard() {
    tictactoeGrid.innerHTML = '';
    board.forEach((cell, i) => {
        const cellEl = document.createElement('div');
        cellEl.className = `ttt-cell ${cell ? 'occupied ' + (cell === 'X' ? 'text-primary-pink' : 'text-primary-blue') : ''}`;
        cellEl.textContent = cell;
        cellEl.addEventListener('click', () => handleCellClick(i));
        tictactoeGrid.appendChild(cellEl);
    });
}
function updateTicTacToeStatus(msg) { tttStatus.innerHTML = msg; }
function handleCellClick(i) {
    if (board[i] !== '' || !gameActive) return;
    board[i] = currentPlayer;
    drawTicTacToeBoard();
    if (checkWinner()) {
        updateTicTacToeStatus(`🎉 Jogador ${currentPlayer} VENCEU! 🎉`);
        gameActive = false;
    } else if (!board.includes('')) {
        updateTicTacToeStatus(`Temos um empate! 🤝`);
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTicTacToeStatus(`Vez do Jogador ${currentPlayer} (${currentPlayer === 'X' ? '❌' : '⭕'})`);
    }
}
function checkWinner() {
    return winningConditions.some(c => c.every(i => board[i] === currentPlayer));
}


// --- Inicialização e Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Navegação principal
    if (homeTitle) homeTitle.addEventListener('click', showInitialScreen);
    if (gamesButton) gamesButton.addEventListener('click', showGameSelection);
    if (slateButton) slateButton.addEventListener('click', showSlate);
    
    // Botões de navegação no Arcade
    if (backToHomeButton) backToHomeButton.addEventListener('click', showInitialScreen);
    if (backToGameSelectionMemory) backToGameSelectionMemory.addEventListener('click', showGameSelection);
    if (backToGameSelectionSnake) backToGameSelectionSnake.addEventListener('click', showGameSelection);
    if (backToGameSelectionTicTacToe) backToGameSelectionTicTacToe.addEventListener('click', showGameSelection);
    
    // Listeners para cards de seleção de jogo (usando event delegation)
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => showSpecificGame(card.dataset.game));
    });

    // Lousa Mágica
    setupLousa();
    if (clearCanvasButton) clearCanvasButton.addEventListener('click', clearCanvas);
    if (colorPicker) colorPicker.addEventListener('change', (e) => ctxLousa.strokeStyle = e.target.value);
    if (sizeSlider) sizeSlider.addEventListener('input', (e) => ctxLousa.lineWidth = e.target.value);
    if (backToHomeSlate) backToHomeSlate.addEventListener('click', showInitialScreen);
    
    // Jogo da Memória
    if (startGameButton) startGameButton.addEventListener('click', startPreviewPhase);
    if (resetGameButton) resetGameButton.addEventListener('click', resetGame);
    
    // Jogo da Cobrinha
    if (snakeStartButton) snakeStartButton.addEventListener('click', () => !gameIsRunning && startGame());
    document.addEventListener('keydown', changeDirection);
    // Controles Mobile
    ['up', 'down', 'left', 'right'].forEach(dir => {
        const btn = document.getElementById(`${dir}Button`);
        if(btn) btn.addEventListener('click', () => changeDirection({ key: `Arrow${dir.charAt(0).toUpperCase() + dir.slice(1)}` }));
    });
    
    // Jogo da Velha
    if (tttResetButton) tttResetButton.addEventListener('click', initTicTacToeGame);

    showInitialScreen(); // Garante que a tela inicial seja exibida primeiro

});
