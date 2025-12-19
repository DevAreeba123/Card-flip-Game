const gameBoard = document.getElementById('game-board');
const movesCount = document.getElementById('moves-count');
const timerDisplay = document.getElementById('timer');
const pairsCount = document.getElementById('pairs-count');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const gameMessage = document.getElementById('game-message');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const finalStats = document.getElementById('final-stats');
const playAgainBtn = document.getElementById('play-again-btn');

// Game Variables 
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isGameStarted = false;
let isLocked = false; // Prevent clicking during card check
let totalPairs = 8;

// Card Emojis
const allEmojis = [
    '🎮', '🎯', '🎨', '🎭', '🎪', '🎬',
    '🎵', '🎸', '🎹', '🎺', '🎻', '🥁',
    '⚽', '🏀', '🏈', '🎾', '🏐', '🎱',
    '🌟', '🌙', '☀️', '🌈', '❄️', '🔥',
    '🦋', '🐬', '🦊', '🐼', '🦄', '🐲'
];

// ========== Difficulty Settings ==========
const difficultySettings = {
    easy: { pairs: 6, cols: 4, cardSize: '80px' },
    medium: { pairs: 8, cols: 4, cardSize: '80px' },
    hard: { pairs: 12, cols: 6, cardSize: '70px' }
};


// ========== Initialize Game ==========
function initGame() {
    const difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    totalPairs = settings.pairs;
    
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isGameStarted = false;
    isLocked = false;
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update UI
    movesCount.textContent = '0';
    timerDisplay.textContent = '00:00';
    pairsCount.textContent = `0/${totalPairs}`;
    
    // Set board class
    gameBoard.className = 'game-board ' + difficulty;
    
    // Generate cards
    generateCards(settings.pairs);
    
    // Hide game message
    gameMessage.classList.add('hidden');
}

// ========== Generate Cards ==========
function generateCards(pairsNeeded) {
    // Clear board
    gameBoard.innerHTML = '';
    
    // Select random emojis
    const shuffledEmojis = [...allEmojis].sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffledEmojis.slice(0, pairsNeeded);
    
    // Create pairs
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    
    // Create card elements
    shuffledCards.forEach((emoji, index) => {
        const card = createCardElement(emoji, index);
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// ========== Create Card Element ==========
function createCardElement(emoji, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="card-back">
            <i class="fas fa-question"></i>
        </div>
        <div class="card-front">
            ${emoji}
        </div>
    `;
    
    // Add click event
    card.addEventListener('click', () => handleCardClick(card));
    
    return card;
}

// ========== Handle Card Click ==========
function handleCardClick(card) {
    // Check if game is started
    if (!isGameStarted) {
        startTimer();
        isGameStarted = true;
    }
    
    // Check if card can be flipped
    if (isLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    // Flip the card
    flipCard(card);
}

// ========== Flip Card ==========
function flipCard(card) {
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // Check for match when 2 cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        movesCount.textContent = moves;
        checkForMatch();
    }
}

// ========== Check For Match ==========
function checkForMatch() {
    isLocked = true;
    
    const [card1, card2] = flippedCards;
    const emoji1 = card1.dataset.emoji;
    const emoji2 = card2.dataset.emoji;
    
    if (emoji1 === emoji2) {
        // Match found!
        handleMatch(card1, card2);
    } else {
        // No match
        handleNoMatch(card1, card2);
    }
}

// ========== Handle Match ==========
function handleMatch(card1, card2) {
    setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        matchedPairs++;
        pairsCount.textContent = `${matchedPairs}/${totalPairs}`;
        
        flippedCards = [];
        isLocked = false;
        
        // Check for game completion
        if (matchedPairs === totalPairs) {
            endGame();
        }
    }, 300);
}

// ========== Handle No Match ==========
function handleNoMatch(card1, card2) {
    setTimeout(() => {
        // Add shake animation
        card1.classList.add('shake');
        card2.classList.add('shake');
        
        setTimeout(() => {
            card1.classList.remove('flipped', 'shake');
            card2.classList.remove('flipped', 'shake');
            flippedCards = [];
            isLocked = false;
        }, 500);
    }, 800);
}

// ========== Timer Functions ==========
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ========== End Game ==========
function endGame() {
    stopTimer();
    
    const timeFormatted = timerDisplay.textContent;
    const rating = calculateRating();
    
    // Update message
    messageTitle.textContent = '🎉 Congratulations!';
    messageText.textContent = 'You found all matching pairs!';
    finalStats.innerHTML = `
        <p>⏱️ Time: <span>${timeFormatted}</span></p>
        <p>🎯 Moves: <span>${moves}</span></p>
        <p>⭐ Rating: <span>${rating}</span></p>
    `;
    
    // Show message
    setTimeout(() => {
        gameMessage.classList.remove('hidden');
    }, 500);
}

// ========== Calculate Rating ==========
function calculateRating() {
    const optimalMoves = totalPairs * 2;
    const ratio = moves / optimalMoves;
    
    if (ratio <= 1.5) return '⭐⭐⭐ Perfect!';
    if (ratio <= 2) return '⭐⭐ Great!';
    if (ratio <= 2.5) return '⭐ Good!';
    return 'Keep Practicing!';
}

// ========== Shuffle Cards (for restart) ==========
function shuffleCards() {
    // Get all emojis from current cards
    const emojis = cards.map(card => card.dataset.emoji);
    
    // Shuffle
    const shuffled = emojis.sort(() => Math.random() - 0.5);
    
    // Reassign emojis
    cards.forEach((card, index) => {
        card.dataset.emoji = shuffled[index];
        card.querySelector('.card-front').textContent = shuffled[index];
    });
}

// ========== Event Listeners ==========

// Start Button
startBtn.addEventListener('click', () => {
    initGame();
});

// Restart Button
restartBtn.addEventListener('click', () => {
    initGame();
});

// Play Again Button
playAgainBtn.addEventListener('click', () => {
    gameMessage.classList.add('hidden');
    initGame();
});

// Difficulty Change
difficultySelect.addEventListener('change', () => {
    if (isGameStarted) {
        if (confirm('Changing difficulty will reset the game. Continue?')) {
            initGame();
        }
    } else {
        initGame();
    }
});

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});