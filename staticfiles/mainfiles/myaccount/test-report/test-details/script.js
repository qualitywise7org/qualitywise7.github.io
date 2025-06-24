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

// Basic DOM check for debugging
function checkDOMElements() {
  const requiredElements = [
    "loading-state",
    "error-state",
    "assessment-details",
    "questions-container",
    "assessment-title",
    "test-code",
    "candidate-email",
  ];

  const missing = [];
  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      missing.push(id);
    }
  });

  if (missing.length > 0) {
    console.error("❌ Missing DOM elements:", missing);
    return false;
  }

  console.log("✅ All required DOM elements found");
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if all required DOM elements exist
  if (!checkDOMElements()) {
    console.error("❌ Critical DOM elements missing - cannot proceed");
    return;
  }

  // Authentication flow
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.email;
      currentUserRole = await getUserRole(currentUserId);
      await loadAssessmentDetails();
    } else {
      showError(
        "Please log in to view assessment details",
        "Authentication required"
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
  console.log(
    "🎯 showAssessmentDetails called - making assessment details visible"
  );

  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const assessmentDetails = document.getElementById("assessment-details");

  if (loadingState) {
    loadingState.style.display = "none";
    console.log("✅ Hidden loading state");
  } else {
    console.error("❌ loading-state element not found");
  }

  if (errorState) {
    errorState.style.display = "none";
    console.log("✅ Hidden error state");
  } else {
    console.error("❌ error-state element not found");
  }

  if (assessmentDetails) {
    assessmentDetails.style.display = "block";
    assessmentDetails.classList.add("fade-in");
    console.log("✅ Showed assessment details with fade-in");
  } else {
    console.error("❌ assessment-details element not found");
  }
}

// Load assessment details
async function loadAssessmentDetails() {
  try {
    showLoading();

    const testCode = getUrlParameter("test_code");
    const emailParam = getUrlParameter("email");

    if (!testCode) {
      showError(
        "Test code is required to view assessment details",
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
    const targetEmail = accessValidation.targetEmail;
    console.log("� Loading assessment for:", { testCode, targetEmail });

    // Fetch user assessment results with multiple fallback methods
    const testResult = await fetchUserAssessmentResult(targetEmail, testCode);

    if (!testResult) {
      console.error("❌ No assessment results found for:", {
        targetEmail,
        testCode,
      });
      showError(
        `No assessment results found for test code: ${testCode}`,
        "Assessment Not Found"
      );
      return;
    }
    console.log("✅ Successfully found test result:", {
      targetEmail,
      testCode,
      testResult,
      answersCount: Object.keys(testResult.answers || {}).length,
    });

    // Fetch test questions from the quiz collection
    const questionsData = await fetchTestQuestions(testCode);

    if (!questionsData) {
      console.error("❌ No quiz questions found for test code:", testCode);
      showError(
        `Quiz questions not found for test code: ${testCode}`,
        "Questions Not Found"
      );
      return;
    }

    console.log("✅ Found quiz data:", questionsData);

    // Display the assessment details
    displayAssessmentDetails(testResult, questionsData, targetEmail);
    showAssessmentDetails();
  } catch (error) {
    console.error("Error loading assessment details:", error);
    showError(
      "Failed to load assessment details. Please try again later.",
      "Loading Error"
    );
  }
}

// Fetch test questions from the quiz collection
async function fetchTestQuestions(testCode) {
  console.log("🔎 Fetching test questions from Firebase for:", testCode);
  // Try multiple collection names in case the quiz data is stored differently
  const collectionNames = [
    "assessment",
    "assessments",
    "quiz",
    "quizzes",
    "questions",
    "tests",
  ];

  for (const collectionName of collectionNames) {
    try {
      console.log(`📋 Trying collection: ${collectionName}`);

      // Try to find the quiz document by direct reference
      const quizRef = doc(db, collectionName, testCode);
      const quizDoc = await getDoc(quizRef);

      if (quizDoc.exists()) {
        console.log(
          `✅ Found quiz document by direct reference in ${collectionName}:`,
          quizDoc.data()
        );
        return quizDoc.data();
      }

      // If not found by exact match, try to search in the collection
      const quizQuery = query(
        collection(db, collectionName),
        where("code", "==", testCode)
      );
      const querySnapshot = await getDocs(quizQuery);

      if (!querySnapshot.empty) {
        console.log(
          `✅ Found quiz document by query in ${collectionName}:`,
          querySnapshot.docs[0].data()
        );
        return querySnapshot.docs[0].data();
      }

      // Also try searching by testCode field
      const testCodeQuery = query(
        collection(db, collectionName),
        where("testCode", "==", testCode)
      );
      const testCodeSnapshot = await getDocs(testCodeQuery);

      if (!testCodeSnapshot.empty) {
        console.log(
          `✅ Found quiz document by testCode query in ${collectionName}:`,
          testCodeSnapshot.docs[0].data()
        );
        return testCodeSnapshot.docs[0].data();
      }
    } catch (error) {
      console.log(
        `❌ Error accessing collection ${collectionName}:`,
        error.message
      );
      // Continue to next collection if this one fails
      continue;
    }
  }
  console.log("⚠️ No quiz found in any Firebase collection");

  // Return null if no questions found in Firebase
  return null;
}

// Enhanced function to fetch user assessment result with multiple methods
async function fetchUserAssessmentResult(userEmail, testCode) {
  console.log("🔎 Fetching user assessment result for:", {
    userEmail,
    testCode,
  });

  try {
    // Method 1: Try direct document access using email as document ID
    console.log("📋 Method 1: Direct document access...");
    try {
      const directRef = doc(db, "user_assessment_results", userEmail);
      const directDoc = await getDoc(directRef);

      if (directDoc.exists()) {
        const data = directDoc.data();
        console.log("📄 Found document with direct access:", data);

        // Check if results is an array or object
        let results = [];
        if (Array.isArray(data.results)) {
          results = data.results;
        } else if (data.results && typeof data.results === "object") {
          // If results is an object, convert values to array
          results = Object.values(data.results);
        } else if (data[testCode]) {
          // Sometimes the test result is stored directly with testCode as key
          console.log(
            "✅ Found test result stored directly with testCode key:",
            data[testCode]
          );
          return data[testCode];
        }

        // Find matching test result by various code fields
        const testResult = results.find(
          (result) =>
            result.quizCode === testCode ||
            result.testCode === testCode ||
            result.code === testCode ||
            result.quiz_code === testCode
        );

        if (testResult) {
          console.log("✅ Found matching test result (Method 1):", testResult);
          return testResult;
        }
      }
    } catch (error) {
      console.log("Method 1 failed:", error);
    }

    // Method 2: Query by email field
    console.log("📋 Method 2: Querying by email field...");
    try {
      const emailQuery = query(
        collection(db, "user_assessment_results"),
        where("email", "==", userEmail)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        for (const doc of emailSnapshot.docs) {
          const data = doc.data();
          console.log("📄 Found document by email query:", data);

          let results = [];
          if (Array.isArray(data.results)) {
            results = data.results;
          } else if (data.results && typeof data.results === "object") {
            results = Object.values(data.results);
          }

          const testResult = results.find(
            (result) =>
              result.quizCode === testCode ||
              result.testCode === testCode ||
              result.code === testCode ||
              result.quiz_code === testCode
          );

          if (testResult) {
            console.log(
              "✅ Found matching test result (Method 2):",
              testResult
            );
            return testResult;
          }
        }
      }
    } catch (error) {
      console.log("Method 2 failed:", error);
    }

    // Method 3: Query by userEmail field
    console.log("📋 Method 3: Querying by userEmail field...");
    try {
      const userEmailQuery = query(
        collection(db, "user_assessment_results"),
        where("userEmail", "==", userEmail)
      );
      const userEmailSnapshot = await getDocs(userEmailQuery);

      if (!userEmailSnapshot.empty) {
        for (const doc of userEmailSnapshot.docs) {
          const data = doc.data();
          console.log("📄 Found document by userEmail query:", data);

          let results = [];
          if (Array.isArray(data.results)) {
            results = data.results;
          } else if (data.results && typeof data.results === "object") {
            results = Object.values(data.results);
          }

          const testResult = results.find(
            (result) =>
              result.quizCode === testCode ||
              result.testCode === testCode ||
              result.code === testCode ||
              result.quiz_code === testCode
          );

          if (testResult) {
            console.log(
              "✅ Found matching test result (Method 3):",
              testResult
            );
            return testResult;
          }
        }
      }
    } catch (error) {
      console.log("Method 3 failed:", error);
    }

    // Method 4: Search all documents (fallback)
    console.log("📋 Method 4: Searching all documents (fallback)...");
    try {
      const allResultsSnapshot = await getDocs(
        collection(db, "user_assessment_results")
      );

      for (const doc of allResultsSnapshot.docs) {
        const data = doc.data();

        // Check if this document belongs to our user
        const docEmail = data.email || data.userEmail || doc.id;
        if (docEmail !== userEmail) continue;

        console.log("📄 Checking document for user:", data);

        let results = [];
        if (Array.isArray(data.results)) {
          results = data.results;
        } else if (data.results && typeof data.results === "object") {
          results = Object.values(data.results);
        } else if (data[testCode]) {
          // Check if test result is stored directly with testCode as key
          console.log(
            "✅ Found test result in fallback search (direct key):",
            data[testCode]
          );
          return data[testCode];
        }

        const testResult = results.find(
          (result) =>
            result.quizCode === testCode ||
            result.testCode === testCode ||
            result.code === testCode ||
            result.quiz_code === testCode
        );

        if (testResult) {
          console.log("✅ Found matching test result (Method 4):", testResult);
          return testResult;
        }
      }
    } catch (error) {
      console.log("Method 4 failed:", error);
    }

    console.log("❌ No matching test result found for:", {
      userEmail,
      testCode,
    });
    return null;
  } catch (error) {
    console.error("Error fetching user assessment result:", error);
    return null;
  }
}

// Display assessment details
function displayAssessmentDetails(testResult, questionsData, candidateEmail) {
  console.log("🎯 displayAssessmentDetails called with:", {
    testResult,
    questionsData,
    candidateEmail,
  });

  // Set basic information
  const titleElement = document.getElementById("assessment-title");
  if (titleElement) {
    titleElement.textContent =
      questionsData?.title || testResult.quizCode || "Assessment Details";
    console.log("✅ Set assessment title:", titleElement.textContent);
  } else {
    console.error("❌ assessment-title element not found");
  }

  const testCodeElement = document.getElementById("test-code");
  if (testCodeElement) {
    testCodeElement.textContent = testResult.quizCode || "N/A";
    console.log("✅ Set test code:", testCodeElement.textContent);
  } else {
    console.error("❌ test-code element not found");
  }

  const emailElement = document.getElementById("candidate-email");
  if (emailElement) {
    emailElement.textContent = candidateEmail;
    console.log("✅ Set candidate email:", emailElement.textContent);
  } else {
    console.error("❌ candidate-email element not found");
  }
  // Format and display timestamp
  const dateElement = document.getElementById("test-date");
  if (dateElement) {
    if (testResult.timestamp && testResult.timestamp.seconds) {
      const date = new Date(testResult.timestamp.seconds * 1000);
      dateElement.textContent = date.toLocaleString();
    } else {
      dateElement.textContent = "N/A";
    }
    console.log("✅ Set test date:", dateElement.textContent);
  } else {
    console.error("❌ test-date element not found");
  }

  // Display duration (if available)
  const durationElement = document.getElementById("test-duration");
  if (durationElement) {
    durationElement.textContent =
      testResult.duration || questionsData?.duration || "N/A";
    console.log("✅ Set test duration:", durationElement.textContent);
  } else {
    console.error("❌ test-duration element not found");
  }
  // Display summary statistics
  const totalQuestions = questionsData?.questions?.length || 0;
  const userScore = testResult.score || 0;
  const percentage = testResult.percentage || 0;
  const correctAnswers = userScore;
  const incorrectAnswers = totalQuestions - correctAnswers;

  console.log("📊 Statistics:", {
    totalQuestions,
    userScore,
    percentage,
    correctAnswers,
    incorrectAnswers,
  });

  const totalScoreElement = document.getElementById("total-score");
  const totalPercentageElement = document.getElementById("total-percentage");
  const totalQuestionsElement = document.getElementById("total-questions");
  const correctAnswersElement = document.getElementById("correct-answers");
  const incorrectAnswersElement = document.getElementById("incorrect-answers");

  if (totalScoreElement) {
    totalScoreElement.textContent = `${userScore}/${totalQuestions}`;
    console.log("✅ Set total score:", totalScoreElement.textContent);
  } else {
    console.error("❌ total-score element not found");
  }

  if (totalPercentageElement) {
    totalPercentageElement.textContent = `${percentage}%`;
    console.log("✅ Set total percentage:", totalPercentageElement.textContent);
  } else {
    console.error("❌ total-percentage element not found");
  }

  if (totalQuestionsElement) {
    totalQuestionsElement.textContent = totalQuestions;
    console.log("✅ Set total questions:", totalQuestionsElement.textContent);
  } else {
    console.error("❌ total-questions element not found");
  }

  if (correctAnswersElement) {
    correctAnswersElement.textContent = correctAnswers;
    console.log("✅ Set correct answers:", correctAnswersElement.textContent);
  } else {
    console.error("❌ correct-answers element not found");
  }

  if (incorrectAnswersElement) {
    incorrectAnswersElement.textContent = incorrectAnswers;
    console.log(
      "✅ Set incorrect answers:",
      incorrectAnswersElement.textContent
    );
  } else {
    console.error("❌ incorrect-answers element not found");
  }
  // Set performance badge
  const performanceBadge = document.getElementById("performance-badge");
  if (performanceBadge) {
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
    console.log("✅ Set performance badge:", performanceBadge.textContent);
  } else {
    console.error("❌ performance-badge element not found");
  }

  // Display questions and answers
  console.log("🎯 About to call displayQuestionsAndAnswers");
  displayQuestionsAndAnswers(questionsData, testResult);
}

// Display questions and answers
function displayQuestionsAndAnswers(questionsData, testResult) {
  console.log("🎯 displayQuestionsAndAnswers called with:", {
    questionsData,
    testResult,
  });

  const questionsContainer = document.getElementById("questions-container");
  if (!questionsContainer) {
    console.error("❌ questions-container element not found!");
    return;
  }

  console.log("✅ Found questions-container element");
  questionsContainer.innerHTML = "";

  if (
    !questionsData ||
    !questionsData.questions ||
    questionsData.questions.length === 0
  ) {
    console.log("⚠️ No questions data available");
    questionsContainer.innerHTML = `
      <div class="no-questions">
        <h3>No Questions Available</h3>
        <p>No questions data available for this assessment.</p>
        <div class="debug-info">
          <strong>Debug Info:</strong><br>
          Quiz Data: ${questionsData ? "Found" : "Not found"}<br>
          Questions Array: ${
            questionsData?.questions
              ? `${questionsData.questions.length} questions`
              : "Empty or missing"
          }
        </div>
      </div>
    `;
    return;
  }

  console.log("✅ Questions data is valid, proceeding to display questions");
  const questions = questionsData.questions;

  // Handle both old and new data structures
  let userAnswers = {};
  let userQuestionsWithAnswers = [];

  if (
    testResult.user_questions_with_answers &&
    Array.isArray(testResult.user_questions_with_answers)
  ) {
    // New structure: user_questions_with_answers array
    userQuestionsWithAnswers = testResult.user_questions_with_answers;
    console.log(
      "📊 Using user_questions_with_answers structure:",
      userQuestionsWithAnswers
    );
  } else if (testResult.answers) {
    // Old structure: answers object
    userAnswers = testResult.answers;
    console.log("📊 Using legacy answers structure:", userAnswers);
  } else {
    console.log("⚠️ No user answers found in either format");
  }

  console.log("📊 COMPLETE DATA STRUCTURE:");
  console.log("Questions Data:", questions);
  console.log("User Answers Structure:", userAnswers);
  console.log("User Questions with Answers:", userQuestionsWithAnswers);
  console.log("Total Questions:", questions.length);
  // Display the original data structures for diagnosis
  questionsContainer.innerHTML = `
    <div class="debug-section">
      <h3>Assessment Data Structures</h3>
      <div class="data-container">
        <h4>Quiz Questions Structure (${questions.length} questions)</h4>
        <pre>${JSON.stringify(questions, null, 2)}</pre>
        
        <h4>User Answers Structure</h4>
        ${
          userQuestionsWithAnswers.length > 0
            ? `<h5>New Format: user_questions_with_answers (${
                userQuestionsWithAnswers.length
              } entries)</h5>
               <pre>${JSON.stringify(userQuestionsWithAnswers, null, 2)}</pre>`
            : ""
        }
        
        ${
          Object.keys(userAnswers).length > 0
            ? `<h5>Legacy Format: answers object (${
                Object.keys(userAnswers).length
              } entries)</h5>
               <pre>${JSON.stringify(userAnswers, null, 2)}</pre>`
            : ""
        }
      </div>
      
      <div class="structure-analysis">
        <h4>Structure Analysis</h4>
        <p>Total Firebase Questions: ${questions.length}</p>
        <p>Total User Answers (new format): ${
          userQuestionsWithAnswers.length
        }</p>
        <p>Total User Answers (legacy format): ${
          Object.keys(userAnswers).length
        }</p>
      </div>
    </div>
  `;

  // Add relationship analysis
  const analysisElement = analyzeDataStructureRelationships(
    questions,
    userQuestionsWithAnswers,
    userAnswers
  );
  questionsContainer.appendChild(analysisElement);

  console.log(`✅ Displayed raw data structures for analysis`);

  /* COMMENTED OUT REPETITIVE QUESTION/ANSWER DISPLAY LOGIC
  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    let userAnswer = null;

    // Try to find user answer using different methods
    if (userQuestionsWithAnswers.length > 0) {
      // Method 1: Match by question text
      const matchedUserQuestion = userQuestionsWithAnswers.find(
        (userQ) =>
          userQ.ques &&
          userQ.ques.trim().toLowerCase() ===
            question.question.trim().toLowerCase()
      );

      if (matchedUserQuestion) {
        userAnswer = matchedUserQuestion.answer;
        console.log(
          `🔍 Found answer by question match for Q${questionNumber}:`,
          userAnswer
        );
      } else {
        // Method 2: Match by index if question text doesn't match
        if (userQuestionsWithAnswers[index]) {
          userAnswer = userQuestionsWithAnswers[index].answer;
          console.log(
            `🔍 Found answer by index for Q${questionNumber}:`,
            userAnswer
          );
        }
      }
    } else {
      // Fallback to old method for legacy data
      const possibleKeys = [
        questionNumber.toString(),
        (questionNumber - 1).toString(),
        `q${questionNumber}`,
        `question${questionNumber}`,
        `Q${questionNumber}`,
        `Question${questionNumber}`,
        index.toString(),
        questionNumber,
        index,
        `${questionNumber}`,
        `${index}`,
      ];

      for (const key of possibleKeys) {
        if (userAnswers.hasOwnProperty(key)) {
          const value = userAnswers[key];
          if (value !== null && value !== undefined && value !== "") {
            userAnswer = value;
            console.log(
              `🔍 Found answer by key ${key} for Q${questionNumber}:`,
              userAnswer
            );
            break;
          }
        }
      }
    }

    const correctAnswer = question.correctAnswer;

    // Debug: Log the raw data first
    console.log(`🔍 Question ${questionNumber} RAW DATA:`, {
      questionIndex: index,
      questionNumber: questionNumber,
      questionText: question.question,
      userAnswerRaw: userAnswer,
      correctAnswerRaw: correctAnswer,
      userAnswerType: typeof userAnswer,
      correctAnswerType: typeof correctAnswer,
    });

    // Normalize answers for comparison (handle different formats)
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
    const isCorrect = compareAnswers(
      normalizedUserAnswer,
      normalizedCorrectAnswer
    );

    console.log(`✅ Question ${questionNumber} PROCESSED:`, {
      userAnswer,
      correctAnswer,
      normalizedUserAnswer,
      normalizedCorrectAnswer,
      isCorrect,
    });

    const questionElement = document.createElement("div");
    questionElement.className = `question-item ${
      isCorrect ? "correct-question" : "incorrect-question"
    }`;

    questionElement.innerHTML = `
      <div class="question-header">
        <div class="question-number-badge ${
          isCorrect ? "correct" : "incorrect"
        }">
          <div class="question-number">Q${questionNumber}</div>
          <div class="result-icon">${isCorrect ? "✓" : "✗"}</div>
        </div>
        <div class="question-text">${
          question.question || "Question text not available"
        }</div>
      </div>
      <div class="question-body">
        <div class="answer-options">
          ${generateAnswerOptions(
            question,
            userAnswer,
            correctAnswer,
            questionNumber
          )}
        </div>
        <div class="answer-summary">
          <div class="answer-status ${isCorrect ? "correct" : "incorrect"}">
            <div class="status-icon">${isCorrect ? "✅" : "❌"}</div>
            <div class="status-details">
              <div class="status-label">${
                isCorrect ? "Correct Answer!" : "Incorrect Answer"
              }</div>
              <div class="answer-comparison">
                <div class="user-answer">
                  <strong>Your Answer:</strong> ${formatAnswerDisplay(
                    userAnswer,
                    question.options
                  )}
                </div>
                <div class="correct-answer">
                  <strong>Correct Answer:</strong> ${formatAnswerDisplay(
                    correctAnswer,
                    question.options
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    console.log(`✅ Created question element for Q${questionNumber}`);
    questionsContainer.appendChild(questionElement);
  });
  */

  console.log(`✅ Successfully processed ${questions.length} questions`);
}

// Add CSS styles for the debug section display
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    .debug-section {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .debug-section h3 {
      font-size: 24px;
      color: #333;
      margin-top: 0;
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 10px;
    }
    
    .debug-section h4 {
      font-size: 18px;
      color: #555;
      margin: 15px 0 10px;
    }
    
    .debug-section h5 {
      font-size: 16px;
      color: #666;
      margin: 10px 0 5px;
    }
    
    .data-container {
      background-color: white;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      border: 1px solid #e9ecef;
    }
    
    .structure-analysis {
      background-color: #e8f4f8;
      border-radius: 6px;
      padding: 15px;
      border: 1px solid #bee5eb;
    }
    
    .structure-analysis p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    pre {
      background-color: #f1f3f5;
      border-radius: 4px;
      padding: 10px;
      overflow-x: auto;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #333;
      max-height: 400px;
      border: 1px solid #dee2e6;
    }
  </style>
`
);

// Helper function to normalize answers for comparison (handles multiple formats)
function normalizeAnswer(answer) {
  if (!answer) return null;

  // Convert to string, trim, and make uppercase
  const answerStr = String(answer).trim().toUpperCase();

  // Since users select in ABCD format, just return the letter directly
  if (/^[A-D]$/.test(answerStr)) {
    return answerStr;
  }

  // If somehow it's a number (1,2,3,4), convert to letter
  if (/^[1-4]$/.test(answerStr)) {
    const num = parseInt(answerStr);
    return String.fromCharCode(64 + num); // 1->A, 2->B, 3->C, 4->D
  }

  // If it's 0-based (0,1,2,3), convert to letter
  if (/^[0-3]$/.test(answerStr)) {
    const num = parseInt(answerStr);
    return String.fromCharCode(65 + num); // 0->A, 1->B, 2->C, 3->D
  }
  // Special case for the specific error in your log
  if (
    answerStr === "ADD INTERACTIVITY TO WEB PAGES" ||
    answerStr === "ADD INTERACTIVITY TO WEBPAGES"
  ) {
    console.log("Matched special case: ADD INTERACTIVITY TO WEB PAGES");
    return "ADD INTERACTIVITY TO WEB PAGES";
  }

  // For text-based answers or longer phrases (like "ADD INTERACTIVITY TO WEB PAGES"),
  // just use the uppercase text for direct comparison
  // This handles free-form text answers that aren't A/B/C/D or numeric
  console.log("Text-based answer format detected:", answer, "->", answerStr);
  return answerStr;
}

// Helper function to compare answers (handles different formats)
function compareAnswers(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) return false;

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  // For single-letter answers (A, B, C, D), do exact comparison
  if (/^[A-D]$/.test(normalizedUser) && /^[A-D]$/.test(normalizedCorrect)) {
    return normalizedUser === normalizedCorrect;
  }

  // For text-based answers, do a more flexible comparison:
  // 1. First try exact match
  if (normalizedUser === normalizedCorrect) {
    return true;
  }

  // 2. Try removing spaces and punctuation for a more lenient comparison
  const cleanUser = normalizedUser.replace(
    /[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,
    ""
  );
  const cleanCorrect = normalizedCorrect.replace(
    /[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,
    ""
  );

  return cleanUser === cleanCorrect;
}

// Helper function to generate answer options HTML
function generateAnswerOptions(
  question,
  userAnswer,
  correctAnswer,
  questionNumber
) {
  // Handle text input questions (no options)
  if (!question.options || question.options.length === 0) {
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
    const isCorrect = compareAnswers(userAnswer, correctAnswer);

    return `
      <div class="text-answer ${isCorrect ? "text-correct" : "text-incorrect"}">
        <div class="text-answer-label">Text Answer Question</div>
        <div class="text-answer-content">
          <div class="user-text-answer">
            <strong>Your Answer:</strong> ${userAnswer || "Not answered"}
          </div>
          <div class="correct-text-answer">
            <strong>Correct Answer:</strong> ${correctAnswer || "Not provided"}
          </div>
        </div>
        <div class="text-answer-status">
          ${
            isCorrect
              ? '<span class="correct-indicator">Correct ✓</span>'
              : '<span class="incorrect-indicator">Incorrect ✗</span>'
          }
        </div>
      </div>
    `;
  }

  // Regular multiple choice questions
  return question.options
    .map((option, optionIndex) => {
      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
      const normalizedUserAnswer = normalizeAnswer(userAnswer);
      const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

      let optionClasses = ["answer-option"];
      let indicators = [];

      // For multi-choice questions, handle A/B/C/D letter answers
      let isUserAnswer = false;
      let isCorrectAnswer = false;

      // Check if this is the user's selected answer
      if (/^[A-D]$/.test(normalizedUserAnswer)) {
        isUserAnswer = normalizedUserAnswer === optionLetter;
      } else {
        // For text answers, check if the user text matches this option text
        isUserAnswer = compareAnswers(userAnswer, option);
      }

      // Check if this is the correct answer
      if (/^[A-D]$/.test(normalizedCorrectAnswer)) {
        isCorrectAnswer = normalizedCorrectAnswer === optionLetter;
      } else {
        // For text answers, check if the correct text matches this option text
        isCorrectAnswer = compareAnswers(correctAnswer, option);
      }

      // Add classes and indicators based on matches
      if (isUserAnswer) {
        if (compareAnswers(userAnswer, correctAnswer)) {
          optionClasses.push("user-correct");
          indicators.push('<span class="user-indicator">Your Answer ✓</span>');
        } else {
          optionClasses.push("user-incorrect");
          indicators.push('<span class="user-indicator">Your Answer ✗</span>');
        }
      }

      if (isCorrectAnswer) {
        optionClasses.push("correct-answer");
        indicators.push(
          '<span class="correct-indicator">Correct Answer</span>'
        );
      }

      return `
      <div class="${optionClasses.join(" ")}">
        <div class="option-letter">${optionLetter}</div>
        <div class="option-text">${option}</div>
        <div class="option-indicators">
          ${indicators.join("")}
        </div>
      </div>
    `;
    })
    .join("");
}

// Helper function to format answer display text
function formatAnswerDisplay(answer, options) {
  if (!answer) return "Not answered";

  const normalizedAnswer = normalizeAnswer(answer);

  // For text-based answers with no options
  if (!options || options.length === 0) {
    return `${answer}`;
  }

  // For single letter answers (A, B, C, D)
  if (/^[A-Z]$/.test(normalizedAnswer)) {
    // Find the option index for the answer
    const optionIndex = normalizedAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3

    if (optionIndex >= 0 && optionIndex < options.length) {
      return `${normalizedAnswer}. ${options[optionIndex]}`;
    }
  }

  // For text answers that don't match an option, just return the original answer
  return `${answer}`;
}

// Helper functions for answer processing (these are still needed for the main functionality)
function testNormalize(answer) {
  return normalizeAnswer(answer);
}

function testCompare(userAnswer, correctAnswer) {
  return compareAnswers(
    normalizeAnswer(userAnswer),
    normalizeAnswer(correctAnswer)
  );
}

// Helper function to analyze the relationship between Firebase questions and user answers
function analyzeDataStructureRelationships(
  questions,
  userQuestionsWithAnswers,
  userAnswers
) {
  // Add this to the debug section to show the relationships
  const analysisContainer = document.createElement("div");
  analysisContainer.className = "data-analysis";

  let analysisHTML = `
    <h4>Data Structure Relationship Analysis</h4>
    <div class="relationship-table">
      <h5>Question and Answer Mapping</h5>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Firebase Question</th>
            <th>User Answer (New Format)</th>
            <th>User Answer (Legacy Format)</th>
            <th>Match Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Track matches and mismatches
  const matchSummary = {
    totalQuestions: questions.length,
    newFormatMatches: 0,
    legacyFormatMatches: 0,
    noMatches: 0,
  };

  // Go through each Firebase question and try to find a matching user answer
  questions.forEach((question, index) => {
    const questionNumber = index + 1;
    let userAnswerNew = null;
    let userAnswerNewText = "Not found";
    let userAnswerLegacy = null;
    let userAnswerLegacyText = "Not found";
    let matchStatus = "❌ No match";

    // Try to match with new format
    if (userQuestionsWithAnswers.length > 0) {
      // Match by question text
      const matchedUserQuestion = userQuestionsWithAnswers.find(
        (userQ) =>
          userQ.ques &&
          userQ.ques.trim().toLowerCase() ===
            question.question.trim().toLowerCase()
      );

      if (matchedUserQuestion) {
        userAnswerNew = matchedUserQuestion.answer;
        userAnswerNewText = JSON.stringify(userAnswerNew);
        matchStatus = "✅ Matched by question text";
        matchSummary.newFormatMatches++;
      }
      // Match by index as fallback
      else if (userQuestionsWithAnswers[index]) {
        userAnswerNew = userQuestionsWithAnswers[index].answer;
        userAnswerNewText = JSON.stringify(userAnswerNew) + " (index match)";
        matchStatus = "✅ Matched by index";
        matchSummary.newFormatMatches++;
      }
    }

    // Try to match with legacy format
    if (Object.keys(userAnswers).length > 0) {
      const possibleKeys = [
        questionNumber.toString(),
        (questionNumber - 1).toString(),
        `q${questionNumber}`,
        `question${questionNumber}`,
        `Q${questionNumber}`,
        `Question${questionNumber}`,
        index.toString(),
        questionNumber,
        index,
        `${questionNumber}`,
        `${index}`,
      ];

      for (const key of possibleKeys) {
        if (userAnswers.hasOwnProperty(key)) {
          const value = userAnswers[key];
          if (value !== null && value !== undefined && value !== "") {
            userAnswerLegacy = value;
            userAnswerLegacyText = `${JSON.stringify(value)} (key: ${key})`;

            if (matchStatus === "❌ No match") {
              matchStatus = "✅ Matched by legacy key";
              matchSummary.legacyFormatMatches++;
            } else {
              matchStatus += ", ✅ Legacy key match";
            }
            break;
          }
        }
      }
    }

    // If still no match found
    if (matchStatus === "❌ No match") {
      matchSummary.noMatches++;
    }

    // Add a row for each question
    analysisHTML += `
      <tr>
        <td>${questionNumber}</td>
        <td>${question.question.substring(0, 50)}${
      question.question.length > 50 ? "..." : ""
    }</td>
        <td>${userAnswerNewText}</td>
        <td>${userAnswerLegacyText}</td>
        <td>${matchStatus}</td>
      </tr>
    `;
  });

  // Close the table and add summary
  analysisHTML += `
        </tbody>
      </table>
      
      <h5>Match Summary</h5>
      <div class="match-summary">
        <p>Total Firebase Questions: ${matchSummary.totalQuestions}</p>
        <p>Matched with New Format: ${
          matchSummary.newFormatMatches
        } (${Math.round(
    (matchSummary.newFormatMatches / matchSummary.totalQuestions) * 100
  )}%)</p>
        <p>Matched with Legacy Format: ${
          matchSummary.legacyFormatMatches
        } (${Math.round(
    (matchSummary.legacyFormatMatches / matchSummary.totalQuestions) * 100
  )}%)</p>
        <p>No Matches Found: ${matchSummary.noMatches} (${Math.round(
    (matchSummary.noMatches / matchSummary.totalQuestions) * 100
  )}%)</p>
      </div>
    </div>
  `;

  analysisContainer.innerHTML = analysisHTML;

  // Add styles for the relationship table
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      .data-analysis {
        background-color: #fff;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
        border: 1px solid #e9ecef;
      }
      
      .relationship-table table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 14px;
      }
      
      .relationship-table th, .relationship-table td {
        border: 1px solid #dee2e6;
        padding: 8px;
        text-align: left;
      }
      
      .relationship-table th {
        background-color: #e9ecef;
        font-weight: bold;
      }
      
      .relationship-table tr:nth-child(even) {
        background-color: #f8f9fa;
      }
      
      .match-summary {
        background-color: #e8f4f8;
        border-radius: 4px;
        padding: 10px;
        margin-top: 15px;
      }
      
      .match-summary p {
        margin: 5px 0;
      }
    </style>
  `
  );

  return analysisContainer;
}
