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
  console.log("Showing error:", message);
  updateDebug(`ERROR: ${message}`);
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "block";
  document.getElementById("error-text").textContent = message;
}

function showContent() {
  console.log("Showing content");
  updateDebug("Showing content successfully");
  document.getElementById("loading").style.display = "none";
  document.getElementById("content").style.display = "block";
}

async function loadTestDetails() {
  const testCode = getUrlParameter("test_code");
  const email = getUrlParameter("email");

  updateDebug(`URL Parameters - testCode: "${testCode}", email: "${email}"`);
  console.log("URL Parameters:", { testCode, email });

  if (!testCode) {
    showError("No test code provided.");
    return;
  }

  try {
    // Get current user or use email from URL
    const user = auth.currentUser;
    const userEmail = email || (user ? user.email : null);

    updateDebug(
      `User authentication - current user: ${user?.email}, using email: ${userEmail}`
    );
    console.log("User authentication:", { user: user?.email, userEmail });

    if (!userEmail) {
      showError("User not authenticated.");
      return;
    }

    updateDebug(
      `Loading test details for testCode: "${testCode}", user: "${userEmail}"`
    );
    console.log(`Loading test details for: ${testCode}, user: ${userEmail}`);

    // Fetch user results
    const resultsRef = doc(db, "user_assessment_results", userEmail);
    const resultsDoc = await getDoc(resultsRef);

    updateDebug(`Results document exists: ${resultsDoc.exists()}`);
    console.log("Results document exists:", resultsDoc.exists());

    if (!resultsDoc.exists()) {
      showError("No assessment results found for this user.");
      return;
    }

    const resultsData = resultsDoc.data();
    updateDebug(
      `User results data found with ${resultsData.results?.length || 0} results`
    );
    console.log("User results data:", resultsData);

    // Find the specific test result
    const testResult = resultsData.results?.find((result) => {
      console.log("Checking result:", result.quizCode, "against:", testCode);
      return result.quizCode === testCode;
    });

    if (!testResult) {
      const availableCodes =
        resultsData.results?.map((r) => r.quizCode).join(", ") || "none";
      updateDebug(
        `No matching test result found. Available codes: ${availableCodes}`
      );
      console.log(
        "Available quiz codes:",
        resultsData.results?.map((r) => r.quizCode)
      );
      showError(`No results found for test code: ${testCode}`);
      return;
    }

    updateDebug(
      `Found test result - score: ${testResult.score}, percentage: ${testResult.percentage}`
    );
    console.log("Found test result:", testResult);

    // Fetch quiz questions - try multiple approaches
    let quizData = await fetchQuizData(testCode);

    if (!quizData || !quizData.questions) {
      updateDebug("No quiz data found, showing basic details only");
      console.log("No quiz data found, creating mock data for display");
      // Create basic display without questions
      displayBasicTestDetails(testResult);
      return;
    }

    updateDebug(
      `Quiz data found with ${quizData.questions?.length || 0} questions`
    );
    console.log("Quiz data found:", quizData);

    // Display the results
    displayTestDetails(testResult, quizData);
  } catch (error) {
    updateDebug(`Error: ${error.message}`);
    console.error("Error loading test details:", error);
    showError("Error loading test details. Please try again.");
  }
}

async function fetchQuizData(testCode) {
  console.log("Fetching quiz data for:", testCode);

  // Try multiple collection names and document IDs
  const collectionAttempts = [
    { collection: "quiz", docId: testCode },
    { collection: "quiz_questions", docId: testCode },
    { collection: "quizzes", docId: testCode },
    { collection: "assessments", docId: testCode },
  ];

  // Try direct document access first
  for (const attempt of collectionAttempts) {
    try {
      console.log(
        `Trying collection: ${attempt.collection}, docId: ${attempt.docId}`
      );
      const quizRef = doc(db, attempt.collection, attempt.docId);
      const quizDoc = await getDoc(quizRef);

      if (quizDoc.exists()) {
        const data = quizDoc.data();
        console.log(`Found in ${attempt.collection}:`, data);
        if (data.questions && data.questions.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.log(`Error accessing ${attempt.collection}:`, error.message);
    }
  }

  // Try query-based search
  const queryAttempts = [
    { collection: "quiz_questions", field: "code" },
    { collection: "quiz", field: "code" },
    { collection: "quizzes", field: "code" },
    { collection: "assessments", field: "code" },
  ];

  for (const attempt of queryAttempts) {
    try {
      console.log(
        `Querying collection: ${attempt.collection}, field: ${attempt.field}`
      );
      const q = query(
        collection(db, attempt.collection),
        where(attempt.field, "==", testCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        console.log(`Found via query in ${attempt.collection}:`, data);
        if (data.questions && data.questions.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.log(`Error querying ${attempt.collection}:`, error.message);
    }
  }

  console.log("No quiz data found in any collection");
  return null;
}

function displayBasicTestDetails(testResult) {
  console.log("Displaying basic test details without questions");
  showContent();

  // Update info card with basic information
  document.getElementById(
    "test-title"
  ).textContent = `📝 ${testResult.quizCode} Assessment`;
  document.getElementById("test-code").textContent = testResult.quizCode;
  document.getElementById("score").textContent = testResult.score || "N/A";

  const percentage = testResult.percentage || 0;
  const percentageBadge = document.getElementById("percentage-badge");
  percentageBadge.textContent = `${percentage}%`;

  // Set percentage badge color
  setPercentageBadgeColor(percentageBadge, percentage);

  // Format date
  if (testResult.timestamp && testResult.timestamp.seconds) {
    const date = new Date(testResult.timestamp.seconds * 1000);
    document.getElementById("test-date").textContent =
      date.toLocaleDateString();
  }

  document.getElementById("total-questions").textContent = "Not Available";

  // Show attractive message about questions
  const container = document.getElementById("questions-container");
  container.innerHTML = `
    <div class="question-card fade-in" style="text-align: center; padding: 50px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));">
      <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
      <h4 style="color: #2d3748; margin-bottom: 15px;">Assessment Summary</h4>
      <p style="color: #4a5568; margin-bottom: 25px;">Detailed question breakdown is not available for this assessment.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-top: 30px;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <strong style="color: #667eea;">Test Code</strong>
          <div style="font-size: 1.2rem; color: #2d3748; margin-top: 5px;">${
            testResult.quizCode
          }</div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <strong style="color: #667eea;">Score</strong>
          <div style="font-size: 1.2rem; color: #2d3748; margin-top: 5px;">${
            testResult.score || "N/A"
          }</div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <strong style="color: #667eea;">Percentage</strong>
          <div style="font-size: 1.2rem; color: #2d3748; margin-top: 5px;">${percentage}%</div>
        </div>
      </div>
    </div>
  `;
}

function displayTestDetails(testResult, quizData) {
  console.log("Displaying full test details with questions");
  showContent();

  // Update info card with attractive title
  const title = quizData.title || testResult.quizCode;
  document.getElementById("test-title").textContent = `📝 ${title}`;
  document.getElementById("test-code").textContent = testResult.quizCode;
  document.getElementById(
    "score"
  ).textContent = `${testResult.score}/${quizData.questions.length}`;

  const percentage = testResult.percentage || 0;
  const percentageBadge = document.getElementById("percentage-badge");
  percentageBadge.textContent = `${percentage}%`;

  setPercentageBadgeColor(percentageBadge, percentage);

  // Format date nicely
  if (testResult.timestamp && testResult.timestamp.seconds) {
    const date = new Date(testResult.timestamp.seconds * 1000);
    document.getElementById("test-date").textContent = date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  document.getElementById("total-questions").textContent =
    quizData.questions.length;

  // Display questions with animation
  displayQuestions(quizData.questions, testResult.answers || {});
}

function setPercentageBadgeColor(badge, percentage) {
  // Set percentage badge color
  if (percentage >= 80) {
    badge.className = "score-badge score-excellent";
  } else if (percentage >= 60) {
    badge.className = "score-badge score-good";
  } else if (percentage >= 40) {
    badge.className = "score-badge score-average";
  } else {
    badge.className = "score-badge score-poor";
  }
}

function displayQuestions(questions, userAnswers) {
  console.log(
    "Displaying questions:",
    questions.length,
    "User answers:",
    userAnswers
  );
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  questions.forEach((question, index) => {
    const questionNum = index + 1;
    const userAnswer = userAnswers[questionNum.toString()];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    console.log(
      `Question ${questionNum}: User: ${userAnswer}, Correct: ${correctAnswer}, Match: ${isCorrect}`
    );

    const questionCard = document.createElement("div");
    questionCard.className = `question-card ${
      isCorrect ? "correct" : "incorrect"
    } fade-in`;

    // Add a slight delay for staggered animation
    questionCard.style.animationDelay = `${index * 0.1}s`;

    questionCard.innerHTML = `
      <div class="question-header">
        <div style="display: flex; align-items: flex-start; gap: 15px; flex: 1;">
          <div class="question-number">${questionNum}</div>
          <div class="question-text">${question.question}</div>
        </div>
        <div class="status-icon ${
          isCorrect ? "status-correct" : "status-incorrect"
        }">
          ${isCorrect ? "✓" : "✗"}
        </div>
      </div>
      <div class="options">
        ${
          question.options
            ?.map((option, optIndex) => {
              const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
              let optionClass = "option";

              if (optionLetter === correctAnswer) {
                optionClass += " correct-answer";
              }

              if (optionLetter === userAnswer) {
                if (isCorrect) {
                  optionClass += " user-answer";
                } else {
                  optionClass += " user-wrong";
                }
              }

              return `<div class="${optionClass}">
            <strong>${optionLetter}.</strong> ${option}
            ${
              optionLetter === userAnswer
                ? ' <span style="color: #667eea; font-weight: bold;">(Your Answer)</span>'
                : ""
            }
            ${
              optionLetter === correctAnswer
                ? ' <span style="color: #48bb78; font-weight: bold;">✓ Correct</span>'
                : ""
            }
          </div>`;
            })
            .join("") || "<p>Options not available</p>"
        }
      </div>
      ${
        question.explanation
          ? `<div class="explanation">
        <strong>💡 Explanation:</strong> ${question.explanation}
      </div>`
          : ""
      }
    `;

    container.appendChild(questionCard);
  });
}

// Initialize when page loads
export function initTestDetails() {
  updateDebug("🚀 Initializing test details page");
  console.log("Initializing test details page");

  // Check if user is on localhost to show debug info
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const debugPanel = document.getElementById("debug-info");
  if (debugPanel && isLocalhost) {
    debugPanel.style.display = "block";
  }

  // Faster initialization - don't wait for DOM if it's already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAuth);
  } else {
    setupAuth();
  }
}

function setupAuth() {
  updateDebug("✅ DOM ready, setting up authentication");
  console.log("DOM loaded, setting up auth listener");

  // Check if user is already authenticated to speed up loading
  if (auth.currentUser) {
    updateDebug("👤 User already authenticated");
    loadTestDetails();
  }

  onAuthStateChanged(auth, (user) => {
    updateDebug(`🔐 Auth state: ${user?.email || "not logged in"}`);
    console.log("Auth state changed:", user?.email);

    // Only call loadTestDetails if we haven't already loaded
    if (
      user &&
      !document.getElementById("content").style.display.includes("block")
    ) {
      loadTestDetails();
    }
  });
}

// Auto-initialize immediately
if (typeof window !== "undefined") {
  initTestDetails();
}
