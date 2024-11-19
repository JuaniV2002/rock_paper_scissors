function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function getPlayerChoice() {
    let choice = prompt('Enter rock, paper, or scissors:').toLowerCase();
    while (choice !== 'rock' && choice !== 'paper' && choice !== 'scissors') {
        choice = prompt('Invalid input. Please enter rock, paper, or scissors:').toLowerCase();
    }
    return choice;
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return "Tie!";
    }
    
    if ((playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')) {
        return "You win!";
    }
    
    return "Computer wins!";
}

function playGame() {
    const playerChoice = getPlayerChoice();
    const computerChoice = getComputerChoice();
    
    console.log(`Your choice: ${playerChoice}`);
    console.log(`Computer's choice: ${computerChoice}`);
    console.log(determineWinner(playerChoice, computerChoice));
}

// Start the game
playGame();