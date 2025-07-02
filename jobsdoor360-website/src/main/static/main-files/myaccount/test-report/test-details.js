import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

// Firebase configuration
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function updateDebug(message) {
  const debugElement = document.getElementById("debug-text");
  if (debugElement) {
    const timestamp = new Date().toLocaleTimeString();
    debugElement.innerHTML += `<br>[${timestamp}] ${message}`;
    console.log(message);
  }
}

function showError(message) {
  console.error("Error:", message);
  updateDebug(`ERROR: ${message}`);

  document.getElementById("loading").style.display = "none";
  const errorElement = document.getElementById("error");
  const errorMessageElement = document.getElementById("error-message");

  errorMessageElement.textContent = message;
  errorElement.style.display = "block";
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  if (!seconds) return "N/A";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getScoreClass(score) {
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-average";
  return "score-poor";
}

function renderOption(option, isUserAnswer, isCorrectAnswer) {
  let classes = "option";
  if (isUserAnswer && isCorrectAnswer) {
    classes += " correct-answer";
  } else if (isUserAnswer && !isCorrectAnswer) {
    classes += " user-wrong";
  } else if (isCorrectAnswer) {
    classes += " correct-answer";
  }

  return `
    <div class="${classes}">
      ${option}
    </div>
  `;
}

function renderQuestions(questions, userAnswers) {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  if (!questions || questions.length === 0) {
    container.innerHTML = "<p>No questions found for this test.</p>";
    return;
  }

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    const correctAnswerText = question.options[question.correctAnswer];
    const userAnswerText =
      userAnswer !== undefined ? question.options[userAnswer] : "Not answered";

    const optionsHtml = question.options
      .map((option, i) => {
        const isUserSelected = i === userAnswer;
        const isCorrect = i === question.correctAnswer;
        return renderOption(option, isUserSelected, isCorrect);
      })
      .join("");

    const cardHTML = `
      <div class="question-card fade-in ${isCorrect ? "correct" : "incorrect"}">
        <div class="question-header">
          <div class="question-number">${index + 1}</div>
          <div class="question-text">${question.question}</div>
          <div class="status-icon ${
            isCorrect ? "status-correct" : "status-incorrect"
          }">
            ${isCorrect ? "✓" : "✗"}
          </div>
        </div>
        <div class="options">
          ${optionsHtml}
        </div>
        <div class="explanation">
          <strong>Explanation:</strong> ${
            question.explanation || "No explanation available."
          }
        </div>
      </div>
    `;

    container.innerHTML += cardHTML;
  });

  document.getElementById("questions-title").style.display = "flex";
}

function renderTestInfo(testData) {
  // Show test summary
  document.getElementById("test-name").textContent =
    testData.testName || "Unknown Test";
  document.getElementById("test-date").textContent = formatDate(
    testData.timestamp
  );
  document.getElementById("total-questions").textContent = testData.questions
    ? testData.questions.length
    : 0;
  document.getElementById("time-spent").textContent = formatDuration(
    testData.timeSpent
  );

  const correctCount = testData.score
    ? Math.round((testData.score / 100) * testData.questions.length)
    : 0;
  document.getElementById("correct-answers").textContent = `${correctCount} / ${
    testData.questions ? testData.questions.length : 0
  }`;

  const scoreBadge = document.getElementById("score-badge");
  scoreBadge.textContent = `${testData.score || 0}%`;
  scoreBadge.className = `score-badge ${getScoreClass(testData.score || 0)}`;

  document.getElementById("test-info").style.display = "block";
}

async function loadTestDetails(testId) {
  // Show debug info only in development/localhost
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    document.getElementById("debug-info").style.display = "block";
  }

  updateDebug(`Loading test details for test ID: ${testId}`);

  try {
    // Get test document from Firestore
    const testDocRef = doc(db, "test_results", testId);
    const testDoc = await getDoc(testDocRef);

    if (!testDoc.exists()) {
      showError("Test not found.");
      return;
    }

    const testData = testDoc.data();
    updateDebug(`Test data loaded: ${testData.testName}`);

    // Get test questions
    let questions = testData.questions || [];

    // If questions are stored as references, fetch them
    if (testData.testType && !questions.length) {
      updateDebug(`Fetching questions for test type: ${testData.testType}`);
      const questionQuery = query(
        collection(db, "questions"),
        where("testType", "==", testData.testType)
      );

      const questionSnapshot = await getDocs(questionQuery);
      questions = [];
      questionSnapshot.forEach((doc) => {
        questions.push(doc.data());
      });

      updateDebug(
        `Loaded ${questions.length} questions for test type ${testData.testType}`
      );
    }

    // Hide loading indicator
    document.getElementById("loading").style.display = "none";

    // Render test info and questions
    renderTestInfo(testData);
    renderQuestions(questions, testData.userAnswers || []);
  } catch (error) {
    console.error("Error loading test details:", error);
    showError(`Failed to load test details: ${error.message}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateDebug(`User authenticated: ${user.email}`);

      // Get test ID from URL
      const testId = getUrlParameter("id");

      if (testId) {
        loadTestDetails(testId);
      } else {
        showError("No test ID provided.");
      }
    } else {
      // User not authenticated, redirect to login
      updateDebug("User not authenticated, redirecting to login...");
      window.location.href = "/login/";
    }
  });
});
