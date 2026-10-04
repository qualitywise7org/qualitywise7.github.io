// Smart IT (IT help) — a few questions tell the user which kind of tech
// expert they actually need, before they spend anything.
import {
  getCurrentUser,
  saveSmartProfile,
  track,
  // loginUrlBack, // used by the sign-in prompt, which is switched off
  createQuiz,
  scoreAnswers,
} from "/staticfiles/mainfiles/platform/common.js?v=20261001";

const QUESTIONS = [
  {
    q: "What's the problem, roughly?",
    options: [
      { text: "My website is broken or looks wrong", w: { web: 2 } },
      { text: "I want to build something new (a site or an app)", w: { build: 2 } },
      { text: "Something is slow, hacked or won't load", w: { ops: 2 } },
      { text: "I need advice before I spend money", w: { advice: 2 } },
    ],
  },
  {
    q: "What is it built on, if you know?",
    options: [
      { text: "WordPress, Wix or Shopify", w: { web: 2 } },
      { text: "Custom code someone wrote for me", w: { build: 1, ops: 1 } },
      { text: "No idea, honestly", w: { advice: 2 } },
      { text: "Nothing yet, starting fresh", w: { build: 2 } },
    ],
  },
  {
    q: "How urgent is it?",
    options: [
      { text: "Today. It's costing me business", w: { ops: 2, web: 1 } },
      { text: "Sometime this week", w: { web: 1, build: 1 } },
      { text: "No rush, I'm planning ahead", w: { advice: 1, build: 1 } },
    ],
  },
  {
    q: "What kind of budget are you thinking of?",
    options: [
      { text: "A small fix, keep it cheap", w: { web: 1 } },
      { text: "Happy to pay to get it done right", w: { build: 1, ops: 1 } },
      { text: "Not sure. That's part of what I want to know", w: { advice: 2 } },
    ],
  },
];

const VERDICTS = {
  web: {
    who: "a WordPress or front-end developer",
    line: "You don't need a whole software team. A good front-end or website-builder specialist can fix this quickly and cheaply.",
  },
  build: {
    who: "a full-stack developer",
    line: "You're building something new, so you want a full-stack developer who can handle both how it looks and how it works.",
  },
  ops: {
    who: "a DevOps or security specialist",
    line: "This is a server or security problem. A general web developer usually can't fix it properly. You want someone who looks after servers and security.",
  },
  advice: {
    who: "a short advice call first",
    line: "Don't hire anyone yet. A quick call with an expert will stop you paying the wrong person.",
  },
};

const $ = (id) => document.getElementById(id);

function showResult(answers) {
  const score = scoreAnswers(QUESTIONS, answers, Object.keys(VERDICTS));
  const key = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  const v = VERDICTS[key];
  $("sd-quiz-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  $("sd-recos").innerHTML = `<div class="sd-reco"><h3>You need ${v.who}</h3><div class="sd-why">${v.line}</div></div>`;
  $("sd-result-title").focus();
  track("quiz_complete", { quiz_name: "it_help", result: key });

  (async () => {
    const user = await getCurrentUser();
    await saveSmartProfile(user?.email, { it: { need: key, at: new Date().toISOString() } });
    // Sign-in prompt switched OFF (see the commented block in this page's index.ejs):
    // if (!user) {
    //   $("sd-signin-hint").classList.remove("sd-hidden");
    //   $("sd-signin-link").href = loginUrlBack();
    // }
  })();
}

const quiz = createQuiz({
  quizName: "it_help",
  questions: QUESTIONS,
  lastLabel: "Tell me who I need",
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
