// Game state
let gameState = {
    mode: null,
    startTime: null,
    timer: null,
    wpm: 0,
    accuracy: 100,
    mistakes: 0,
    totalChars: 0,
    playerName: ''
};

// Text content
const textContent = {
    preamble: `We the People`,
    constitution: `All legislative Powers here`
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const textToType = document.getElementById('text-to-type');
const typingArea = document.getElementById('typing-area');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const hiddenInput = document.getElementById('hidden-input');

// Track user input
let userInput = '';

// Focus hidden input when clicking the text area
textToType.addEventListener('click', () => {
    hiddenInput.focus();
});

function startGame(mode) {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    gameState.mode = mode;
    gameState.playerName = playerName;
    gameState.startTime = Date.now();
    gameState.mistakes = 0;
    gameState.totalChars = 0;
    gameState.wpm = 0;
    gameState.accuracy = 100;

    // Set up the text
    userInput = '';
    renderText();
    hiddenInput.value = '';

    // Show game screen
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');

    // Start timer
    startTimer();
    
    // Focus hidden input for typing
    setTimeout(() => hiddenInput.focus(), 100);
}

// Timer function
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update WPM
        updateStats();
    }, 1000);
}

// Render the text with per-character coloring (no caret)
function renderText() {
    const typedText = userInput;
    const originalText = textContent[gameState.mode];
    let html = '';
    for (let i = 0; i < originalText.length; i++) {
        let char = originalText[i];
        if (i < typedText.length) {
            if (typedText[i] === char) {
                html += `<span class=\"correct\">${char === ' ' ? '&nbsp;' : char}</span>`;
            } else {
                html += `<span class=\"incorrect\">${char === ' ' ? '&nbsp;' : char}</span>`;
            }
        } else {
            html += `<span class=\"char\">${char === ' ' ? '&nbsp;' : char}</span>`;
        }
    }
    textToType.innerHTML = html;
}

// Handle input events for typing
hiddenInput.addEventListener('input', (e) => {
    userInput = hiddenInput.value;
    updateStats();
});

// Handle backspace and prevent overtyping
hiddenInput.addEventListener('keydown', (e) => {
    const originalText = textContent[gameState.mode];
    if (e.key === 'Backspace') {
        // allow
    } else if (e.key.length === 1 && userInput.length >= originalText.length) {
        e.preventDefault();
    }
});

// Update statistics
function updateStats() {
    const elapsedMinutes = (Date.now() - gameState.startTime) / 60000;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    gameState.wpm = Math.round(wordsTyped / elapsedMinutes);
    
    // Calculate accuracy
    const typedText = userInput;
    const originalText = textContent[gameState.mode].substring(0, typedText.length);
    let mistakes = 0;
    
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] !== originalText[i]) {
            mistakes++;
        }
    }
    
    gameState.mistakes = mistakes;
    gameState.totalChars = typedText.length;
    gameState.accuracy = Math.round(((gameState.totalChars - gameState.mistakes) / gameState.totalChars) * 100) || 100;
    
    // Update displays
    wpmDisplay.textContent = gameState.wpm;
    accuracyDisplay.textContent = `${gameState.accuracy}%`;
    
    // Render colored text
    renderText();
    
    // Check if typing is complete
    if (typedText.length === textContent[gameState.mode].length) {
        endGame();
    }
}

// End game
function endGame() {
    clearInterval(gameState.timer);
    
    // Update final stats
    document.getElementById('final-wpm').textContent = gameState.wpm;
    document.getElementById('final-accuracy').textContent = `${gameState.accuracy}%`;
    document.getElementById('final-time').textContent = timerDisplay.textContent;
    
    // Save to leaderboard
    saveToLeaderboard();
    
    // Show results screen
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
}

// Save to leaderboard
async function saveToLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode: gameState.mode,
                name: gameState.playerName,
                wpm: gameState.wpm,
                accuracy: gameState.accuracy,
                time: timerDisplay.textContent
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save to leaderboard');
        }
    } catch (error) {
        console.error('Error saving to leaderboard:', error);
    }
}

// Show leaderboard
function showLeaderboard() {
    resultsScreen.classList.add('hidden');
    leaderboardScreen.classList.remove('hidden');
    showLeaderboardTab(gameState.mode);
}

// Show leaderboard tab
async function showLeaderboardTab(mode) {
    try {
        const response = await fetch(`/api/leaderboard/${mode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const entries = await response.json();
        const content = document.getElementById('leaderboard-content');
        
        content.innerHTML = entries.map((entry, index) => `
            <div class="leaderboard-entry">
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.wpm} WPM (${entry.accuracy}%)</span>
            </div>
        `).join('') || '<p>No entries yet</p>';
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        document.getElementById('leaderboard-content').innerHTML = '<p>Error loading leaderboard</p>';
    }
}

// Reset game
function resetGame() {
    clearInterval(gameState.timer);
    gameState = {
        mode: null,
        startTime: null,
        timer: null,
        wpm: 0,
        accuracy: 100,
        mistakes: 0,
        totalChars: 0,
        playerName: ''
    };
    userInput = '';
    hiddenInput.value = '';
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
} 