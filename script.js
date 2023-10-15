let heads = 0;
let tails = 0;
let coin = document.querySelector(".coin");
let flipBtn = document.querySelector("#flip-button");
let resetBtn = document.querySelector("#reset-button");
let startBtn = document.querySelector("#start-button");

let balance = 1;
let timeLeft = 10 * 60; // 10 minutes in seconds
let gameTimer;
let isGameActive = false;




const updateStats = () => {
    document.querySelector("#heads-count").textContent = `Heads: ${heads}`;
    document.querySelector("#tails-count").textContent = `Tails: ${tails}`;
    document.querySelector("#balance-display").textContent = `Balance: $${balance}`;
    document.querySelector("#timer-display").textContent = `Timer: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;
};

flipBtn.addEventListener("click", () => {
    if (!isGameActive) {
        // Start the game if it's not active yet.
        isGameActive = true;
        startGame();
    }

    let betAmount = parseInt(document.getElementById("bet-input").value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert("Invalid bet amount. Please bet between $1 and your current balance.");
        return;
    }

    // Disable flip button while spin is in progress.
    flipBtn.disabled = true;
    coin.style.animation = "none";

    let isHeads = Math.random() < 0.6;

    if (isHeads) {
        setTimeout(() => { coin.style.animation = "spin-heads 3s forwards"; }, 100);
        // Move balance changes and count update to be after the animation completes.
        setTimeout(() => {
            heads++;
            balance += betAmount;
            updateStats();
            // Re-enable flip button after spin and updates complete.
            flipBtn.disabled = false;
        }, 3000);
    } else {
        setTimeout(() => { coin.style.animation = "spin-tails 3s forwards"; }, 100);
        // Move balance changes and count update to be after the animation completes.
        setTimeout(() => {
            tails++;
            balance -= betAmount;
            updateStats();
            // Re-enable flip button after spin and updates complete.
            flipBtn.disabled = false;
        }, 3000);
    }
});

function startGame() {
    // Ensure there's no pre-existing interval running
    if (typeof gameTimer !== 'undefined') {
        clearInterval(gameTimer);
    }

    // Set a recurring interval that updates every second (1000ms)
    gameTimer = setInterval(() => {

        // Decrease the remaining time
        if (timeLeft > 0) {
            timeLeft--;
        }

        updateStats(); // Update the displayed stats

        if (timeLeft <= 0 || balance <= 0 || balance >= 250) {
            clearInterval(gameTimer);
            isGameActive = false;

            if (balance >= 250) {
                runConfetti();
                setTimeout(() => {
                    document.getElementById('winningModal').style.display = 'flex';
                }, 2000);
            }
            else if (timeLeft <= 0) {
                alert("Time's up! Your final balance is $" + balance);
            }
            else if (balance <= 0) {
                if (confirm("You went bust! Press OK to play again.")) {
                    resetGame();
                }
            }
        }
        else {
            timeLeft--;
            updateStats();
        }
    }, 1000);
}

// Confetti function:

function runConfetti() {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        );
    }, 250);
}

resetBtn.addEventListener("click", () => {
    resetGame();
});

document.getElementById('seeStats').addEventListener('click', () => {
    // Hide the modal to allow the player to see the final stats on the main UI
    document.getElementById('winningModal').style.display = 'none';
});

document.getElementById('resetFromWin').addEventListener('click', () => {
    // Hide the modal and reset the game when "Reset Game" is clicked
    document.getElementById('winningModal').style.display = 'none';
    resetGame();
});

function resetGame() {
    // Reset stats and prepare for a new game round
    heads = 0;
    tails = 0;
    balance = 25;
    timeLeft = 10 * 60;  // Resetting the timer to 10 minutes
    updateStats();
    isGameActive = false;  // Ensure the game is not marked as active
    // You may add more reset logic if needed
}