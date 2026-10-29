// Smart Career — free career direction assessment (about 6 minutes).
//
// 1 question about where the user is now (school, college, working), then
// 12 questions across four areas: interests, strengths, working style and
// values. Answers are scored against 8 career areas. The result shows the
// top 3 areas, each with why it fits, what to study, exams, example careers,
// skills to start now and a next step for the user's stage, plus a 30-day
// action plan. Free result -> priced detailed report -> counselling.
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
const LEARN = "https://allizwell.jobsdoor360.in/";

// ---------- where the user is now (question 1, not scored) ----------
const STAGES = [
  { key: "school_lower", text: "Class 8 to 10: I'll choose a stream soon" },
  { key: "school_upper", text: "Class 11 or 12: I'm choosing a course or college" },
  { key: "college", text: "In college: I'm working out which career to aim for" },
  { key: "working", text: "Working: I'm thinking about changing direction" },
];

// ---------- 8 career areas ----------
// eng  Engineering & technology      med  Medicine & health
// sci  Science & research            fin  Finance & accounting
// biz  Business, management & startups
// law  Law, civil services & public policy
// cre  Design, media & creative work
// edu  Teaching, psychology & social impact
const AREAS = {
  eng: {
    label: "Engineering & technology",
    why: "You like building things, logical problems and technology.",
    study: { school_lower: "Science with Maths (PCM). Computer Science as an extra helps.", other: "B.Tech / B.E., BCA, B.Sc Computer Science or a diploma in engineering." },
    exams: "JEE Main, JEE Advanced, BITSAT, state CETs (MHT-CET, KCET, WBJEE), NDA (technical)",
    careers: "Software developer, data analyst, AI / ML engineer, electronics or mechanical engineer, cyber security analyst",
    skills: "Programming basics, maths practice, building small projects",
    learn: [["DSA", "dsa/"], ["Java", "java/"], ["Machine Learning", "machine-learning/"], ["System Design", "system-design/"]],
  },
  med: {
    label: "Medicine & health",
    why: "You care about people's wellbeing and enjoy biology.",
    study: { school_lower: "Science with Biology (PCB).", other: "MBBS, BDS, B.Pharm, Nursing, Physiotherapy, BAMS / BHMS or allied health courses." },
    exams: "NEET UG, AIIMS nursing, state paramedical entrance tests",
    careers: "Doctor, dentist, pharmacist, nurse, physiotherapist, nutritionist, medical lab technologist",
    skills: "Biology and chemistry depth, patience, staying calm under pressure",
    learn: [["Class 11", "class-11/"], ["Class 12", "class-12/"]],
  },
  sci: {
    label: "Science & research",
    why: "You're curious about how things work and happy to go deep into one subject.",
    study: { school_lower: "Science (PCM or PCB, depending on whether you prefer maths or biology).", other: "B.Sc / BS in physics, chemistry, biology or maths, then M.Sc and often a PhD." },
    exams: "CUET, IISER Aptitude Test, NEST, JAM (for M.Sc), GATE / CSIR-NET later",
    careers: "Scientist, research associate, lab analyst, data scientist, professor",
    skills: "Reading research, careful experiments, statistics",
    learn: [["Class 11", "class-11/"], ["Class 12", "class-12/"]],
  },
  fin: {
    label: "Finance & accounting",
    why: "You're comfortable with numbers, detail and rules, and like money matters.",
    study: { school_lower: "Commerce with Maths (Science with Maths also works).", other: "B.Com, BBA Finance, CA / CS / CMA, or Economics." },
    exams: "CA Foundation, CS Executive, CUET (B.Com / Economics), IPMAT, later CFA",
    careers: "Chartered accountant, financial analyst, banker, tax consultant, investment advisor",
    skills: "Accounts basics, Excel, reading financial news",
    learn: [["Class 11", "class-11/"], ["Class 12", "class-12/"]],
  },
  biz: {
    label: "Business, management & startups",
    why: "You like leading, persuading and turning ideas into something real.",
    study: { school_lower: "Any stream. Commerce is the most direct route.", other: "BBA, B.Com, or any degree followed by an MBA. Many founders start straight after college." },
    exams: "IPMAT, CUET (BBA), NPAT, later CAT / XAT / GMAT for an MBA",
    careers: "Entrepreneur, product manager, marketing manager, sales leader, consultant, operations manager",
    skills: "Speaking and writing well, running a small project, basic marketing",
    learn: [],
  },
  law: {
    label: "Law, civil services & public policy",
    why: "You want to argue for what's fair, understand society and make decisions that affect many people.",
    study: { school_lower: "Humanities is the most natural fit, but any stream can go into law or civil services.", other: "5-year integrated LLB, BA in Political Science, History or Economics, then UPSC / state PSC preparation." },
    exams: "CLAT, AILET, LSAT India; later UPSC Civil Services, state PSC exams",
    careers: "Lawyer, judge, IAS / IPS / IFS officer, policy analyst, legal advisor",
    skills: "Reading every day, writing clear arguments, following current affairs",
    learn: [],
  },
  cre: {
    label: "Design, media & creative work",
    why: "You think visually, like making things people see or read, and enjoy expressing ideas.",
    study: { school_lower: "Any stream. Keep drawing, writing or making things alongside.", other: "B.Des, BFA, Mass Communication, Animation or Architecture." },
    exams: "NID DAT, NIFT, UCEED, NATA (architecture), CUET for media courses",
    careers: "UX / UI designer, graphic designer, architect, journalist, content creator, animator, filmmaker",
    skills: "Building a portfolio, design tools (Figma, Canva), writing and storytelling",
    learn: [],
  },
  edu: {
    label: "Teaching, psychology & social impact",
    why: "You enjoy helping others grow and understanding how people think and feel.",
    study: { school_lower: "Any stream. Humanities with Psychology is a good fit.", other: "BA / B.Sc Psychology, B.Ed, BSW / MSW, or a degree in your favourite subject plus B.Ed." },
    exams: "CUET, CTET / state TET (teaching), UGC-NET (college teaching), later RCI-licensed psychology courses",
    careers: "Teacher, counsellor, psychologist, social worker, NGO manager, education specialist",
    skills: "Explaining things simply, listening, volunteering",
    learn: [["Class 5", "class-5/"], ["Class 6", "class-6/"], ["Class 7", "class-7/"], ["Class 8", "class-8/"]],
  },
};

// ---------- 12 scored questions ----------
const QUESTIONS = [
  { q: "Where are you right now?", area: "stage", options: STAGES.map((s) => ({ text: s.text, w: {} })) },
  // Interests
  { q: "Which of these would you happily read or watch about for hours?", area: "Interests", options: [
    { text: "How apps, machines or AI work", w: { eng: 3, sci: 1 } },
    { text: "The human body, diseases and medicines", w: { med: 3, sci: 1 } },
    { text: "Markets, money, brands and startups", w: { biz: 2, fin: 2 } },
    { text: "History, politics, society and justice", w: { law: 3, edu: 1 } },
    { text: "Art, films, design or writing", w: { cre: 3 } },
  ] },
  { q: "Which school subject do you enjoy most (or did)?", area: "Interests", options: [
    { text: "Maths and Physics", w: { eng: 2, sci: 2 } },
    { text: "Biology and Chemistry", w: { med: 2, sci: 2 } },
    { text: "Accounts, Economics or Business Studies", w: { fin: 3, biz: 1 } },
    { text: "History, Political Science or Languages", w: { law: 2, edu: 1, cre: 1 } },
    { text: "Art, Computer graphics or Music", w: { cre: 3 } },
  ] },
  { q: "Pick the project you'd most like to do this weekend.", area: "Interests", options: [
    { text: "Build a simple app, robot or website", w: { eng: 3 } },
    { text: "Do an experiment and find out why something happens", w: { sci: 3, med: 1 } },
    { text: "Sell something or organise an event", w: { biz: 3, fin: 1 } },
    { text: "Make a poster, video or short story", w: { cre: 3 } },
    { text: "Teach or help a group of younger kids", w: { edu: 3 } },
  ] },
  // Strengths
  { q: "What do people usually come to you for?", area: "Strengths", options: [
    { text: "Solving tricky maths or fixing tech problems", w: { eng: 3, fin: 1 } },
    { text: "Explaining things or giving advice", w: { edu: 3, law: 1 } },
    { text: "Making something look good", w: { cre: 3 } },
    { text: "Taking charge and getting people moving", w: { biz: 3, law: 1 } },
    { text: "Remembering details and getting facts right", w: { fin: 2, med: 1, sci: 1 } },
  ] },
  { q: "Which of these do you find easiest?", area: "Strengths", options: [
    { text: "Working with numbers and calculations", w: { fin: 2, eng: 2 } },
    { text: "Remembering and understanding lots of information", w: { med: 2, law: 2 } },
    { text: "Coming up with new ideas", w: { cre: 2, biz: 2 } },
    { text: "Understanding how other people feel", w: { edu: 3, med: 1 } },
  ] },
  { q: "How do you feel about long, tough exams and years of study?", area: "Strengths", options: [
    { text: "Fine, if the goal is worth it", w: { med: 2, law: 2, sci: 1, fin: 1 } },
    { text: "Okay, but I'd rather learn by doing projects", w: { eng: 2, cre: 1, biz: 1 } },
    { text: "I'd prefer to start working and earning early", w: { biz: 2, cre: 1, fin: 1 } },
  ] },
  // Working style
  { q: "Where would you rather work?", area: "Working style", options: [
    { text: "At a desk, with a computer and hard problems", w: { eng: 2, fin: 2 } },
    { text: "In a lab, hospital or out in the field", w: { med: 2, sci: 2 } },
    { text: "Meeting people, travelling, pitching ideas", w: { biz: 2, law: 1 } },
    { text: "In a studio or anywhere I can create", w: { cre: 3 } },
    { text: "In a classroom or community", w: { edu: 3 } },
  ] },
  { q: "Do you prefer working alone or in a team?", area: "Working style", options: [
    { text: "Mostly alone, deep focus", w: { sci: 2, eng: 1, cre: 1, fin: 1 } },
    { text: "A small team where everyone has a role", w: { eng: 1, med: 1, cre: 1 } },
    { text: "Leading a team", w: { biz: 2, law: 1 } },
    { text: "Directly with the people I'm helping", w: { edu: 2, med: 2 } },
  ] },
  { q: "Which sounds more like you?", area: "Working style", options: [
    { text: "I like clear rules and getting things exactly right", w: { fin: 2, law: 1, med: 1 } },
    { text: "I like trying things and seeing what works", w: { eng: 1, biz: 2, cre: 1 } },
    { text: "I like asking 'why' until I really understand", w: { sci: 3 } },
    { text: "I like making people's lives better", w: { edu: 2, med: 1 } },
  ] },
  // Values
  { q: "What matters most to you in a future job?", area: "Values", options: [
    { text: "Good money and fast growth", w: { eng: 1, fin: 2, biz: 2 } },
    { text: "Respect and helping people", w: { med: 2, edu: 1, law: 1 } },
    { text: "Power to change things in society", w: { law: 3 } },
    { text: "Freedom to create and be myself", w: { cre: 3 } },
    { text: "Discovering something new", w: { sci: 3 } },
  ] },
  { q: "Which kind of stability do you want?", area: "Values", options: [
    { text: "A secure job, even if growth is slower", w: { law: 2, edu: 1, med: 1, fin: 1 } },
    { text: "Some risk is fine for bigger rewards", w: { biz: 2, eng: 1 } },
    { text: "Doing what I love matters more than security", w: { cre: 2, sci: 1, edu: 1 } },
  ] },
  { q: "Ten years from now, which would make you proudest?", area: "Values", options: [
    { text: "I built a product millions of people use", w: { eng: 2, biz: 1 } },
    { text: "I saved or improved lives", w: { med: 3 } },
    { text: "I run my own company", w: { biz: 3 } },
    { text: "I made policies or decisions that helped my country", w: { law: 3 } },
    { text: "People know and love my creative work", w: { cre: 3 } },
    { text: "I shaped the future of many students", w: { edu: 3 } },
  ] },
];

// Next step by stage, so the plan fits where the user is.
const STAGE_NEXT = {
  school_lower: "Choose your Class 11 stream around this area, then start the study material for your class.",
  school_upper: "Shortlist 3 courses, note their entrance exams and dates, and begin preparing for one.",
  college: "Pick one skill from the list and finish a small project or free certification in the next month.",
  working: "Talk to two people already in this field, then take a short course before making the switch.",
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Max points an area could get, so a "match %" is comparable across areas.
function maxPoints(key) {
  return QUESTIONS.reduce((sum, q) => sum + Math.max(0, ...q.options.map((o) => o.w[key] || 0)), 0) || 1;
}

// Which areas of the questionnaire (Interests / Strengths ...) gave this area points.
function reasons(answers, key) {
  const hits = {};
  answers.forEach((choice, qi) => {
    const q = QUESTIONS[qi];
    if (choice === undefined || q.area === "stage") return;
    if ((q.options[choice].w[key] || 0) >= 2) hits[q.area] = true;
  });
  return Object.keys(hits);
}

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

function areaCard(key, pct, rank, stage, answers) {
  const a = AREAS[key];
  const study = stage === "school_lower" ? a.study.school_lower : a.study.other;
  const from = reasons(answers, key);
  const learn = a.learn.length
    ? `<div class="cr-learn">Study material: ${a.learn
        .map(([t, p]) => `<a href="${LEARN}${p}" data-ga-event="cta_click" data-ga-name="career_learn_${key}" target="_blank" rel="noopener">${esc(t)}</a>`)
        .join(" · ")}</div>`
    : "";
  return `
    <article class="cr-area" aria-labelledby="cr-${key}">
      <div class="cr-head">
        <span class="cr-rank">${rank}</span>
        <h3 id="cr-${key}">${esc(a.label)}</h3>
        <span class="cr-pct">${pct}% match</span>
      </div>
      <div class="cr-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
      <p class="cr-why">${esc(a.why)}${from.length ? ` <span class="cr-from">Strongest in your ${esc(from.join(", ").toLowerCase())} answers.</span>` : ""}</p>
      <dl class="cr-facts">
        <div><dt>What to study</dt><dd>${esc(study)}</dd></div>
        <div><dt>Entrance exams</dt><dd>${esc(a.exams)}</dd></div>
        <div><dt>Example careers</dt><dd>${esc(a.careers)}</dd></div>
        <div><dt>Skills to start now</dt><dd>${esc(a.skills)}</dd></div>
        <div><dt>Your next step</dt><dd>${esc(STAGE_NEXT[stage])}</dd></div>
      </dl>
      ${learn}
    </article>`;
}

function profileSummary(answers) {
  // the option the user picked in each area, in their own words
  const pick = (area) =>
    QUESTIONS.map((q, i) => (q.area === area && answers[i] !== undefined ? q.options[answers[i]].text : null)).filter(Boolean);
  const rows = [["Interests", pick("Interests")], ["Strengths", pick("Strengths")], ["Working style", pick("Working style")], ["Values", pick("Values")]];
  return `<div class="cr-profile"><h3>Your profile in your own words</h3><dl>${rows
    .map(([t, items]) => `<div><dt>${t}</dt><dd>${items.map(esc).join(" · ")}</dd></div>`)
    .join("")}</dl></div>`;
}

function plan(top, stage) {
  const a = AREAS[top];
  const steps = [
    ["Week 1", `Read about 3 careers from "${a.careers.split(", ").slice(0, 3).join(", ")}" and watch one day-in-the-life video for each.`],
    ["Week 2", `Talk to one person who works in ${a.label.toLowerCase()}. Ask what a normal day looks like and what they wish they'd known.`],
    ["Week 3", `Start one skill: ${a.skills.split(", ")[0].toLowerCase()}. Spend 30 minutes a day on it.`],
    ["Week 4", STAGE_NEXT[stage]],
  ];
  return `<div class="cr-plan"><h3>Your next 30 days</h3><ol>${steps
    .map(([w, t]) => `<li><strong>${w}:</strong> ${esc(t)}</li>`)
    .join("")}</ol></div>`;
}

function showResult(answers) {
  const stage = STAGES[answers[0]]?.key || "school_upper";
  const keys = Object.keys(AREAS);
  const score = scoreAnswers(QUESTIONS, answers, keys);
  const pct = Object.fromEntries(keys.map((k) => [k, Math.round((score[k] / maxPoints(k)) * 100)]));
  const ranked = keys.sort((x, y) => pct[y] - pct[x] || score[y] - score[x]);
  const top3 = ranked.slice(0, 3);
  const top = top3[0];
  const confidence = pct[top];

  $("sd-quiz-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  $("sd-recos").innerHTML =
    top3.map((k, i) => areaCard(k, pct[k], i + 1, stage, answers)).join("") +
    profileSummary(answers) +
    plan(top, stage);
  $("sd-handoff-next").innerHTML =
    `Want a person to look at this with you? <a href="/career-counselling/" data-ga-event="cta_click" data-ga-name="career_next_${top}">See career counselling options →</a>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("sd-result-title").focus();
  track("quiz_complete", { quiz_name: "career", result: top, confidence, stage, second: top3[1], third: top3[2] });

  (async () => {
    const user = await getCurrentUser();
    await saveSmartProfile(user?.email, {
      career: { stream: top, top3, stage, confidence, scores: score, completedAt: new Date().toISOString() },
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
  lastLabel: "Show my results",
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

const printBtn = $("cr-print");
if (printBtn) printBtn.addEventListener("click", () => window.print());
