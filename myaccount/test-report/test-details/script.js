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

let currentUserId = null;
let currentUserRole = null;

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.email;
      currentUserRole = await getUserRole(currentUserId);
      await loadAssessmentDetails();
    } else {
      showError("Please log in to view assessment details", "Authentication required");
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
      return userData.role || 'user';
    }
    
    return 'user';
  } catch (error) {
    console.error("Error fetching user role:", error);
    return 'user';
  }
}

// Secure access control
function validateAccess(requestedEmail) {
  // If no email parameter is provided, use current user's email
  if (!requestedEmail) {
    return { isValid: true, targetEmail: currentUserId };
  }

  // If user is recruiter or master_admin, allow access to any email
  if (currentUserRole === 'recruiter' || currentUserRole === 'master_admin') {
    return { isValid: true, targetEmail: requestedEmail };
  }

  // For regular users, force override to their own email
  if (requestedEmail !== currentUserId) {
    console.warn("Access attempt to unauthorized email. Redirecting to user's own data.");
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

    const testCode = getUrlParameter('test_code');
    const emailParam = getUrlParameter('email');

    if (!testCode) {
      showError("Test code is required to view assessment details", "Missing Test Code");
      return;
    }

    // Validate access and get target email
    const accessValidation = validateAccess(emailParam);
    if (!accessValidation.isValid) {
      showError("You don't have permission to view this assessment", "Access Denied");
      return;
    }

    const targetEmail = accessValidation.targetEmail;

    // Fetch user assessment results
    const resultsRef = doc(db, "user_assessment_results", targetEmail);
    const resultsDoc = await getDoc(resultsRef);

    if (!resultsDoc.exists()) {
      showError("No assessment results found for this user", "No Data Found");
      return;
    }

    const resultsData = resultsDoc.data();
    const testResult = resultsData.results?.find(result => result.quizCode === testCode);

    if (!testResult) {
      showError("Assessment not found", "Test Not Found");
      return;
    }

    // Fetch questions and answers for the specific test
    const questionsData = await fetchTestQuestions(testCode);

    // Display the assessment details
    displayAssessmentDetails(testResult, questionsData, targetEmail);
    showAssessmentDetails();

  } catch (error) {
    console.error("Error loading assessment details:", error);
    showError("Failed to load assessment details. Please try again later.", "Loading Error");
  }
}

// Fetch test questions from the quiz collection
async function fetchTestQuestions(testCode) {
  try {
    // Try to find the quiz document
    const quizRef = doc(db, "quiz", testCode);
    const quizDoc = await getDoc(quizRef);

    if (quizDoc.exists()) {
      return quizDoc.data();
    }

    // If not found by exact match, try to search in the collection
    const quizQuery = query(collection(db, "quiz"), where("code", "==", testCode));
    const querySnapshot = await getDocs(quizQuery);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }

    // Return null if no questions found
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
  document.getElementById("test-code").textContent = testResult.quizCode || "N/A";
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

  document.getElementById("total-score").textContent = `${userScore}/${totalQuestions}`;
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

  if (!questionsData || !questionsData.questions || questionsData.questions.length === 0) {
    questionsContainer.innerHTML = `
      <div class="no-questions">
        <p>No questions data available for this assessment.</p>
      </div>
    `;
    return;
  }

  const questions = questionsData.questions;
  const userAnswers = testResult.answers || {};

  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    const userAnswer = userAnswers[questionNumber];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    const questionElement = document.createElement("div");
    questionElement.className = "question-item";

    questionElement.innerHTML = `
      <div class="question-header">
        <span class="question-number">Question ${questionNumber}</span>
        <p class="question-text">${question.question}</p>
      </div>
      <div class="question-body">
        <div class="answer-section">
          <span class="answer-label">Available Options:</span>
          <div class="answer-options">
            ${question.options.map((option, optionIndex) => {
              const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
              let optionClass = "answer-option";
              
              if (userAnswer === optionLetter) {
                optionClass += " user-answer";
              }
              if (correctAnswer === optionLetter) {
                optionClass += " correct-answer";
              }
              if (userAnswer === optionLetter && !isCorrect) {
                optionClass += " incorrect-answer";
              }
              
              return `<div class="${optionClass}">${optionLetter}. ${option}</div>`;
            }).join("")}
          </div>
        </div>
        
        <div class="answer-status ${isCorrect ? 'correct' : 'incorrect'}">
          <span class="status-icon">${isCorrect ? '✓' : '✗'}</span>
          <span>
            ${isCorrect ? 'Correct Answer' : 'Incorrect Answer'} - 
            Your answer: ${userAnswer || 'Not answered'} | 
            Correct answer: ${correctAnswer}
          </span>
        </div>
      </div>
    `;

    questionsContainer.appendChild(questionElement);
  });
}

// Debug function for development
function debugAssessmentData() {
  console.log("Current User ID:", currentUserId);
  console.log("Current User Role:", currentUserRole);
  console.log("Test Code:", getUrlParameter('test_code'));
  console.log("Email Parameter:", getUrlParameter('email'));
}

// Call debug function in development
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  setTimeout(debugAssessmentData, 1000);
}
