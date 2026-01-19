const gameBoard = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const levelClearMessage = document.getElementById("level-clear-message");

let flippedCards = [];
let matchedCount = 0;
let score = Number(localStorage.getItem("score")) || 0;
let timer;
let timeLeft = 120;
let isFrozen = false;


const emojis = ["🍎", "🍌", "🍇", "🍒", "🍓", "🥝", "🍍", "🥥"];  // 8 unique emojis

const emojiToImage = {
  "🍎": "images/5.jpg",
  "🍌": "images/6.jpg",
  "🍇": "images/7.jpg",
  "🍒": "images/8.jpg",
  "🍓": "images/9.jpg",
  "🥝": "images/10.jpg",
  "🍍": "images/11.jpg",
  "🥥": "images/12.jpg",
};


const pairs = [...emojis, ...emojis]; // 4 pairs + joker = 9 cards

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createCard(emoji, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.emoji = emoji;

 card.innerHTML = `
  <div class="card-inner">
    <div class="card-front"></div>
    <div class="card-back">
      <img src="${emojiToImage[emoji]}" alt="${emoji}">
    </div>
  </div>
`;


  card.addEventListener("click", () => handleCardClick(card));
  return card;
}

function flipCard(card) {
  card.classList.add("flipped");
}

function unflipCard(card) {
  card.classList.remove("flipped");
}

function handleCardClick(card) {
  if (isFrozen) return;  // <--- stop if frozen
  if (card.classList.contains("flipped") || flippedCards.length === 2) return;
  flipCard(card);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}


function checkForMatch() {
  const [card1, card2] = flippedCards;
  const emoji1 = card1.dataset.emoji;
  const emoji2 = card2.dataset.emoji;

   

   

  if (emoji1 === emoji2) {
    sparkle(card1);
    sparkle(card2);
    matchedCount += 2;
    score += 1;
    flippedCards = [];
    updateScore();
    checkLevelComplete();
  } else {
    setTimeout(() => {
      unflipCard(card1);
      unflipCard(card2);
      flippedCards = [];
    }, 1000);
  }
}


function updateScore() {
  scoreDisplay.textContent = score;
  animateCoinToScore();  // <-- Add this line here
}


function checkLevelComplete() {
  if (matchedCount === 16) {
    clearInterval(timer);
    levelClearMessage.classList.remove("hidden");
    // Show the Level 2 button after a short delay and hide the cleared message
    setTimeout(() => {
      levelClearMessage.classList.add("hidden");
      const nextLevelContainer = document.getElementById("next-level-container");
      nextLevelContainer.classList.remove("hidden");
    }, 2000); // 2 seconds delay before swapping message to button
  }
}



function startTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = formatTime(timeLeft);
   if (timeLeft <= 0) {
  clearInterval(timer);
  showTimeoutMessage();
}

  }, 1000);
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function sparkle(card) {
  card.classList.add("sparkle");
  setTimeout(() => {
    card.classList.remove("sparkle");
  }, 800);
}

function init() {
  gameBoard.innerHTML = "";
  flippedCards = [];
  matchedCount = 0;
  timeLeft = 60;
  updateScore();
  levelClearMessage.classList.add("hidden");

  shuffle(pairs);
  pairs.forEach((emoji, idx) => {
    const card = createCard(emoji, idx);
    gameBoard.appendChild(card);
  });

  startTimer();
}

init();
// Add this after init() or at bottom of the script
document.getElementById("next-level-btn").addEventListener("click", () => {
  localStorage.setItem("score", score);  // store updated score
  window.location.href = "level3.html";
});



function animateCoinToScore() {
  const scoreRect = scoreDisplay.getBoundingClientRect();

  // Horizontal center of scoreboard number
  const centerX = scoreRect.left + scoreRect.width / 2;

  // Start Y: lower than before, like 80px below scoreboard bottom so movement is visible
  const startY = scoreRect.bottom + 80;

  // Target Y: center of scoreboard number
  const targetY = scoreRect.top + scoreRect.height / 2;

  // Horizontal spacing between two coins
  const horizontalSpacing = 30; // pixels

  for (let i = 0; i < 2; i++) {
    const coin = document.createElement("div");
    coin.textContent = "🪙";
    coin.style.position = "fixed";
    coin.style.fontSize = "2.5rem";  // slightly bigger
    // Position coins side-by-side with gap, horizontally aligned with scoreboard
    coin.style.left = `${centerX + (i === 0 ? -horizontalSpacing/2 : horizontalSpacing/2)}px`;
    coin.style.top = `${startY}px`;  // lower start position
    coin.style.opacity = "1";
    coin.style.zIndex = 1000;
    coin.style.transition = "transform 1s ease, opacity 1s ease";

    document.body.appendChild(coin);

    const deltaY = targetY - startY;
    const deltaX = 0;

    // Animate one by one with delay (0.3s apart)
    setTimeout(() => {
      coin.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.3)`;
      coin.style.opacity = "0";
    }, i * 350 + 50); // coin 0 starts after 50ms, coin 1 after 400ms

    setTimeout(() => {
      document.body.removeChild(coin);
    }, i * 350 + 1050);  // remove after animation ends
  }
}
function showTimeoutMessage() {
  const timeoutMessage = document.getElementById("timeout-message");
  timeoutMessage.classList.remove("hidden");

  isFrozen = true;  // <--- freeze the game!
  
  // Optional: add freeze animation class to grid
  gameBoard.classList.add("frozen");



  // Optionally hide the level-clear message if visible
  levelClearMessage.classList.add("hidden");
}
