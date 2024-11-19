let playerScore = 0;
let computerScore = 0;

function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return "Tie!";
    }
    
    if ((playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')) {
        playerScore++;
        return "You win!";
    }
    
    computerScore++;
    return "Computer wins!";
}

function updateDisplay(playerChoice, computerChoice, result) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        Your choice: ${playerChoice}<br>
        Computer's choice: ${computerChoice}<br>
        ${result}
    `;
    document.getElementById('score').textContent = 
        `Score - You: ${playerScore} Computer: ${computerScore}`;
}

function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    updateDisplay(playerChoice, computerChoice, result);
}