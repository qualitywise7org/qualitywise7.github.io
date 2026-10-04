// Smart Career — free stream / career direction quiz.
// Free result -> clearly priced detailed report -> handoff to
// Career Counselling or courses.
//
// When the user is signed in, the attempt is also appended to the
// existing "user_assessment_results" collection in the SAME shape the
// current test runner uses, so it shows up in /myaccount/test-report/.
import {
  getCurrentUser,
  saveSmartProfile,
  track,
  // loginUrlBack, // used by the sign-in prompt, which is switched off
  createQuiz,
  scoreAnswers,
} from "/staticfiles/mainfiles/platform/common.js?v=20261001";

const QUIZ_CODE = "smart_career_basic";

const QUESTIONS = [
  {
    q: "Which subject do you enjoy the most?",
    options: [
      { text: "Maths and Physics", w: { science_pcm: 2 } },
      { text: "Biology and Chemistry", w: { science_pcb: 2 } },
      { text: "Accounts, Economics and Business", w: { commerce: 2 } },
      { text: "History, Languages and Art", w: { arts: 2 } },
    ],
  },
  {
    q: "What kind of work sounds satisfying?",
    options: [
      { text: "Designing, coding or engineering things", w: { science_pcm: 2 } },
      { text: "Looking after people's health", w: { science_pcb: 2 } },
      { text: "Running a business or managing money", w: { commerce: 2 } },
      { text: "Writing, teaching, design or public service", w: { arts: 2 } },
    ],
  },
  {
    q: "How do you like to solve problems?",
    options: [
      { text: "With logic, numbers and experiments", w: { science_pcm: 1, science_pcb: 1 } },
      { text: "By understanding people and markets", w: { commerce: 2 } },
      { text: "Through creativity and expression", w: { arts: 2 } },
      { text: "By studying how living things work", w: { science_pcb: 2 } },
    ],
  },
  {
    q: "Which future excites you more?",
    options: [
      { text: "Engineer, developer or data analyst", w: { science_pcm: 2 } },
      { text: "Doctor, pharmacist or biotech researcher", w: { science_pcb: 2 } },
      { text: "CA, analyst or entrepreneur", w: { commerce: 2 } },
      { text: "Civil services, media or design", w: { arts: 2 } },
    ],
  },
  {
    q: "What matters most to you in a career?",
    options: [
      { text: "A good salary and growth in tech", w: { science_pcm: 1, commerce: 1 } },
      { text: "Helping and healing people", w: { science_pcb: 2 } },
      { text: "Independence and building wealth", w: { commerce: 2 } },
      { text: "Impact, expression and meaning", w: { arts: 2 } },
    ],
  },
];

const STREAMS = {
  science_pcm: {
    label: "Science (PCM): engineering and tech",
    line: "Your answers point to maths-heavy, technical fields like engineering, computer science and data.",
    next: "Try a free tech certification test",
    nextHref: "/test/",
  },
  science_pcb: {
    label: "Science (PCB): medical and life sciences",
    line: "You lean towards biology and helping people: medicine, pharmacy, biotech and allied health.",
    next: "See career options after 12th science",
    nextHref: "/careeroptions/",
  },
  commerce: {
    label: "Commerce: business and finance",
    line: "Money, markets and business pull you in: commerce, CA, finance and running your own thing.",
    next: "Browse business and finance careers",
    nextHref: "/careeroptions/",
  },
  arts: {
    label: "Arts and humanities: creative and civil",
    line: "You care about expression, people and meaning: humanities, design, media and civil services.",
    next: "Explore humanities and creative careers",
    nextHref: "/careeroptions/",
  },
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

async function saveAttemptToExistingReport(email, answers, result) {
  if (!email) return;
  try {
    const ref = window.doc(window.db, "user_assessment_results", email);
    const attempt = {
      quizCode: QUIZ_CODE,
      score: result.matched,
      percentage: result.confidence,
      timestamp: new Date(),
      user_questions_with_answers: QUESTIONS.map((q, i) => ({
        question: q.q,
        answer: answers[i] !== undefined ? q.options[answers[i]].text : null,
      })),
    };
    const snap = await window.getDoc(ref);
    if (snap.exists()) {
      await window.setDoc(ref, { results: [...(snap.data().results || []), attempt] }, { merge: true });
    } else {
      await window.setDoc(ref, { results: [attempt] });
    }
  } catch (err) {
    console.warn("career attempt save skipped:", err.message);
  }
}

function showResult(answers) {
  const score = scoreAnswers(QUESTIONS, answers, Object.keys(STREAMS));
  const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  const meta = STREAMS[top];
  const total = Object.values(score).reduce((a, b) => a + b, 0) || 1;
  const confidence = Math.round((score[top] / total) * 100);

  $("sd-quiz-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  $("sd-recos").innerHTML = `
    <div class="sd-reco">
      <h3>${esc(meta.label)}</h3>
      <div class="sd-why">${esc(meta.line)}</div>
      <span class="sd-cover">How strongly your answers agree: ${confidence}%</span>
    </div>`;
  $("sd-handoff-next").innerHTML =
    `Good next step: <a href="${meta.nextHref}" data-ga-event="cta_click" data-ga-name="career_next_${top}">${esc(meta.next)} →</a>`;
  $("sd-result-title").focus();
  track("quiz_complete", { quiz_name: "career", result: top, confidence });

  (async () => {
    const user = await getCurrentUser();
    await saveSmartProfile(user?.email, {
      career: { stream: top, confidence, scores: score, completedAt: new Date().toISOString() },
    });
    await saveAttemptToExistingReport(user?.email, answers, { matched: score[top], confidence });
    // Sign-in prompt switched OFF (see the commented block in this page's index.ejs):
    // if (!user) {
    //   $("sd-signin-hint").classList.remove("sd-hidden");
    //   $("sd-signin-link").href = loginUrlBack();
    // }
  })();
}

const quiz = createQuiz({
  quizName: "career",
  questions: QUESTIONS,
  lastLabel: "Show my direction",
  els: {
    progress: $("sd-progress-bar"),
    step: $("sd-step"),
    qText: $("sd-question"),
    options: $("sd-options"),
    nextBtn: $("sd-next"),
    prevBtn: $("sd-prev"),
  },
  onFinish: showResult,
});

$("sd-restart").addEventListener("click", () => {
  $("sd-result-card").classList.add("sd-hidden");
  $("sd-quiz-card").classList.remove("sd-hidden");
  quiz.restart();
});
