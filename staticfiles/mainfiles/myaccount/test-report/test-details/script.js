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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Timeout wrapper for Firestore operations
function withTimeout(promise, timeoutMs = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    ),
  ]);
}

let currentUserId = null;
let currentUserRole = null;

document.addEventListener("DOMContentLoaded", () => {
  // Show loading state immediately
  showLoading();
  // Check authentication state first, then validate parameters
  onAuthStateChanged(auth, async (user) => {
    console.log(
      "Auth state changed:",
      user ? "User logged in" : "User not logged in"
    );

    if (user) {
      console.log("User authenticated:", user.email);
      currentUserId = user.email;

      try {
        currentUserRole = await getUserRole(currentUserId);
        console.log("User role:", currentUserRole);

        // Now that we're authenticated, check URL parameters
        const testCode = getUrlParameter("test_code");
        const emailParam = getUrlParameter("email");

        console.log(
          "Page loaded - Test Code:",
          testCode,
          "Email Param:",
          emailParam
        );

        if (!testCode) {
          showError(
            "Test code is required to view assessment details. Please ensure you're accessing this page from a valid assessment report link.",
            "Missing Test Code"
          );
          return;
        }

        await loadAssessmentDetails();
      } catch (error) {
        console.error("Error during authentication setup:", error);
        showError(
          "Failed to initialize user session. Please try refreshing the page.",
          "Initialization Error"
        );
      }
    } else {
      console.log("User not authenticated");
      showError(
        "Please log in to view assessment details. You will be redirected to the login page shortly.",
        "Authentication Required"
      );
      setTimeout(() => {
        window.location.href = "/login/";
      }, 3000);
    }
  });
});

// Get URL parameters
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Get user role for access control
async function getUserRole(userEmail) {
  try {
    const userProfileRef = doc(db, "user_profile", userEmail);
    const userProfileDoc = await getDoc(userProfileRef);

    if (userProfileDoc.exists()) {
      const userData = userProfileDoc.data();
      return userData.role || "user";
    }

    return "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user";
  }
}

// Secure access control
function validateAccess(requestedEmail) {
  // If no email parameter is provided, use current user's email
  if (!requestedEmail) {
    return { isValid: true, targetEmail: currentUserId };
  }

  // If user is recruiter or master_admin, allow access to any email
  if (currentUserRole === "recruiter" || currentUserRole === "master_admin") {
    return { isValid: true, targetEmail: requestedEmail };
  }

  // For regular users, force override to their own email
  if (requestedEmail !== currentUserId) {
    console.warn(
      "Access attempt to unauthorized email. Redirecting to user's own data."
    );
    return { isValid: true, targetEmail: currentUserId };
  }

  return { isValid: true, targetEmail: currentUserId };
}

// Show loading state
function showLoading() {
  document.getElementById("loading-state").style.display = "block";
  document.getElementById("error-state").style.display = "none";
  document.getElementById("assessment-details").style.display = "none";
}

// Show error state
function showError(message, title = "Error") {
  document.getElementById("loading-state").style.display = "none";
  document.getElementById("error-state").style.display = "block";
  document.getElementById("assessment-details").style.display = "none";

  document.querySelector("#error-state h2").textContent = title;
  document.getElementById("error-message").textContent = message;
}

// Show assessment details
function showAssessmentDetails() {
  document.getElementById("loading-state").style.display = "none";
  document.getElementById("error-state").style.display = "none";
  document.getElementById("assessment-details").style.display = "block";
  document.getElementById("assessment-details").classList.add("fade-in");
}

// Load assessment details
async function loadAssessmentDetails() {
  try {
    showLoading();

    const testCode = getUrlParameter("test_code");
    const emailParam = getUrlParameter("email");

    // Debug logging
    console.log("URL Search Params:", window.location.search);
    console.log("Test Code from URL:", testCode);
    console.log("Email from URL:", emailParam);
    console.log("Current User ID:", currentUserId);
    console.log("Current User Role:", currentUserRole); // Validate test code parameter
    if (
      !testCode ||
      testCode.trim() === "" ||
      testCode === "undefined" ||
      testCode === "null"
    ) {
      console.error("Missing or invalid test_code parameter:", testCode);
      showError(
        "Test code is required to view assessment details. Please ensure you're accessing this page from a valid assessment report link.",
        "Missing Test Code"
      );
      return;
    }

    // Validate access and get target email
    const accessValidation = validateAccess(emailParam);
    if (!accessValidation.isValid) {
      showError(
        "You don't have permission to view this assessment",
        "Access Denied"
      );
      return;
    }

    const targetEmail = accessValidation.targetEmail; // Fetch user assessment results
    const resultsRef = doc(db, "user_assessment_results", targetEmail);
    const resultsDoc = await withTimeout(getDoc(resultsRef), 8000);

    if (!resultsDoc.exists()) {
      showError("No assessment results found for this user", "No Data Found");
      return;
    }

    const resultsData = resultsDoc.data();
    const testResult = resultsData.results?.find(
      (result) => result.quizCode === testCode
    );

    if (!testResult) {
      showError("Assessment not found", "Test Not Found");
      return;
    }    // Fetch questions and answers for the specific test
    console.log("Fetching questions for test code:", testCode);
    const questionsData = await fetchTestQuestions(testCode);
    console.log("Retrieved questions data:", questionsData);

    if (!questionsData) {
      console.warn("No questions data found for test code:", testCode);
    }

    // Display the assessment details
    displayAssessmentDetails(testResult, questionsData, targetEmail);
    showAssessmentDetails();
  } catch (error) {
    console.error("Error loading assessment details:", error);
    if (error.message === "Operation timed out") {
      showError(
        "The request is taking longer than expected. Please check your internet connection and try again.",
        "Connection Timeout"
      );
    } else {
      showError(
        "Failed to load assessment details. Please try again later.",
        "Loading Error"
      );
    }
  }
}

// Fetch test questions from the quiz collection
async function fetchTestQuestions(testCode) {
  try {
    console.log("Attempting to fetch questions for test code:", testCode);
    
    // Try to find the quiz document by exact document ID
    const quizRef = doc(db, "quiz", testCode);
    const quizDoc = await withTimeout(getDoc(quizRef), 8000);

    if (quizDoc.exists()) {
      console.log("Found quiz by document ID:", testCode);
      const data = quizDoc.data();
      console.log("Quiz data structure:", {
        hasQuestions: !!data.questions,
        questionCount: data.questions?.length || 0,
        title: data.title,
        code: data.code
      });
      return data;
    }

    console.log("Quiz not found by document ID, trying query by code field...");
    
    // If not found by exact match, try to search in the collection
    const quizQuery = query(
      collection(db, "quiz"),
      where("code", "==", testCode)
    );
    const querySnapshot = await withTimeout(getDocs(quizQuery), 8000);

    if (!querySnapshot.empty) {
      console.log("Found quiz by code field:", testCode);
      const data = querySnapshot.docs[0].data();
      console.log("Quiz data structure:", {
        hasQuestions: !!data.questions,
        questionCount: data.questions?.length || 0,
        title: data.title,
        code: data.code
      });
      return data;
    }

    console.log("No quiz found for test code:", testCode);
    return null;
  } catch (error) {
    console.error("Error fetching test questions:", error);
    return null;
  }
}

// Display assessment details
function displayAssessmentDetails(testResult, questionsData, candidateEmail) {
  // Set basic information
  document.getElementById("assessment-title").textContent =
    questionsData?.title || testResult.quizCode || "Assessment Details";
  document.getElementById("test-code").textContent =
    testResult.quizCode || "N/A";
  document.getElementById("candidate-email").textContent = candidateEmail;

  // Format and display timestamp
  if (testResult.timestamp && testResult.timestamp.seconds) {
    const date = new Date(testResult.timestamp.seconds * 1000);
    document.getElementById("test-date").textContent = date.toLocaleString();
  } else {
    document.getElementById("test-date").textContent = "N/A";
  }

  // Display duration (if available)
  document.getElementById("test-duration").textContent =
    testResult.duration || questionsData?.duration || "N/A";

  // Display summary statistics
  const totalQuestions = questionsData?.questions?.length || 0;
  const userScore = testResult.score || 0;
  const percentage = testResult.percentage || 0;
  const correctAnswers = userScore;
  const incorrectAnswers = totalQuestions - correctAnswers;

  document.getElementById(
    "total-score"
  ).textContent = `${userScore}/${totalQuestions}`;
  document.getElementById("total-percentage").textContent = `${percentage}%`;
  document.getElementById("total-questions").textContent = totalQuestions;
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("incorrect-answers").textContent = incorrectAnswers;

  // Set performance badge
  const performanceBadge = document.getElementById("performance-badge");
  if (percentage >= 80) {
    performanceBadge.className = "performance-badge excellent";
    performanceBadge.textContent = "Excellent Performance";
  } else if (percentage >= 60) {
    performanceBadge.className = "performance-badge good";
    performanceBadge.textContent = "Good Performance";
  } else if (percentage >= 40) {
    performanceBadge.className = "performance-badge average";
    performanceBadge.textContent = "Average Performance";
  } else {
    performanceBadge.className = "performance-badge needs-improvement";
    performanceBadge.textContent = "Needs Improvement";
  }

  // Display questions and answers
  displayQuestionsAndAnswers(questionsData, testResult);
}

// Display questions and answers
function displayQuestionsAndAnswers(questionsData, testResult) {
  const questionsContainer = document.getElementById("questions-container");
  questionsContainer.innerHTML = "";

  console.log("Displaying questions - Questions Data:", questionsData);
  console.log("Test Result:", testResult);

  if (
    !questionsData ||
    !questionsData.questions ||
    questionsData.questions.length === 0
  ) {
    console.log("No questions data available");
    questionsContainer.innerHTML = `
      <div class="no-questions">
        <p>No questions data available for this assessment.</p>
        <p><strong>Debug Info:</strong></p>
        <ul>
          <li>Questions Data: ${questionsData ? 'Available' : 'Missing'}</li>
          <li>Questions Array: ${questionsData?.questions ? questionsData.questions.length + ' questions' : 'Missing'}</li>
          <li>Test Code: ${testResult?.quizCode || 'N/A'}</li>
        </ul>
      </div>
    `;
    return;
  }

  const questions = questionsData.questions;
  const userAnswers = testResult.answers || {};

  console.log("Questions to display:", questions.length);
  console.log("User answers:", userAnswers);

  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    const userAnswer = userAnswers[questionNumber] || userAnswers[index] || userAnswers[index + 1];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    console.log(`Question ${questionNumber}:`, {
      question: question.question,
      userAnswer,
      correctAnswer,
      isCorrect,
      options: question.options
    });

    const questionElement = document.createElement("div");
    questionElement.className = `question-item ${isCorrect ? 'correct-question' : 'incorrect-question'}`;

    // Build options HTML
    let optionsHTML = '';
    if (question.options && question.options.length > 0) {
      optionsHTML = question.options.map((option, optionIndex) => {
        const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
        let optionClass = "answer-option";
        
        // Highlight correct answer
        if (correctAnswer === optionLetter) {
          optionClass += " correct-answer";
        }
        
        // Highlight user's answer
        if (userAnswer === optionLetter) {
          optionClass += isCorrect ? " user-correct" : " user-incorrect";
        }

        const correctIndicator = correctAnswer === optionLetter ? '<span class="correct-indicator">✓ Correct</span>' : '';
        const userIndicator = userAnswer === optionLetter ? '<span class="user-indicator">← Your Answer</span>' : '';

        return `<div class="${optionClass}">
          <span class="option-letter">${optionLetter}</span>
          <span class="option-text">${option}</span>
          ${correctIndicator}
          ${userIndicator}
        </div>`;
      }).join("");
    } else {
      optionsHTML = '<p>No options available</p>';
    }

    questionElement.innerHTML = `
      <div class="question-header">
        <div class="question-number-badge ${isCorrect ? 'correct' : 'incorrect'}">
          <span class="question-number">Q${questionNumber}</span>
          <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
        </div>
        <p class="question-text">${question.question || 'Question text not available'}</p>
      </div>
      <div class="question-body">
        <div class="answer-section">
          <span class="answer-label">Options:</span>
          <div class="answer-options">
            ${optionsHTML}
          </div>
        </div>
        
        <div class="answer-summary">
          <div class="answer-status ${isCorrect ? "correct" : "incorrect"}">
            <span class="status-icon">${isCorrect ? "✅" : "❌"}</span>
            <div class="status-text">
              <strong>${isCorrect ? "Correct!" : "Incorrect"}</strong>
              <div class="answer-details">
                <span>Your answer: <strong>${userAnswer || "Not answered"}</strong></span>
                <span>Correct answer: <strong>${correctAnswer}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    questionsContainer.appendChild(questionElement);
  });

  // Add summary at the end
  const summary = document.createElement("div");
  summary.className = "questions-summary";
  const correctCount = questions.filter((_, index) => {
    const questionNumber = index + 1;
    const userAnswer = userAnswers[questionNumber] || userAnswers[index] || userAnswers[index + 1];
    return userAnswer === questions[index].correctAnswer;
  }).length;
  
  summary.innerHTML = `
    <h3>Summary</h3>
    <div class="summary-stats">
      <div class="stat-item correct">
        <span class="stat-number">${correctCount}</span>
        <span class="stat-label">Correct</span>
      </div>
      <div class="stat-item incorrect">
        <span class="stat-number">${questions.length - correctCount}</span>
        <span class="stat-label">Incorrect</span>
      </div>
      <div class="stat-item total">
        <span class="stat-number">${questions.length}</span>
        <span class="stat-label">Total</span>
      </div>
    </div>
  `;
    questionsContainer.appendChild(summary);
}

// Debug function for development
function debugAssessmentData() {
  console.log("Current User ID:", currentUserId);
  console.log("Current User Role:", currentUserRole);
  console.log("Test Code:", getUrlParameter("test_code"));
  console.log("Email Parameter:", getUrlParameter("email"));
}

// Call debug function in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  setTimeout(debugAssessmentData, 1000);
}
