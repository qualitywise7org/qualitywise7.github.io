// Findme — 5-minute interest quiz. Free, no login needed. Points the
// user to the best place to start and saves the interest signal to the
// shared profile (Firestore if signed in, otherwise this browser).
import {
  getCurrentUser,
  saveSmartProfile,
  track,
  loginUrlBack,
  createQuiz,
  scoreAnswers,
} from "/staticfiles/mainfiles/platform/common.js?v=20261001";

const QUESTIONS = [
  {
    q: "When you have free time, what pulls you in most?",
    options: [
      { text: "Building or fixing things on a computer", w: { skills: 2, career: 1 } },
      { text: "Reading about money, business or startups", w: { money: 2, career: 1 } },
      { text: "Helping people figure things out", w: { career: 2, money: 1 } },
      { text: "I honestly don't know yet", w: { career: 1, explore: 1 } },
    ],
  },
  {
    q: "Which of these feels like a real worry right now?",
    options: [
      { text: "Choosing the right stream or career", w: { career: 3 } },
      { text: "Protecting my family and money", w: { money: 3 } },
      { text: "Getting job-ready with real skills", w: { skills: 2, career: 1 } },
      { text: "Nothing big, I'm just exploring", w: { explore: 2 } },
    ],
  },
  {
    q: "Pick the line that sounds most like you.",
    options: [
      { text: "I like clear steps and a plan I can follow.", w: { career: 2 } },
      { text: "I want to compare options before I commit.", w: { money: 2 } },
      { text: "I learn best by doing and practising.", w: { skills: 2 } },
      { text: "Too many choices overwhelm me.", w: { explore: 1, career: 1 } },
    ],
  },
  {
    q: "Where are you right now?",
    options: [
      { text: "In school (Class 9 to 12)", w: { career: 2 } },
      { text: "In college or just started working", w: { skills: 1, career: 1 } },
      { text: "Working and thinking about savings and cover", w: { money: 2 } },
      { text: "I'd rather not say", w: {} },
    ],
  },
  {
    q: "A friend would describe you as…",
    options: [
      { text: "Curious and analytical", w: { skills: 1, career: 1 } },
      { text: "Careful and practical", w: { money: 2 } },
      { text: "Ambitious about my career", w: { career: 2 } },
      { text: "Still figuring myself out", w: { explore: 2 } },
    ],
  },
];

const ROUTES = {
  career: {
    label: "Smart Career",
    line: "Start with the career quiz. You'll get a stream or career direction in about three minutes.",
    href: "/smart-decisions/career/",
    icon: "fa-graduation-cap",
  },
  money: {
    label: "Smart Insurance",
    line: "A quick needs check will show you which cover actually matters for you.",
    href: "/smart-decisions/insurance/",
    icon: "fa-shield-heart",
  },
  skills: {
    label: "Courses & certifications",
    line: "Building job-ready skills looks like your best next step. Try a free certification test first.",
    href: "/pricing/",
    icon: "fa-laptop-code",
  },
  explore: {
    label: "Browse Smart Decisions",
    line: "No wrong place to start. Have a look around and pick whatever feels useful.",
    href: "/smart-decisions/",
    icon: "fa-compass",
  },
};

const $ = (id) => document.getElementById(id);

function showResult(answers) {
  const score = scoreAnswers(QUESTIONS, answers, Object.keys(ROUTES));
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0).map(([k]) => k);
  const primary = ranked[0] || "explore";
  const secondary = ranked.find((m) => m !== primary && m !== "explore");

  $("sd-quiz-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  $("sd-recos").innerHTML = [primary, secondary]
    .filter(Boolean)
    .map((k, i) => {
      const r = ROUTES[k];
      return `<a class="sd-reco" href="${r.href}" data-ga-event="cta_click" data-ga-name="findme_result_${k}" data-ga-rank="${i + 1}">
          <h3><i class="fa-solid ${r.icon}" style="margin-right:8px;color:#3b82f6;" aria-hidden="true"></i>${r.label} →</h3>
          <div class="sd-why">${r.line}</div>
        </a>`;
    })
    .join("");
  $("sd-result-title").focus();
  track("quiz_complete", { quiz_name: "findme", result: primary });

  (async () => {
    const user = await getCurrentUser();
    const interests = ranked.slice(0, 3);
    await saveSmartProfile(user?.email, { findme: { interests, scores: score, completedAt: new Date().toISOString() }, interests });
    if (!user) {
      $("sd-signin-hint").classList.remove("sd-hidden");
      $("sd-signin-link").href = loginUrlBack();
    }
  })();
}

const quiz = createQuiz({
  quizName: "findme",
  questions: QUESTIONS,
  lastLabel: "See where to start",
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
