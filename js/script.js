// ========== URL API and Options ==========
const url =
  "https://random-word-by-api-ninjas.p.rapidapi.com/v1/randomword?type=noun";
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "ba36599aaemshbee5e6532b6a0c6p1cd69bjsndf3815f32a05",
    "X-RapidAPI-Host": "random-word-by-api-ninjas.p.rapidapi.com",
  },
};

// ========== DOM Variables ==========
const keyboard = document.querySelector(".keyboard");
const hintText = document.querySelector(".generatedHint");
const pointsText = document.querySelector(".points");
const hangmanImage = document.querySelector(".hangmanImage");
const display = document.querySelector(".word-display");
const timer = document.querySelector(".timerCover");
const starText = document.querySelector(".stars");

const modalImage = document.querySelector(".modalImage img");
const modalText = document.querySelector(".modalText h2");
const modalCorrectWord = document.querySelector(".modalText strong");
const modalCover = document.querySelector(".cover");
const modalButton = document.querySelector(".modalButton");

// ========== Aplication Variables ==========
let secretWord = "",
  disabledLetters,
  correctLetters,
  tries,
  time,
  points = 60,
  totalLives = 6,
  timeCounter;

// Create keyboard on screen
const generateKeyboard = () => {
  for (let i = 65; i < 91; i++) {
    const letter = String.fromCharCode(i);
    keyboard.innerHTML += `<button class='letter'>${letter}</button>`;
  }
};
generateKeyboard();

// initiate Game
async function initiateGame() {
  correctLetters = [];
  disabledLetters = [];
  tries = 0;
  time = 0;
  timer.style.height = "0";
  getHangmanImage(0);
  letterButtons.forEach((letterButton) => {
    letterButton.disabled = false;
  });
  secretWord = await getRandomWord();
  hintText.innerText = await getHint();
  timeCounter = setInterval(countTime, 1000);
  getWordDisplayTemplate();
}

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

// const getRandomWord = () => {
// const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
// secretWord = word.toUpperCase();
// hintText.innerText = hint;
// };

async function getRandomWord() {
  try {
    word = await fetch(url, options)
      .then((response) => response.json())
      .then((data) => data.word.toUpperCase());
  } catch {
    (err) => console.log("Error1##", err);
  }
  return word;
}

async function getHint() {
  try {
    return await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${secretWord}`
    )
      .then((response) => response.json())
      .then((data) => data[0].meanings[0].definitions[0].definition)
      .catch((err) => `You don't need a hint `);
  } catch (err) {
    console.log("Error", err);
  }
}

const getWordDisplayTemplate = () => {
  console.log(secretWord);
  display.innerHTML = secretWord
    .split("")
    .map(() => `<li class='secretLetter'>-</li>`)
    .join("");
};

// Event Listeners
const letterButtons = document.querySelectorAll(".letter");
letterButtons.forEach((letterButton) => {
  letterButton.addEventListener("click", (e) => {
    letterButton.disabled = true;
    game(e.target.innerText);
  });
});

window.addEventListener("keydown", (e) => {
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
});

modalButton.addEventListener("click", () => {
  document.querySelector(".modalWindow").classList.add("hidden");
  modalCover.classList.add("hidden");
  initiateGame();
});

const game = (letter) => {
  console.log(secretWord);
  console.log(letter);
  disabledLetters.push(letter);
  secretWord.includes(letter) ? getCorrectGuess(letter) : getWrongGuess();
  if (secretWord.length === correctLetters.length)
    setTimeout(() => win(true), 1000);
  if (tries === totalLives) setTimeout(() => win(false), 1000);
  points = points > 0 ? points : 0;
  pointsText.innerText = points;

  let stars = Math.floor(points / 20);
  starText.innerText =
    stars >= 5
      ? "⭐⭐⭐⭐⭐"
      : stars === 4
      ? "⭐⭐⭐⭐"
      : stars === 3
      ? "⭐⭐⭐"
      : stars === 2
      ? "⭐⭐"
      : stars === 1
      ? "⭐"
      : "";
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
  // triesText.innerText = tries;
  getHangmanImage(tries);
  points--;
};

const getHangmanImage = (number) => {
  hangmanImage.src = `images/hangman-${number}.svg`;
};

const win = (boolean) => {
  points = boolean ? points + 5 : points - 5;
  points = points > 0 ? points : 0;
  pointsText.innerText = points;

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

initiateGame();
