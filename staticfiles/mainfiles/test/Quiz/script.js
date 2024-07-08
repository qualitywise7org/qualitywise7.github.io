import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
  authDomain: "jobsdoor360-39b87.firebaseapp.com",
  databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
  projectId: "jobsdoor360-39b87",
  storageBucket: "jobsdoor360-39b87.appspot.com",
  messagingSenderId: "326416618185",
  appId: "1:326416618185:web:de19e90fe4f06006ef3318",
  measurementId: "G-60RHEMJNM6",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Data that should be store in firebase....
const subjects = {
  htmlcssjs: {
    id: "html, css & js",
    title: "HTML,CSS & JAVASCRIPT",
    questions: [
      {
        question: "What does HTML stand for?",
        answers: [
          "Hyper Text Markup Language",
          "Hyperlinks and Text Markup Language",
          "Home Tool Markup Language",
          "Hyper Text Markup Leveler",
        ],
        correctAnswer: 1,
      },
      {
        question:
          "What is the correct HTML element for inserting a line break?",
        answers: ["<br>", "<lb>", "<break>", "<linebreak>"],
        correctAnswer: 1,
      },
      {
        question:
          "What is the correct HTML element for inserting a line break?",
        answers: ["<br>", "<lb>", "<break>", "<linebreak>"],
        correctAnswer: 1,
      },
      {
        question:
          "What is the correct HTML element for inserting a line break?",
        answers: ["<br>", "<lb>", "<break>", "<linebreak>"],
        correctAnswer: 1,
      },
      {
        question:
          "What is the correct HTML element for inserting a line break?",
        answers: ["<br>", "<lb>", "<break>", "<linebreak>"],
        correctAnswer: 1,
      },
      {
        question: "What does CSS stand for?",
        answers: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Colorful Style Sheets",
        ],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["<script>", "<javascript>", "<js>", "<scripting>"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more CSS questions as needed
      // Add more HTML questions as needed
    ],
  },
  python: {

    id: "python",
    title: "Python",
    questions: [
      {
        question: "What does CSS stand for?",
        answers: [
          "Cascading Style Sheets",
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Colorful Style Sheets",
        ],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      {
        question:
          "Which CSS property is used to change the text color of an element?",
        answers: ["color", "text-color", "font-color", "fgcolor"],
        correctAnswer: 1,
      },
      // Add more CSS questions as needed
    ],
  },
  nodejs: {

    id: "node.js",
    title: "Node.Js",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  react: {
    id: "react.js",
    title: "React.Js",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  mongodb: {

    id: "mongodb",
    title: "MongoDB",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  mysql: {

    id: "mysql",
    title: "MySQL",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  firebase: {
    id: "firebase",
    title: "Firebase",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  devops: {

    id: "devops",
    title: "DevOps",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  pcm: {

    id: "physics, che. & maths",
    title: "Physics, Chemistry & Maths",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  reasoning: {

    id: "reasoning",
    title: "Reasoning",

    questions: [
      {
        question: "Inside which HTML element do we put the JavaScript?",
        answers: ["script", "javascript", "js", "scripting"],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      {
        question: "Where is the correct place to insert a JavaScript?",
        answers: [
          "The <head> section",
          "The <body> section",
          "Both the <head> section and the <body> section are correct",
          "Neither the <head> section nor the <body> section",
        ],
        correctAnswer: 1,
      },
      // Add more JavaScript questions as needed
    ],
  },
  // Add more subjects as needed
};

let currentSubject = null;
let currentQuestion = 0;
let score = 0;
let timeLimit = 30 * 60; // 30 minutes in seconds
let timerInterval = null;

const questionContainer = document.getElementById("question-container");
const feedbackContainer = document.getElementById("feedback-container");
const scoreDisplay = document.getElementById("score");
const percentageDisplay = document.getElementById("percentage");
const resultContainer = document.getElementById("result-container");
const nextButton = document.getElementById("next-btn");
const previousButton = document.getElementById("pre-btn");
const homeButton = document.getElementById("home-btn"); // New: Grab the home button element
const timerDisplay = document.getElementById("timer");

function startQuiz(subject) {
  currentSubject = subjects[subject];
  currentQuestion = 0;
  score = 0;
  timeLimit = 30 * 60; // Reset time limit to 30 minutes
  startTimer(); // Start the timer when quiz starts
  showQuiz();

  // Update the URL with the subject
  const url = new URL(window.location);
  url.searchParams.set("subject", subject);
  window.history.pushState({}, "", url);
}
document.addEventListener("DOMContentLoaded", function () {
  const startButtons = document.querySelectorAll(".btn-start"); // Select by ID
  startButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Get the subject key from the data-subject attribute
      const subject = button.getAttribute("data-subject");
      startQuiz(subject);
    });
  });
}); // Replace "htmlcssjs" with the actual subject key

// Read the subject from the URL
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get("subject");
if (subject) {
  startQuiz(subject);
}

//Function to show the quiz when startQuiz is called

function showQuiz() {
  document.getElementById("quiz-container").style.display = "block";
  document.querySelector(".assessment-grid").style.display = "none";
  nextButton.style.display = "block";
  resultContainer.style.display = "none";
  homeButton.style.display = "none";
  // homeButton.style.display = "block"; // Display the home button

  loadQuestion();
}

//Function for uploading questions on showQuiz page

function loadQuestion() {
  const question = currentSubject.questions[currentQuestion];
  questionContainer.innerHTML = `
      <h2>${currentSubject.title} - Question ${currentQuestion + 1}</h2>
      <p>${question.question}</p>
      <ul>
          ${question.answers
            .map(
              (answer, index) => `
              <li>
                  <label>
                      <input type="radio" name="answer" value="${index}">
                      ${answer}
                  </label>
              </li>
          `
            )
            .join("")}
      </ul>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  if (previousButton) {
    previousButton.addEventListener("click", function () {
      previousQuestion();
    });
  } else {
    console.error("Element with ID 'pre-btn' not found.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById("next-btn");
  if (nextButton) {
    nextButton.addEventListener("click", nextQuestion);
  }
});

//Function to get in the new questions page
function nextQuestion() {
  // Check if a radio button is selected

  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (!selectedAnswer) {
    alert("Please select an answer.");
    return;
  }

  // Get the index of the selected answer
  const answerIndex = parseInt(selectedAnswer.value, 10);

  // Check if the answer is correct and update score

  if (answerIndex === currentSubject.questions[currentQuestion].correctAnswer) {
    score++;
  }

  // Move to the next question
  currentQuestion++;

  // Check if there are more questions to load
  if (currentQuestion < currentSubject.questions.length) {
    loadQuestion(); // Load the next question
  } else {
    showResult(); // Show the quiz result if no more questions
  }
}


//Function for going to the previous question page
function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  } else {
    alert("You are at the first question.");
  }
}

//Function for Showing the result
function showResult() {
  questionContainer.style.display = "none";
  feedbackContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";
  homeButton.style.display = "none"; // Hide the home button on the result screen

  stopTimer(); // Stop the timer when quiz ends

  const percentage = Math.round(
    (score / currentSubject.questions.length) * 100
  );
  scoreDisplay.textContent = score;
  percentageDisplay.textContent = percentage;

  previousButton.style.display = "none";

  // Creating a link for going into home page
  homeButton.style.display = "block";
}

// Function to start the timer
function startTimer() {
  timerInterval = setInterval(() => {
    timeLimit--;
    updateTimerDisplay();
    if (timeLimit <= 0) {
      stopTimer();
      alert("Time's up! Quiz session ended.");
      showResult();
    }
  }, 1000); // Update timer every second
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}


// Function to update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(timeLimit / 60);
  const seconds = timeLimit % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Home
document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById("home-btn");
  if (nextButton) {
    nextButton.addEventListener("click", goHome);
  }
});

// Function to go back to the home page
function goHome() {
  document.getElementById("quiz-container").style.display = "none";
  document.querySelector(".assessment-grid").style.display = "grid";
  resultContainer.style.display = "none";
  stopTimer(); // Stop the timer when going back to the home page
}


//Function for adding assessment data to the firebase
async function addQuizzesToFirestore() {
  try {
    // Iterate over the quizzes (values) in the subjects object
    for (let quiz of Object.values(subjects)) {
      // Check if the quiz is defined and has necessary properties
      if (quiz && quiz.id) {
        // Construct the document reference with quiz.html.id
        const docRef = doc(db, "assessment", quiz.id);

        // Set the document with title and questions from the quiz
        await setDoc(docRef, {
          title: quiz.title,
          questions: quiz.questions,
        });

        // Log success message
        console.log(
          `Quiz with ID ${quiz.id} added to 'assessment' collection in Firestore.`
        );
      } else {
        // Throw an error if html.id is not defined for the quiz
        throw new Error(`HTML quiz ID is undefined for ${quiz}`);
      }
    }

    // Log success message after all documents are added
    console.log(
      "All quizzes added to 'assessment' collection in Firestore successfully!"
    );
  } catch (error) {
    // Log any errors that occur during the process

    console.error("Error adding quizzes to Firestore: ", error);
  }
}


// Call the function to add quizzes to Firestore
addQuizzesToFirestore();

