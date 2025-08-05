// Function to update user rankings based on assessment results
async function updateUserRankings() {
  try {
    console.log("Updating user rankings...");
    
    // Get all user assessment results
    const userResultsQuery = query(collection(db, "user_assessment_results"));
    const userResultsSnapshot = await getDocs(userResultsQuery);
    
    const rankingScores = {};
    
    userResultsSnapshot.forEach((doc) => {
      const userEmail = doc.id;
      const userData = doc.data();
      
      if (userData.results && Array.isArray(userData.results)) {
        let totalScore = 0;
        let totalAttempts = 0;
        let bestScore = 0;
        
        // Calculate average score and best score across all assessments
        userData.results.forEach((attempt) => {
          if (attempt.percentage !== undefined) {
            totalScore += attempt.percentage;
            totalAttempts++;
            if (attempt.percentage > bestScore) {
              bestScore = attempt.percentage;
            }
          }
        });
        
        if (totalAttempts > 0) {
          const averageScore = totalScore / totalAttempts;
          // Weight: 70% best score + 30% average score
          const weightedScore = averageScore;
          
          rankingScores[userEmail] = {
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore: bestScore,
            weightedScore: Math.round(weightedScore * 100) / 100,
            totalAttempts: totalAttempts,
            lastAssessmentDate: userData.results[userData.results.length - 1]?.timestamp || null
          };
        }
      }
    });
    
    // Sort users by weighted score (descending)
    const sortedUsers = Object.entries(rankingScores)
      .sort(([,a], [,b]) => b.weightedScore - a.weightedScore)
      .map(([email, data], index) => ({
        email,
        rank: index + 1,
        ...data
      }));
    
    // Store rankings in database
    const rankingRef = doc(db, "user_rankings", "assessment_rankings");
    await setDoc(rankingRef, {
      rankings: sortedUsers,
      lastUpdated: new Date(),
      totalUsers: sortedUsers.length
    });
    
    console.log("User rankings updated successfully");
    
  } catch (error) {
    console.error("Error updating user rankings:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to attempt an assessment");
    window.location.href = "/";
  } else {
    showGuidelinePopup();
  }
});

function startWebcam() {
  const video = document.getElementById("webcam");
  if (!video) return;
  video.style.display = "block";
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function(err) {
        alert("Could not access webcam: " + err.message);
        video.style.display = "none";
      });
  } else {
    alert("Webcam not supported in this browser.");
  }
}

function stopWebcam() {
  const video = document.getElementById("webcam");
  if (video && video.srcObject) {
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
    video.style.display = "none";
  }
}


function showGuidelinePopup() {
  const guidelinePopup = document.getElementById("guidelinePopup");
  const overlay = document.getElementById("overlay");

  overlay.classList.add("open-overlay");
  guidelinePopup.classList.add("open-popup");
  document.body.classList.add("blur"); // Add blur to the background
 
  startWebcam();
  const startButton = document.getElementById("start-btn");
  startButton.addEventListener("click", () => {
    const agreeCheckbox = document.getElementById("agree-checkbox");
    if (agreeCheckbox.checked) {
      guidelinePopup.classList.remove("open-popup");
      overlay.classList.remove("open-overlay");
      document.body.classList.remove("blur"); // Remove blur
       // <-- Start the webcam here!
      startQuizAfterPopup();
    } else {
      alert("Please agree to the guidelines before starting the quiz.");
    }
  });
}

function startQuizAfterPopup() {
  const quizContainer = document.getElementById("quiz-container");
  const guidelinePopup = document.getElementById("guidelinePopup");

  if (guidelinePopup) {
    guidelinePopup.classList.remove("open-popup");
    document.body.classList.remove("blur"); // Remove blur
  }
  if (quizContainer) {
    quizContainer.style.display = "block";
  } else {
    console.error("Quiz container not found in the DOM.");
  }
  startQuiz();
}

async function startQuiz() {
  // document.addEventListener("DOMContentLoaded", () => {
  const TIME_LIMIT = 30 * 60; // 30 minutes in seconds

  let currentSubject = null;
  let currentQuestionIndex = 0;
  let unansweredCount = 0;
  let score = 0;
  let timeLeft = TIME_LIMIT;
  let timerInterval = null;
  let quizWindowFocus = true;
  let tabSwitchAlertPending = false;
  let selectedAnswers = {}; // Store the selected answers

  const questionTitle = document.getElementById("question-title");
  const questionContainer = document.getElementById("question-container");
  const scoreDisplay = document.getElementById("score");
  const percentageDisplay = document.getElementById("percentage");
  const unansweredDisplay = document.getElementById("unansweredDisplay");
  const resultContainer = document.getElementById("result-container");
  const nextButton = document.getElementById("next-btn");
  const previousButton = document.getElementById("pre-btn");
  const homeButton = document.getElementById("home-btn");
  const timerDisplay = document.getElementById("timer");
  const quizTitleElement = document.getElementById("quiz-title");

  async function fetchQuestions(assessmentKey) {
    try {
      console.log(`Fetching questions for subject: ${assessmentKey}`);
      const docRef = doc(db, "assessment", assessmentKey);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`Document found: ${assessmentKey}`);
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
    console.log(`Starting quiz for subject: ${assessmentKey}`);
    const assessmentData = await fetchQuestions(assessmentKey);
    if (!assessmentData) {
      console.error("Failed to load subject data.");
      alert("Failed to load quiz data. Please try again.");
      return;
    }
    currentSubject = assessmentData;
    if (quizTitleElement) {
      quizTitleElement.textContent = assessmentData.title;
    }
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = TIME_LIMIT;
    selectedAnswers = {}; // Reset selected answers
    displayQuiz();
    startTimer();
    preventCheating();
  }

  function displayQuiz() {
    const quizContainer = document.getElementById("quiz-container");

    const assessmentGrid = document.querySelector(".assessment-grid");
    if (quizContainer) quizContainer.style.display = "block";
    if (questionContainer) questionContainer.style.display = "block";

    if (assessmentGrid) assessmentGrid.style.display = "none";
    if (nextButton) nextButton.style.display = "block";
    if (previousButton) previousButton.style.display = "block";
    if (resultContainer) resultContainer.style.display = "none";
    if (homeButton) homeButton.style.display = "none";

    loadQuestion();
  }

  function loadQuestion() {
    const question = currentSubject.questions[currentQuestionIndex];
    if (questionContainer) {
      questionTitle.innerHTML = `<p>${currentQuestionIndex + 1}. ${
        question.question
      }</p>`;
      questionContainer.innerHTML = `
                <ul class="answer-options">
                    ${question.answers
                      .map(
                        (answer, index) => `
                        <li class="answer-option">
                            <label>
                                <input type="radio" name="answer" value="${index}" ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "checked"
                            : ""
                        }>
                                <span class="answer-text">${answer}</span>
                            </label>
                        </li>
                        `
                      )
                      .join("")}
                </ul>
                `;
    }
  }

  function nextQuestion() {
    const selectedAnswer = document.querySelector(
      'input[name="answer"]:checked'
    );

    if (!selectedAnswer) {
      // If no answer is selected, increase the unanswered count
      if (selectedAnswers[currentQuestionIndex] === undefined) {
        unansweredCount++;
      }
    } else {
      // If an answer is selected, save it and adjust the unanswered count if needed
      const answerIndex = parseInt(selectedAnswer.value, 10);
      if (selectedAnswers[currentQuestionIndex] === undefined) {
        unansweredCount--; // Reduce unanswered count if this was previously unanswered
      }
      selectedAnswers[currentQuestionIndex] = answerIndex;

      // Check if the selected answer is correct
      if (
        answerIndex ===
        currentSubject.questions[currentQuestionIndex].correctAnswer
      ) {
        score++;
      }
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < currentSubject.questions.length) {
      loadQuestion();
    } else {
      displayResult();
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      loadQuestion();
    } else {
      alert("You are at the first question.");
    }
  }

  async function displayResult() {
    if (questionContainer) questionContainer.style.display = "none";
    if (nextButton) nextButton.style.display = "none";
    if (previousButton) previousButton.style.display = "none";
    if (resultContainer) resultContainer.style.display = "block";
    if (homeButton) homeButton.style.display = "block";

    stopTimer();
    stopWebcam();

    const totalQuestions = currentSubject.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const unansweredCount =
      totalQuestions - Object.keys(selectedAnswers).length;

    if (scoreDisplay) scoreDisplay.textContent = score;
    if (percentageDisplay) percentageDisplay.textContent = `${percentage}`;
    if (unansweredDisplay) unansweredDisplay.textContent = unansweredCount;

    try {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;

        // Reference to the user's assessment results
        const userResultsRef = doc(db, "user_assessment_results", email);

        // New attempt data
        const newAttempt = {
          quizCode: assessmentKey, // Quiz identifier
          score: score,
          percentage: percentage,
          timestamp: new Date(),
          user_questions_with_answers: currentSubject.questions.map(
            (q, index) => {
              const selectedAnswerIndex = selectedAnswers[index];
              const selectedAnswerText =
                selectedAnswerIndex !== undefined
                  ? q.answers[selectedAnswerIndex]
                  : null;
              return {
                question: q.question,
                answer: selectedAnswerText, // Save full text of the selected answer
              };
            }
          ),
        };

        // Fetch existing results
        const existingDoc = await getDoc(userResultsRef);

        if (existingDoc.exists()) {
          // Append new attempt to the existing results array
          const existingData = existingDoc.data();
          const updatedResults = [...(existingData.results || []), newAttempt];
          await setDoc(
            userResultsRef,
            { results: updatedResults },
            { merge: true }
          );
        } else {
          // Create a new document with the first attempt
          await setDoc(userResultsRef, { results: [newAttempt] });
        }

        console.log("Quiz attempt saved successfully.");
        
        // Update user rankings after saving results
        await updateUserRankings();
        
      } else {
        console.error("No authenticated user found.");
      }
    } catch (error) {
      console.error("Failed to save quiz results:", error);
    }
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopTimer();
        alert("Time's up! Quiz session ended.");
        displayResult();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function updateTimerDisplay() {
    if (timerDisplay) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    }
  }

  function preventCheating() {
    // Prevent text selection
    document.addEventListener("selectstart", (event) => event.preventDefault());

    // Prevent copying
    document.addEventListener("copy", (event) => event.preventDefault());

    // Prevent cutting
    document.addEventListener("cut", (event) => event.preventDefault());

    // Prevent pasting
    document.addEventListener("paste", (event) => event.preventDefault());

    // Detect tab switching
    window.addEventListener("blur", () => {
      tabSwitchAlertPending = true;
      setTimeout(() => {
        if (tabSwitchAlertPending) {
          alert(
            "You have switched tabs or windows, which is not allowed during the test."
          );
          window.location.href = "/";
        }
      }, 100); // Delay to allow "select an answer" alert to be handled first
    });

    window.addEventListener("focus", () => {
      quizWindowFocus = true;
      tabSwitchAlertPending = false;
    });
  }

  nextButton.addEventListener("click", nextQuestion);
  previousButton.addEventListener("click", previousQuestion);
  homeButton.addEventListener("click", () => (location.href = "/"));

  // Assuming you have a way to get the assessmentKey from URL or some other method
  const urlParams = new URLSearchParams(window.location.search);
  const assessmentKey = urlParams.get("quizcode");

  startQuiz(assessmentKey);
}
