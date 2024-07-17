(() => {
  // Constants
  const TIME_LIMIT = 30 * 60; // 30 minutes in seconds

  // State variables
  let currentSubject = null;
  let currentQuestion = 0;
  let score = 0;
  let timeLimit = TIME_LIMIT;
  let timerInterval = null;

  // DOM elements
  const questionContainer = document.getElementById("question-container");
  const feedbackContainer = document.getElementById("feedback-container");
  const scoreDisplay = document.getElementById("score");
  const percentageDisplay = document.getElementById("percentage");
  const resultContainer = document.getElementById("result-container");
  const nextButton = document.getElementById("next-btn");
  const previousButton = document.getElementById("pre-btn");
  const homeButton = document.getElementById("home-btn");
  const timerDisplay = document.getElementById("timer");

  // Fetch questions for a specific subject from Firestore
  async function fetchQuestions(assessmentKey) {
    try {
      console.log(`Fetching questions for subject: ${assessmentKey}`); // Debug log
      const docRef = doc(db, "assessment", assessmentKey);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`Document found: ${assessmentKey}`); // Debug log
        return docSnap.data();
      } else {
        console.error("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      return null;
    }
  }

  async function startQuiz(assessmentKey) {
    console.log(`Starting quiz for subject: ${assessmentKey}`); // Debug log
    currentSubject = await fetchQuestions(assessmentKey);
    if (!currentSubject) {
      console.error("Failed to load subject data.");
      return;
    }
    currentQuestion = 0;
    score = 0;
    timeLimit = TIME_LIMIT; // Reset time limit
    startTimer(); // Start the timer when quiz starts
    showQuiz();

    // Update the URL with the subject
    const url = new URL(window.location);
    url.pathname = "test/quiz/";
    url.searchParams.set("quizcode", assessmentKey);
    window.history.pushState({ subject: assessmentKey }, "", url);
  }

  function showQuiz() {
    document.getElementById("quiz-container").style.display = "block";
    document.querySelector(".assessment-grid").style.display = "none";
    nextButton.style.display = "block";
    resultContainer.style.display = "none";
    homeButton.style.display = "none";

    loadQuestion();
  }

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

  function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
      alert("Please select an answer.");
      return;
    }

    const answerIndex = parseInt(selectedAnswer.value, 10);

    if (answerIndex === currentSubject.questions[currentQuestion].correctAnswer) {
      score++;
    }

    currentQuestion++;

    if (currentQuestion < currentSubject.questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      loadQuestion();
    } else {
      alert("You are at the first question.");
    }
  }

  function showResult() {
    questionContainer.style.display = "none";
    feedbackContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";
    homeButton.style.display = "none";

    stopTimer();

    const percentage = Math.round(
      (score / currentSubject.questions.length) * 100
    );
    scoreDisplay.textContent = score;
    percentageDisplay.textContent = percentage;

    previousButton.style.display = "none";

    homeButton.style.display = "block";
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLimit--;
      updateTimerDisplay();
      if (timeLimit <= 0) {
        stopTimer();
        alert("Time's up! Quiz session ended.");
        showResult();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLimit / 60);
    const seconds = timeLimit % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  function goHome() {
    document.getElementById("quiz-container").style.display = "none";
    document.querySelector(".assessment-grid").style.display = "grid";
    resultContainer.style.display = "none";
    stopTimer();
    window.history.pushState({}, "", window.location.pathname);
  }

  function setupEventListeners() {
    const startButtons = document.querySelectorAll(".btn-start");
    startButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const assessmentKey = button.getAttribute("data-subject");
        startQuiz(assessmentKey);
      });
    });

    if (previousButton) {
      previousButton.addEventListener("click", previousQuestion);
    } else {
      console.error("Element with ID 'pre-btn' not found.");
    }

    if (nextButton) {
      nextButton.addEventListener("click", nextQuestion);
    }

    if (homeButton) {
      homeButton.addEventListener("click", goHome);
    }

    window.addEventListener("popstate", function (event) {
      if (event.state && event.state.subject) {
        startQuiz(event.state.subject);
      } else {
        goHome();
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const assessmentKey = urlParams.get("quizcode");
    if (window.location.pathname === "/test/quiz/" && assessmentKey) {
      startQuiz(assessmentKey);
    }
  }

  document.addEventListener("DOMContentLoaded", setupEventListeners);
})();
