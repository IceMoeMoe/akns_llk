// Game state variables
let boardSize = 4;
let pairsCount = (boardSize * boardSize) / 2;
let selectedTiles = [];
let matchedPairs = 0;
let attempts = 0;
let gameStartTime;
let gameTimer;
let isGameActive = false;

// DOM elements
const gameBoard = document.getElementById('game-board');
const matchesCountElement = document.getElementById('matches-count');
const attemptsCountElement = document.getElementById('attempts-count');
const resetButton = document.getElementById('reset-button');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const successModal = document.getElementById('success-modal');
const finalAttemptsElement = document.getElementById('final-attempts');
const finalTimeElement = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again');

// Event listeners
resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', () => {
    hideModal();
    resetGame();
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        boardSize = parseInt(e.target.dataset.size);
        pairsCount = (boardSize * boardSize) / 2;
        resetGame();
    });
});

// Initialize the game
initGame();

function initGame() {
    isGameActive = true;
    gameStartTime = Date.now();
    matchedPairs = 0;
    attempts = 0;
    selectedTiles = [];
    updateStats();
    
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Set up grid size based on board size
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    
    // Calculate tile size based on board size
    const tileSize = Math.min(80, Math.floor(600 / boardSize)); // Max 80px, but scales down for larger boards
    
    // Get random operators
    let randomOperators = getRandomOperators(pairsCount);
    
    // Create pairs
    let tiles = [...randomOperators, ...randomOperators];
    
    // Shuffle tiles
    tiles = shuffleArray(tiles);
    
    // Create the game board
    tiles.forEach((operatorUrl, index) => {
        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.dataset.index = index;
        tile.dataset.operatorUrl = operatorUrl;
        
        // Create tile back (hidden face)
        const tileBack = document.createElement('div');
        tileBack.className = 'tile-back';
        tile.appendChild(tileBack);
        
        // Create tile front (operator image)
        const tileFront = document.createElement('div');
        tileFront.className = 'tile-front';
        
        const img = document.createElement('img');
        img.src = operatorUrl;
        img.className = 'tile-image';
        img.alt = 'Operator';
        img.onerror = function() {
            // Fallback if image fails to load
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iMzAiIHk9IjMwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYSIgZHk9Ii40ZW0iPk9wZXJhdG9yPC90ZXh0Pjwvc3ZnPg==';
            this.style.opacity = '0.6';
        };
        
        tileFront.appendChild(img);
        tile.appendChild(tileFront);
        
        // Add click event
        tile.addEventListener('click', handleTileClick);
        
        gameBoard.appendChild(tile);
    });
}

function handleTileClick(event) {
    if (!isGameActive) return;
    
    const tile = event.currentTarget;
    
    // Ignore if already matched or already selected
    if (tile.classList.contains('matched') || tile.classList.contains('revealed') || selectedTiles.length >= 2) {
        return;
    }
    
    // Reveal the tile
    tile.classList.add('revealed');
    selectedTiles.push(tile);
    
    // If two tiles are selected
    if (selectedTiles.length === 2) {
        attempts++;
        updateStats();
        
        const [firstTile, secondTile] = selectedTiles;
        
        // Check if they match
        if (firstTile.dataset.operatorUrl === secondTile.dataset.operatorUrl) {
            // Match found
            setTimeout(() => {
                firstTile.classList.add('matched');
                secondTile.classList.add('matched');
                selectedTiles = [];
                matchedPairs++;
                updateStats();
                
                // Check if all pairs are matched
                if (matchedPairs === pairsCount) {
                    gameComplete();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                firstTile.classList.remove('revealed');
                secondTile.classList.remove('revealed');
                selectedTiles = [];
            }, 1000);
        }
    }
}

function getRandomOperators(count) {
    // Randomly select operators from the imported list
    const shuffledOperators = shuffleArray([...operatorImages]);
    return shuffledOperators.slice(0, count);
}

function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function updateStats() {
    matchesCountElement.textContent = `${matchedPairs} / ${pairsCount}`;
    attemptsCountElement.textContent = attempts;
}

function resetGame() {
    clearTimeout(gameTimer);
    initGame();
}

function gameComplete() {
    isGameActive = false;
    const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    finalAttemptsElement.textContent = attempts;
    finalTimeElement.textContent = formatTime(totalTime);
    
    // Show success modal with a slight delay
    gameTimer = setTimeout(() => {
        showModal();
    }, 500);
}

function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
}

function showModal() {
    successModal.classList.remove('hidden');
    setTimeout(() => {
        successModal.classList.add('visible');
    }, 10);
}

function hideModal() {
    successModal.classList.remove('visible');
    setTimeout(() => {
        successModal.classList.add('hidden');
    }, 300);
}
