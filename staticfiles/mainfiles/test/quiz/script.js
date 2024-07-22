const queryParams = new URLSearchParams(window.location.search);
const quizCode = queryParams.get('quizcode').toLowerCase();

document.addEventListener("DOMContentLoaded", () => {
    const TIME_LIMIT = 30 * 60; // 30 minutes in seconds

    let currentSubject = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;

    const questionContainer = document.getElementById("question-container");
    const scoreDisplay = document.getElementById("score");
    const percentageDisplay = document.getElementById("percentage");
    const resultContainer = document.getElementById("result-container");
    const nextButton = document.getElementById("next-btn");
    const previousButton = document.getElementById("pre-btn");
    const homeButton = document.getElementById("home-btn");
    const timerDisplay = document.getElementById("timer");

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
        console.log(`Starting quiz for subject: ${assessmentKey.title}`);
        currentSubject = await fetchQuestions(assessmentKey);
        if (!currentSubject) {
            console.error("Failed to load subject data.");
            alert("Failed to load quiz data. Please try again.");
            return;
        }
        currentQuestionIndex = 0;
        score = 0;
        timeLeft = TIME_LIMIT;
        displayQuiz();
        startTimer();
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
            questionContainer.innerHTML = `
            <h2>${currentSubject.title} - Question ${currentQuestionIndex + 1}</h2>
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
            console.log(questionContainer.innerHTML);
            console.log(currentSubject.title);
        }
    }

    function nextQuestion() {
        const selectedAnswer = document.querySelector(
            'input[name="answer"]:checked'
        );
        if (!selectedAnswer) {
            alert("Please  an answer.");
            return;
        }

        const answerIndex = parseInt(selectedAnswer.value, 10);

        if (
            answerIndex ===
            currentSubject.questions[currentQuestionIndex].correctAnswer
        ) {
            score++;
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

        const percentage = Math.round(
            (score / currentSubject.questions.length) * 100
        );
        if (scoreDisplay) scoreDisplay.textContent = score;
        if (percentageDisplay) percentageDisplay.textContent = `${percentage}`;

        // Save results to Firestore
        try {
            const user = auth.currentUser;
            if (user) {
                const email = user.email;
                const userDocRef = doc(db, "user_assessment_results", email);

                // Get existing results
                const userDocSnap = await getDoc(userDocRef);
                let results = [];
                if (userDocSnap.exists()) {
                    results = userDocSnap.data().results || [];
                }

                // Add new result
                results.push({
                    quizCode: quizCode,
                    score: score,
                    percentage: percentage,
                    timestamp: new Date()
                });

                // Save updated results
                await setDoc(userDocRef, { results: results });
                console.log("Quiz results saved successfully.");
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

    function goHome() {
        const quizContainer = document.getElementById("quiz-container");
        const assessmentGrid = document.querySelector(".assessment-grid");
        if (quizContainer) quizContainer.style.display = "none";
        if (assessmentGrid) assessmentGrid.style.display = "grid";
        if (resultContainer) resultContainer.style.display = "none";
        stopTimer();
        window.location.href = '/'; // Redirect to the home page
    }

    function setupEventListeners() {
        startQuiz(quizCode);

        if (nextButton) {
            nextButton.addEventListener("click", nextQuestion);
        }
        if (previousButton) {
            previousButton.addEventListener("click", previousQuestion);
        }
        if (homeButton) {
            homeButton.addEventListener("click", goHome);
        }
    }

    setupEventListeners();
});
