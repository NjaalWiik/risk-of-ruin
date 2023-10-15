let heads = 0;
let tails = 0;
let coin = document.querySelector(".coin");
let flipBtn = document.querySelector("#flip-button");
let resetBtn = document.querySelector("#reset-button");
let startBtn = document.querySelector("#start-button");

let balance = 25;
let timeLeft = 10 * 60; // 10 minutes in seconds
let gameTimer;
let isGameActive = false;




const updateStats = () => {
    document.querySelector("#heads-count").textContent = `Heads: ${heads}`;
    document.querySelector("#tails-count").textContent = `Tails: ${tails}`;
    document.querySelector("#balanceNbr").textContent = `${balance}`;
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
        setTimeout(() => {
            heads++;
            // Using runCounter to animate balance update
            runCounter(document.querySelector("#balanceNbr"), balance, balance + betAmount, 500);
            balance += betAmount;
            updateStats();
            flipBtn.disabled = false;
        }, 3000);
    } else {
        setTimeout(() => { coin.style.animation = "spin-tails 3s forwards"; }, 100);
        setTimeout(() => {
            tails++;
            // Using runCounter to animate balance update
            runCounter(document.querySelector("#balanceNbr"), balance, balance - betAmount, 500);
            balance -= betAmount;
            updateStats();
            flipBtn.disabled = false;
        }, 3000);
    }
});

function startGame() {
    // Ensure there's no pre-existing interval running
    if (typeof gameTimer !== 'undefined') {
        clearInterval(gameTimer);
    }

    // Ensure there's no pre-existing interval running
    if (gameTimer) {
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
    timeLeft = 10 * 60;
    updateStats();
    isGameActive = false;
    clearInterval(gameTimer); // Ensure the previous timer is cleared
}

function runCounter(target, start, end, duration) {
    const numberRegex = /^(\D?)([\d.,\s]+)(\D?)$/;

    let startMatch = String(start).match(numberRegex);
    let endMatch = String(end).match(numberRegex);

    if (!startMatch || !endMatch) {
        console.error("Invalid start or end value. Must be a number or a string with at most one non-number character at the start or end.");
        return;
    }

    let [_, , startNum,] = startMatch;
    let [__, endPrefix, endNum, endSuffix] = endMatch;

    const useComma = endNum.includes(",");
    const useSpace = endNum.includes(" ");

    startNum = parseFloat(startNum.replace(/[,\s]/g, ''));
    endNum = parseFloat(endNum.replace(/[,\s]/g, ''));

    if (isNaN(startNum) || isNaN(endNum)) {
        console.error("Invalid numerical part in start or end value.");
        return;
    }

    const decimalPlaces = (endNum.toString().split('.')[1] || []).length;

    let startTime = performance.now();
    let range = endNum - startNum;

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    function formatNumber(number) {
        let formattedNumber = number.toFixed(decimalPlaces);
        if (useComma) {
            return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else if (useSpace) {
            return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        } else {
            return formattedNumber;
        }
    }

    function render() {
        let nowTime = performance.now();
        let progress = Math.min((nowTime - startTime) / duration, 1);
        let easing = easeOutCubic(progress);
        let currentValue = startNum + (range * easing);

        target.innerHTML = endPrefix + formatNumber(currentValue) + endSuffix;

        if (progress < 1) {
            requestAnimationFrame(render);
        } else {
            target.innerHTML = endPrefix + formatNumber(endNum) + endSuffix;
        }
    }

    requestAnimationFrame(render);
}

document.getElementById('help-icon').addEventListener('click', () => {
    document.getElementById('rules-modal').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('rules-modal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('rules-modal')) {
        document.getElementById('rules-modal').style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('myModal');
    var modalContent = document.getElementsByClassName('modal-content')[0];

    // Close modal if 'Esc' key is pressed
    window.addEventListener('keydown', function (event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // Close modal if click is outside of modalContent
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.style.display = "none";
    }

    // ... Rest of your JavaScript code for opening the modal, etc.
});
