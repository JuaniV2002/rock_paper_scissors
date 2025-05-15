const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");
const winStreakElem = document.getElementById("win-streak");
const resultMessage = document.getElementById("result-message");
const historyLog = document.getElementById("history-log");
const difficultySelect = document.getElementById("difficulty");

const buttons = document.querySelectorAll(".choices button");
const choices = ["rock", "paper", "scissors"];

let playerScore = 0;
let computerScore = 0;
let winStreak = 0;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerChoice = button.dataset.choice;
    const computerChoice = getComputerChoice(playerChoice);
    const result = determineWinner(playerChoice, computerChoice);

    showResult(playerChoice, computerChoice, result);
    updateScores(result);
  });
});

function getComputerChoice(playerChoice) {
  const difficulty = difficultySelect.value;

  if (difficulty === "easy") {
    return choices[Math.floor(Math.random() * 3)];
  } else {
    // Hard mode: lose 30% of the time
    const strategy = Math.random();
    if (strategy < 0.3) {
      return getWinningChoice(playerChoice);
    } else {
      return choices[Math.floor(Math.random() * 3)];
    }
  }
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
  let message = `You chose ${player}, computer chose ${computer}. `;

  if (result === "win") {
    message += "You win!";
  } else if (result === "lose") {
    message += "You lose!";
  } else {
    message += "It's a draw!";
  }

  resultMessage.textContent = message;

  const logEntry = document.createElement("div");
  logEntry.textContent = message;
  historyLog.prepend(logEntry);

  if (historyLog.children.length > 10) {
    historyLog.removeChild(historyLog.lastChild);
  }
}

function updateScores(result) {
  if (result === "win") {
    playerScore++;
    winStreak++;
  } else if (result === "lose") {
    computerScore++;
    winStreak = 0;
  }

  playerScoreElem.textContent = playerScore;
  computerScoreElem.textContent = computerScore;
  winStreakElem.textContent = winStreak;
}
