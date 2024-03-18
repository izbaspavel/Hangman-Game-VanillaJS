// ========== URL APIs ==========
const wordUrl = "https://random-word-api.herokuapp.com/word";
const dictionaryUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// ========== DOM Variables ==========
const keyboard = document.querySelector(".keyboard");
const hintText = document.querySelector(".hint");
const pointsText = document.querySelector(".points");
const hangmanImage = document.querySelector(".hangmanImage");
const display = document.querySelector(".word-display");
const timer = document.querySelector(".timerCover");
const starText = document.querySelector(".stars");
const hearts = document.querySelectorAll(".heart");

const modalImage = document.querySelector(".modalImage img");
const modalText = document.querySelector(".modalText h2");
const modalCorrectWord = document.querySelector(".modalText strong");
const modalCover = document.querySelector(".cover");
const modalButton = document.querySelector(".modalButton");

// ========== Aplication Variables ==========
let secretWord,
  disabledLetters,
  correctLetters,
  tries,
  time,
  points = 60,
  timeCounter,
  starsNumber = 3;
const totalLives = 6;

// Generate virtual keyboard interface

(function generateKeyboard() {
  for (let i = 65; i < 91; i++) {
    const letter = String.fromCharCode(i);
    keyboard.innerHTML += `<button class='letter'>${letter}</button>`;
  }
})();

const letterButtons = document.querySelectorAll(".letter");

// Start the game initialization process

async function initiateGame() {
  correctLetters = [];
  disabledLetters = [];
  tries = 0;
  time = 0;
  timer.style.height = "0";
  display.innerText = "";
  hintText.innerText = "";
  getHangmanImage(0);

  hearts.forEach((heart) => {
    heart.classList.remove("hideHeart");
  });

  await getWordAndDefinition();
  getWordDisplayTemplate();

  timeCounter = setInterval(countTime, 1000);

  letterButtons.forEach((letterButton) => {
    letterButton.disabled = false;
    letterButton.addEventListener("click", getVirtualKeyboardLetter);
  });
  window.addEventListener("keydown", getPhysicKeyboardLetter);
}

// Get Functions
const getWordAndDefinition = async () => {
  let wordDefinition = false;
  while (
    !wordDefinition ||
    wordDefinition.length > 120 ||
    secretWord.length > 10
  ) {
    secretWord = await getRandomWord();
    wordDefinition = await getHint();
  }
  hintText.innerText = `Hint : ${wordDefinition}`;
};

const getRandomWord = async () => {
  try {
    word = await fetch(wordUrl)
      .then((response) => response.json())
      .then((data) => data[0].toUpperCase());
  } catch {
    (err) => console.log("Error1##", err);
  }
  return word;
};

const getHint = async () => {
  try {
    return await fetch(`${dictionaryUrl}${secretWord}`)
      .then((response) => response.json())
      .then((data) => data[0].meanings[0].definitions[0].definition);
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

const getWordDisplayTemplate = () => {
  console.log(secretWord);
  display.innerHTML = secretWord
    .split("")
    .map(() => `<li class='secretLetter'>-</li>`)
    .join("");
};

const getCorrectGuess = (letter) => {
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      document.querySelectorAll(".secretLetter")[i].innerText = letter;
      correctLetters.push(letter);
      points++;
    }
  }
};

const getWrongGuess = () => {
  tries++;
  hearts[6 - tries].classList.add("hideHeart");
  getHangmanImage(tries);
  points--;
};

const getHangmanImage = (number) => {
  hangmanImage.src = `images/hangman-${number}.svg`;
};

const getStarsNumber = () => {
  if (starsNumber < Math.floor(points / 20) && starsNumber < 5) {
    starsNumber++;
    console.log(starsNumber);
    starText.innerText += "⭐";
  } else if (starsNumber > Math.floor(points / 20) && starsNumber > 0) {
    starsNumber--;
    starText.innerText = starText.innerText.slice(1);
  }
};

const getVirtualKeyboardLetter = (e) => {
  e.target.disabled = true;
  game(e.target.innerText);
};

const getPhysicKeyboardLetter = (e) => {
  const upperCaseLetter = e.key.toUpperCase();
  const letterCharCode = upperCaseLetter.charCodeAt(0);
  if (
    letterCharCode >= 65 &&
    letterCharCode <= 90 &&
    !disabledLetters.includes(upperCaseLetter)
  ) {
    letterButtons[letterCharCode - 65].disabled = true;
    game(upperCaseLetter);
  }
};

const game = (letter) => {
  disabledLetters.push(letter);
  secretWord.includes(letter) ? getCorrectGuess(letter) : getWrongGuess();
  if (secretWord.length === correctLetters.length) checkWin(true);
  if (tries === totalLives) checkWin(false);

  points = points > 0 ? points : 0;
  pointsText.innerText = points;

  getStarsNumber();
};

const checkWin = (boolean) => {
  letterButtons.forEach((letterButton) => {
    letterButton.removeEventListener("click", getVirtualKeyboardLetter);
  });
  removeEventListener("keydown", getPhysicKeyboardLetter);
  setTimeout(() => win(boolean), 1000);
};

const win = (boolean) => {
  points = boolean ? points + 5 : points - 5;
  points = points > 0 ? points : 0;
  pointsText.innerText = points;
  getStarsNumber();

  document.querySelector(".modalWindow").classList.remove("hidden");
  modalCover.classList.remove("hidden");
  modalCorrectWord.innerText = secretWord.toLowerCase();
  modalImage.src = boolean
    ? "images/hangman-win.gif"
    : "images/hangman-gameover.gif";
  modalText.innerHTML = boolean ? "You won" : "You Lost";
  modalCorrectWord.style.color = boolean ? "green" : "red";
  clearTimeout(timeCounter);
};

// Set the timer
function countTime() {
  time++;

  if (time % 6 === 0) {
    timer.style.height = `${time * (100 / 60)}%`;
  }
  if (time === 60) {
    win(false);
  }
}

// Event Listeners

modalButton.addEventListener("click", () => {
  document.querySelector(".modalWindow").classList.add("hidden");
  modalCover.classList.add("hidden");
  initiateGame();
});

// Calling the beginning of the game

initiateGame();
