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
  console.log("workingjek-");
  const contentElem = document.getElementById("feedback-modal");
  document.getElementById("feedback-modal").style.display = "block";
  console.log("content ", contentElem );
}

function calculateCorrectAnswers(testResult, quizData) {
  return testResult.score ?? 0;
}

function calculateTotalQuestions(testResult, quizData) {
  if (quizData && quizData.questions && quizData.questions.length > 0) {
    return quizData.questions.length;
  }
  return testResult.user_questions_with_answers?.length || 0;
}

// MAIN LOAD FUNCTION
async function loadTestDetails() {
  const testCode = getUrlParameter("test_code");
  const email = getUrlParameter("email");

  updateDebug(`URL Parameters - testCode: "${testCode}", email: "${email}"`);
  console.log("URL Parameters:", { testCode, email });

  if (!testCode) return showError("No test code provided.");

  try {
    const user = auth.currentUser;
    const userEmail = email || (user ? user.email : null);

    updateDebug(`User authentication - current user: ${user?.email}, using email: ${userEmail}`);
    if (!userEmail) return showError("User not authenticated.");

    const resultsRef = doc(db, "user_assessment_results", userEmail);
    const resultsDoc = await getDoc(resultsRef);
    if (!resultsDoc.exists()) return showError("No assessment results found for this user.");

    const resultsData = resultsDoc.data();
    const testResult = resultsData.results?.find((result) => result.quizCode === testCode);

    if (!testResult) return showError(`No results found for test code: ${testCode}`);

    let quizData = await fetchQuizData(testCode);

    testResult.correctAnswers = calculateCorrectAnswers(testResult, quizData);
    testResult.totalQuestions = calculateTotalQuestions(testResult, quizData);

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      displayBasicTestDetails(testResult);
      return;
    }

    displayTestDetails(testResult, quizData);
  } catch (error) {
    updateDebug(`Error: ${error.message}`);
    console.error("Error loading test details:", error);
    showError("Error loading test details. Please try again.");
  }
}

async function fetchQuizData(testCode) {
  const collections = ["quiz", "quiz_questions", "quizzes", "assessments"];

  for (const collectionName of collections) {
    try {
      const quizRef = doc(db, collectionName, testCode);
      const quizDoc = await getDoc(quizRef);
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        if (data.questions?.length > 0) return data;
      }
    } catch {}
  }

  for (const collection of collections) {
    try {
      const q = query(collection(db, collection), where("code", "==", testCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        if (data.questions?.length > 0) return data;
      }
    } catch {}
  }

  return null;
}

function displayBasicTestDetails(testResult) {
  showContent();

  document.getElementById("test-title").textContent = `📝 ${testResult.quizCode} Assessment`;
  document.getElementById("test-code").textContent = testResult.quizCode;
  document.getElementById("test-name").textContent = testResult.quizCode || "-";
  document.getElementById("total-questions").textContent = testResult.totalQuestions ?? "N/A";
  document.getElementById("correct-answers").textContent = `${testResult.correctAnswers ?? "-"}`;
  document.getElementById("score").textContent = testResult.score ?? "N/A";

  const percentage = testResult.percentage || 0;
  const percentageBadge = document.getElementById("percentage-badge");
  percentageBadge.textContent = `${percentage}%`;
  setPercentageBadgeColor(percentageBadge, percentage);

  if (testResult.timestamp?.seconds) {
    const date = new Date(testResult.timestamp.seconds * 1000);
    document.getElementById("test-date").textContent = date.toLocaleDateString("en-IN");
  }

  if (testResult.user_questions_with_answers?.length > 0) {
    displayBasicQuestionBreakdown(testResult.user_questions_with_answers);
  } else {
    document.getElementById("questions-container").innerHTML = `
      <div class="question-card fade-in" style="text-align: center; padding: 50px;">
        <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
        <h4 style="color: #2d3748; margin-bottom: 15px;">Assessment Summary</h4>
        <p style="color: #4a5568;">Detailed question breakdown is not available for this assessment.</p>
      </div>
    `;
  }
}

function displayTestDetails(testResult, quizData) {
  showContent();

  const title = quizData.title || testResult.quizCode;
  document.getElementById("test-title").textContent = `📝 ${title}`;
  document.getElementById("test-code").textContent = testResult.quizCode;
  document.getElementById("score").textContent = `${testResult.score}/${testResult.totalQuestions}`;

  const percentage = testResult.percentage || 0;
  const percentageBadge = document.getElementById("percentage-badge");
  percentageBadge.textContent = `${percentage}%`;
  setPercentageBadgeColor(percentageBadge, percentage);

  if (testResult.timestamp?.seconds) {
    const date = new Date(testResult.timestamp.seconds * 1000);
    document.getElementById("test-date").textContent = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  document.getElementById("total-questions").textContent = testResult.totalQuestions;
  document.getElementById("correct-answers").textContent = `${testResult.correctAnswers}/${testResult.totalQuestions}`;

  displayQuestions(quizData.questions, testResult.answers || {});
}

function setPercentageBadgeColor(badge, percentage) {
  if (percentage >= 80) badge.className = "score-badge score-excellent";
  else if (percentage >= 60) badge.className = "score-badge score-good";
  else if (percentage >= 40) badge.className = "score-badge score-average";
  else badge.className = "score-badge score-poor";
}

function displayQuestions(questions, userAnswers) {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  questions.forEach((question, index) => {
    const questionNum = index + 1;
    const userAnswer = userAnswers[questionNum.toString()];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    const questionCard = document.createElement("div");
    questionCard.className = `question-card ${isCorrect ? "correct" : "incorrect"} fade-in`;
    questionCard.style.animationDelay = `${index * 0.1}s`;

    questionCard.innerHTML = `
      <div class="question-header">
        <div style="display: flex; align-items: flex-start; gap: 15px; flex: 1;">
          <div class="question-number">${questionNum}</div>
          <div class="question-text">${question.question}</div>
        </div>
        <div class="status-icon ${isCorrect ? "status-correct" : "status-incorrect"}">
          ${isCorrect ? "✓" : "✗"}
        </div>
      </div>
      <div class="options">
        ${
          question.options?.map((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex);
            let optionClass = "option";

            if (optionLetter === correctAnswer) optionClass += " correct-answer";
            if (optionLetter === userAnswer) {
              optionClass += isCorrect ? " user-answer" : " user-wrong";
            }

            return `<div class="${optionClass}">
              <strong>${optionLetter}.</strong> ${option}
              ${optionLetter === userAnswer ? '<span style="color: #667eea; font-weight: bold;"> (Your Answer)</span>' : ""}
              ${optionLetter === correctAnswer ? '<span style="color: #48bb78; font-weight: bold;"> ✓ Correct</span>' : ""}
            </div>`;
          }).join("") || "<p>Options not available</p>"
        }
      </div>
      ${
        question.explanation
          ? `<div class="explanation"><strong>💡 Explanation:</strong> ${question.explanation}</div>`
          : ""
      }
    `;

    container.appendChild(questionCard);
  });
}

function displayBasicQuestionBreakdown(questions, containerId = "questions-container") {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const userAnswer = q.answer || "Not Answered";
    const questionCard = document.createElement("div");
    questionCard.className = `question-card fade-in`;
    questionCard.style.marginBottom = "20px";
    questionCard.style.padding = "20px";
    questionCard.style.border = "1px solid #e2e8f0";
    questionCard.style.borderRadius = "12px";
    questionCard.style.backgroundColor = "#f9fafb";
    questionCard.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.03)";

    questionCard.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-weight: bold; color: #2d3748;">Q${index + 1}: <span style="font-weight: normal; color: #4a5568;">${q.question}</span></div>
        <div style="color: #4a5568;">
          <span style="color: #667eea; font-weight: 600;">Your Answer:</span> ${userAnswer}
        </div>
      </div>
    `;

    container.appendChild(questionCard);
  });
}

// INIT
export function initTestDetails() {
  updateDebug("🚀 Initializing test details page");
  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const debugPanel = document.getElementById("debug-info");
  if (debugPanel && isLocalhost) debugPanel.style.display = "block";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAuth);
  } else {
    setupAuth();
  }
}

function setupAuth() {
  updateDebug("✅ DOM ready, setting up authentication");
  if (auth.currentUser) loadTestDetails();

  onAuthStateChanged(auth, (user) => {
   feature/blogs
    updateDebug(`🔐 Auth state: ${user?.email || "not logged in"}`);
    console.log("Auth state changed:", user?.email);

    // Only call loadTestDetails if we haven't already loaded
    const contentElem = document.getElementById("feedback-modal");
    if (!contentElem) {
      console.warn("[Test Details] #content element not found in DOM. Test details will not load.");
      updateDebug("[WARN] #content element not found in DOM. Test details will not load.");
      return;
    }
    console.log("content ", contentElem );
    if (
      user &&
      !contentElem.style.display.includes("block")
    ) {

    if (user && !document.getElementById("content").style.display.includes("block")) {
 main
      loadTestDetails();
    }
  });
}

if (typeof window !== "undefined") {
  initTestDetails();
}
