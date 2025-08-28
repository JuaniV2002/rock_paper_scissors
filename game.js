// Game state variables
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");
const winStreakElem = document.getElementById("win-streak");
const resultMessage = document.getElementById("result-message");
const historyLog = document.getElementById("history-log");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("game-mode");
const totalGamesElem = document.getElementById("total-games");
const winRateElem = document.getElementById("win-rate");
const bestStreakElem = document.getElementById("best-streak");
const timerDisplay = document.getElementById("timer-display");
const timerElem = document.getElementById("timer");
const roundCounter = document.getElementById("round-counter");
const currentRoundElem = document.getElementById("current-round");
const totalRoundsElem = document.getElementById("total-rounds");
const playerPreview = document.getElementById("player-preview");
const computerPreview = document.getElementById("computer-preview");
const achievementsElem = document.getElementById("achievements");
const gameOverModal = document.getElementById("game-over-modal");
const modalTitle = document.getElementById("modal-title");
const modalStats = document.getElementById("modal-stats");
const playAgainBtn = document.getElementById("play-again");
const resetBtn = document.getElementById("reset-game");
const clearHistoryBtn = document.getElementById("clear-history");
const themeBtn = document.getElementById("theme-btn");
const soundToggleBtn = document.getElementById("sound-toggle");

const buttons = document.querySelectorAll(".choice-btn");
const choices = ["rock", "paper", "scissors"];
const choiceEmojis = { rock: "🪨", paper: "📄", scissors: "✂️" };

// Game state
let playerScore = 0;
let computerScore = 0;
let winStreak = 0;
let bestStreak = 0;
let totalGames = 0;
let gameHistory = [];
let currentGame = {
  mode: 'classic',
  rounds: [],
  currentRound: 1,
  totalRounds: 5,
  timeLeft: 30,
  timer: null
};
let achievements = new Set();
let soundEnabled = true;
let playerStats = {
  rockCount: 0,
  paperCount: 0,
  scissorsCount: 0
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  loadGameData();
  setupEventListeners();
  updateDisplay();
});

function setupEventListeners() {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentGame.timer && currentGame.mode === 'timed') return;
      const playerChoice = button.dataset.choice;
      playRound(playerChoice);
    });
  });

  gameModeSelect.addEventListener('change', handleGameModeChange);
  resetBtn.addEventListener('click', resetGame);
  clearHistoryBtn.addEventListener('click', clearHistory);
  themeBtn.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);
  playAgainBtn.addEventListener('click', () => {
    hideModal();
    resetGame();
  });

  // Add keyboard support
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
  const keyMap = { '1': 'rock', '2': 'paper', '3': 'scissors', 'r': 'rock', 'p': 'paper', 's': 'scissors' };
  const choice = keyMap[event.key.toLowerCase()];
  if (choice && !currentGame.timer) {
    playRound(choice);
  }
}

function handleGameModeChange() {
  const mode = gameModeSelect.value;
  currentGame.mode = mode;
  
  if (mode === 'best-of-5') {
    currentGame.totalRounds = 5;
    roundCounter.classList.remove('hidden');
    timerDisplay.classList.add('hidden');
  } else if (mode === 'timed') {
    currentGame.timeLeft = 30;
    timerDisplay.classList.remove('hidden');
    roundCounter.classList.add('hidden');
    startTimer();
  } else {
    roundCounter.classList.add('hidden');
    timerDisplay.classList.add('hidden');
  }
  
  updateDisplay();
}

function startTimer() {
  if (currentGame.timer) clearInterval(currentGame.timer);
  
  currentGame.timer = setInterval(() => {
    currentGame.timeLeft--;
    timerElem.textContent = currentGame.timeLeft;
    
    if (currentGame.timeLeft <= 0) {
      clearInterval(currentGame.timer);
      currentGame.timer = null;
      endGame('Time\'s up!');
    }
  }, 1000);
}

function playRound(playerChoice) {
  playerStats[playerChoice + 'Count']++;
  
  const computerChoice = getComputerChoice(playerChoice);
  const result = determineWinner(playerChoice, computerChoice);

  // Update battle arena
  playerPreview.textContent = choiceEmojis[playerChoice];
  computerPreview.textContent = choiceEmojis[computerChoice];

  // Add battle animations
  playerPreview.classList.add('winner-animation');
  computerPreview.classList.add('winner-animation');
  setTimeout(() => {
    playerPreview.classList.remove('winner-animation');
    computerPreview.classList.remove('winner-animation');
  }, 600);

  showResult(playerChoice, computerChoice, result);
  updateScores(result);
  checkAchievements();
  
  // Handle game modes
  if (currentGame.mode === 'best-of-5') {
    currentGame.rounds.push({ playerChoice, computerChoice, result });
    currentGame.currentRound++;
    
    if (currentGame.currentRound > currentGame.totalRounds) {
      endGame();
    }
  }
  
  saveGameData();
  updateDisplay();
  playSound(result);
}

function getComputerChoice(playerChoice) {
  const difficulty = difficultySelect.value;
  
  // Analyze player patterns for impossible mode
  if (difficulty === 'impossible') {
    const recentChoices = gameHistory.slice(-5).map(game => game.playerChoice);
    const prediction = predictPlayerChoice(recentChoices);
    if (prediction) {
      return getWinningChoice(prediction);
    }
  }
  
  if (difficulty === 'easy') {
    return choices[Math.floor(Math.random() * 3)];
  } else if (difficulty === 'hard') {
    const strategy = Math.random();
    if (strategy < 0.3) {
      return getWinningChoice(playerChoice);
    } else {
      return choices[Math.floor(Math.random() * 3)];
    }
  } else { // impossible
    const strategy = Math.random();
    if (strategy < 0.7) {
      return getWinningChoice(playerChoice);
    } else {
      return choices[Math.floor(Math.random() * 3)];
    }
  }
}

function predictPlayerChoice(recentChoices) {
  if (recentChoices.length < 3) return null;
  
  // Look for patterns
  const counts = { rock: 0, paper: 0, scissors: 0 };
  recentChoices.forEach(choice => counts[choice]++);
  
  // Return most frequent choice
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function getWinningChoice(choice) {
  switch (choice) {
    case "rock": return "paper";
    case "paper": return "scissors";
    case "scissors": return "rock";
  }
}

function determineWinner(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
}

function showResult(player, computer, result) {
  const explanations = {
    'rock-scissors': 'Rock crushes Scissors',
    'paper-rock': 'Paper covers Rock',
    'scissors-paper': 'Scissors cuts Paper',
    'scissors-rock': 'Rock crushes Scissors',
    'rock-paper': 'Paper covers Rock',
    'paper-scissors': 'Scissors cuts Paper'
  };
  
  let message = `${choiceEmojis[player]} vs ${choiceEmojis[computer]} - `;
  
  if (result === "win") {
    message += `You win! ${explanations[player + '-' + computer]}`;
    resultMessage.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
    resultMessage.style.color = 'white';
  } else if (result === "lose") {
    message += `You lose! ${explanations[computer + '-' + player]}`;
    resultMessage.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
    resultMessage.style.color = 'white';
  } else {
    message += "It's a draw!";
    resultMessage.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
    resultMessage.style.color = 'white';
  }

  resultMessage.textContent = message;
  
  // Add to history
  const historyEntry = { playerChoice: player, computerChoice: computer, result, timestamp: Date.now() };
  gameHistory.unshift(historyEntry);
  
  if (gameHistory.length > 20) {
    gameHistory = gameHistory.slice(0, 20);
  }
  
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  historyLog.innerHTML = '';
  gameHistory.slice(0, 10).forEach(entry => {
    const div = document.createElement('div');
    const resultIcon = entry.result === 'win' ? '✅' : entry.result === 'lose' ? '❌' : '⚖️';
    div.innerHTML = `${resultIcon} ${choiceEmojis[entry.playerChoice]} vs ${choiceEmojis[entry.computerChoice]}`;
    historyLog.appendChild(div);
  });
}

function updateScores(result) {
  if (result === "win") {
    playerScore++;
    winStreak++;
    if (winStreak > bestStreak) {
      bestStreak = winStreak;
    }
  } else if (result === "lose") {
    computerScore++;
    winStreak = 0;
  }
  
  totalGames = playerScore + computerScore;
  updateDisplay();
}

function updateDisplay() {
  playerScoreElem.textContent = playerScore;
  computerScoreElem.textContent = computerScore;
  winStreakElem.textContent = winStreak;
  totalGamesElem.textContent = totalGames;
  bestStreakElem.textContent = bestStreak;
  
  const winRate = totalGames > 0 ? Math.round((playerScore / totalGames) * 100) : 0;
  winRateElem.textContent = winRate + '%';
  
  if (currentGame.mode === 'best-of-5') {
    currentRoundElem.textContent = Math.min(currentGame.currentRound, currentGame.totalRounds);
    totalRoundsElem.textContent = currentGame.totalRounds;
  }
  
  if (currentGame.mode === 'timed') {
    timerElem.textContent = currentGame.timeLeft;
  }
}

function checkAchievements() {
  const newAchievements = [];
  
  if (winStreak >= 3 && !achievements.has('hot-streak')) {
    achievements.add('hot-streak');
    newAchievements.push('🔥 Hot Streak!');
  }
  
  if (winStreak >= 5 && !achievements.has('unstoppable')) {
    achievements.add('unstoppable');
    newAchievements.push('⚡ Unstoppable!');
  }
  
  if (totalGames >= 10 && !achievements.has('veteran')) {
    achievements.add('veteran');
    newAchievements.push('🏆 Veteran Player!');
  }
  
  if (playerScore >= 50 && !achievements.has('master')) {
    achievements.add('master');
    newAchievements.push('👑 Rock Paper Scissors Master!');
  }
  
  const winRate = totalGames > 0 ? (playerScore / totalGames) * 100 : 0;
  if (winRate >= 80 && totalGames >= 20 && !achievements.has('champion')) {
    achievements.add('champion');
    newAchievements.push('🥇 Champion!');
  }
  
  // Display new achievements
  newAchievements.forEach(achievement => {
    const achievementDiv = document.createElement('div');
    achievementDiv.className = 'achievement';
    achievementDiv.textContent = achievement;
    achievementsElem.appendChild(achievementDiv);
    
    setTimeout(() => {
      achievementDiv.remove();
    }, 3000);
  });
}

function endGame(message = '') {
  if (currentGame.timer) {
    clearInterval(currentGame.timer);
    currentGame.timer = null;
  }
  
  let title = 'Game Over!';
  let stats = '';
  
  if (currentGame.mode === 'best-of-5') {
    if (playerScore > computerScore) {
      title = '🎉 You Won the Series!';
    } else if (computerScore > playerScore) {
      title = '😔 You Lost the Series!';
    } else {
      title = '🤝 Series Tied!';
    }
    stats = `Final Score: You ${playerScore} - ${computerScore} Computer`;
  } else if (currentGame.mode === 'timed') {
    title = message || 'Time\'s Up!';
    stats = `In 30 seconds: You ${playerScore} - ${computerScore} Computer`;
  }
  
  modalTitle.textContent = title;
  modalStats.innerHTML = `
    <p>${stats}</p>
    <p>Win Rate: ${totalGames > 0 ? Math.round((playerScore / totalGames) * 100) : 0}%</p>
    <p>Best Streak: ${bestStreak}</p>
  `;
  
  showModal();
}

function showModal() {
  gameOverModal.classList.remove('hidden');
}

function hideModal() {
  gameOverModal.classList.add('hidden');
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  winStreak = 0;
  currentGame = {
    mode: gameModeSelect.value,
    rounds: [],
    currentRound: 1,
    totalRounds: 5,
    timeLeft: 30,
    timer: null
  };
  
  if (currentGame.timer) {
    clearInterval(currentGame.timer);
  }
  
  playerPreview.textContent = '?';
  computerPreview.textContent = '?';
  resultMessage.textContent = 'Make your move!';
  resultMessage.style.background = '';
  resultMessage.style.color = '';
  
  if (currentGame.mode === 'timed') {
    startTimer();
  }
  
  updateDisplay();
  saveGameData();
}

function clearHistory() {
  gameHistory = [];
  updateHistoryDisplay();
  saveGameData();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  
  localStorage.setItem('theme', newTheme);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  localStorage.setItem('soundEnabled', soundEnabled);
}

function playSound(result) {
  if (!soundEnabled) return;
  
  // Create audio context for sound effects
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (result === 'win') {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
  } else if (result === 'lose') {
    oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
    oscillator.frequency.exponentialRampToValueAtTime(196.00, audioContext.currentTime + 0.2); // G3
  } else {
    oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime); // E4
  }
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

function saveGameData() {
  const gameData = {
    playerScore,
    computerScore,
    winStreak,
    bestStreak,
    totalGames,
    gameHistory,
    achievements: Array.from(achievements),
    playerStats
  };
  localStorage.setItem('rpsGameData', JSON.stringify(gameData));
}

function loadGameData() {
  const saved = localStorage.getItem('rpsGameData');
  if (saved) {
    const data = JSON.parse(saved);
    playerScore = data.playerScore || 0;
    computerScore = data.computerScore || 0;
    winStreak = data.winStreak || 0;
    bestStreak = data.bestStreak || 0;
    totalGames = data.totalGames || 0;
    gameHistory = data.gameHistory || [];
    achievements = new Set(data.achievements || []);
    playerStats = data.playerStats || { rockCount: 0, paperCount: 0, scissorsCount: 0 };
  }
  
  // Load theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  
  // Load sound preference
  const savedSound = localStorage.getItem('soundEnabled');
  if (savedSound !== null) {
    soundEnabled = JSON.parse(savedSound);
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  }
  
  updateHistoryDisplay();
}
