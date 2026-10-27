// ============================================================
// Findme front end: start screen, one question per screen (7 input
// types), micro-feedback, back / skip, save + resume, EN / Hinglish,
// then the report with share card and PDF.
// Logic lives in findme-engine.js and findme-report.js; this file only
// does DOM and glue.
// ============================================================
import {
  createSession, answer, skip, back, nextQuestion, getProgress, getQuestion, matchKeywords, replay,
} from "./findme-engine.js";
import { scoreDims } from "./findme-engine.js";
import { CLUSTERS } from "./findme-clusters.js";
import { buildReport, buildQuickReport, renderReportHTML, resultSummary, drawShareCard } from "./findme-report.js";
import { syncSession, finishSession, loadLocal, clearLocal, ensureUser } from "./findme-store.js";
import { loadProfile, profileToEvidence, inferStage, hasEnoughSignal } from "./findme-profile.js";

const VERSION = new URL(import.meta.url).searchParams.get("v") || "dev";
const LANG_KEY = "findme_lang";
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const UI = {
  en: {
    pill: "FREE · NO SIGN-UP · ABOUT 8 MINUTES",
    h1: "What do you want to become?",
    hero: "Engineer, doctor, dancer, designer, founder, officer, creator... Answer fun questions about what you enjoy. Each answer changes the next question, and at the end you get your own career report.",
    startTitle: "Let's find what fits you",
    how1: "15 to 25 quick questions. No right or wrong answers.",
    how2: "The quiz adapts to you, so no two people get the same questions.",
    how3: "Get a report with careers, exams, skills and a 90-day plan. Share it or save it as a PDF.",
    stageQ: "Where are you right now?",
    st_school_8_10: "Class 8 to 10", st_school_11_12: "Class 11 or 12", st_college: "In college", st_graduate: "Graduated or working",
    resume: "Resume where you left off", begin: "Let's begin", seeReport: "See my last report",
    stageHint: "Pick where you are right now so we can suggest the right exams and courses.",
    privacy: "No name or phone number needed. We save your answers to improve Findme, but never the words you type.",
    sdLink: "Here for insurance, property or tech help?", sdLinkA: "Go to Smart Decisions",
    back: "Back", skip: "Skip this one", next: "Next", seeResult: "See my report",
    pickOne: "Pick one", pickUpTo: (n) => `Pick up to ${n}`, picked: (k, n) => `${k} of ${n} picked`,
    rankHint: "Drag, or use the arrows, to put your favourite on top.", up: "Move up", down: "Move down",
    sliderHint: "Slide to where you'd honestly be.", openHint: "Stays on your device. We only keep the topic, not your words.",
    or: "or", building: "Building your report…",
    shared: "Card ready!", downloaded: "Card downloaded.",
    quickTitle: "Quick Findme", quickDesc: "No questions. We read your JobsDoor360 profile and give you an instant estimate.", quickGo: "Get my instant result →",
    detailedTitle: "Detailed Findme", detailedDesc: "15 to 25 adaptive questions that look at every angle. The most accurate result.", detailedGo: "Start the full quiz →",
    quickReading: "Reading your profile…",
    quickNeedLogin: "Quick Findme uses your saved profile. Please log in first, or take the Detailed Findme (no login needed).",
    quickLoginBtn: "Log in", quickThin: "There isn't enough in your profile yet for a good estimate. The Detailed Findme (15 to 25 questions) will give you a real result.",
  },
  hi: {
    pill: "FREE · SIGN-UP NAHI · LAGBHAG 8 MINUTE",
    h1: "Tum kya banna chahte ho?",
    hero: "Engineer, doctor, dancer, designer, founder, officer, creator... Apni pasand ke mazedaar sawaalon ke jawab do. Har jawab agla sawaal badalta hai, aur end mein tumhari apni career report milegi.",
    startTitle: "Chalo dekhte hain tumhe kya suit karta hai",
    how1: "15 se 25 chhote sawaal. Koi sahi ya galat jawab nahi.",
    how2: "Quiz tumhare hisaab se badalta hai, isliye sabko alag sawaal milte hain.",
    how3: "Careers, exams, skills aur 90 din ke plan wali report. Share karo ya PDF save karo.",
    stageQ: "Tum abhi kahan ho?",
    st_school_8_10: "Class 8 se 10", st_school_11_12: "Class 11 ya 12", st_college: "College mein", st_graduate: "Graduate / job mein",
    resume: "Jahan chhoda tha wahan se shuru", begin: "Shuru karein", seeReport: "Meri pichhli report dekho",
    stageHint: "Pehle batao tum abhi kahan ho, taaki sahi exams aur courses suggest kar sakein.",
    privacy: "Naam ya phone number nahi chahiye. Hum Findme behtar karne ke liye jawab save karte hain, lekin tumhare type kiye shabd kabhi nahi.",
    sdLink: "Insurance, property ya tech mein madad chahiye?", sdLinkA: "Smart Decisions pe jao",
    back: "Peeche", skip: "Ye skip karo", next: "Aage", seeResult: "Meri report dikhao",
    pickOne: "Ek chuno", pickUpTo: (n) => `${n} tak chuno`, picked: (k, n) => `${n} mein se ${k} chune`,
    rankHint: "Drag karo ya arrows se favourite ko upar rakho.", up: "Upar", down: "Neeche",
    sliderHint: "Imaandari se jahan ho wahan slide karo.", openHint: "Ye tumhare device pe hi rehta hai. Hum sirf topic rakhte hain, shabd nahi.",
    or: "ya", building: "Report ban rahi hai…",
    shared: "Card tayyar!", downloaded: "Card download ho gaya.",
    quickTitle: "Quick Findme", quickDesc: "Koi sawaal nahi. Hum tumhari JobsDoor360 profile se turant estimate dete hain.", quickGo: "Turant result do →",
    detailedTitle: "Detailed Findme", detailedDesc: "15 se 25 adaptive sawaal jo har angle dekhte hain. Sabse sahi result.", detailedGo: "Poora quiz shuru karo →",
    quickReading: "Tumhari profile padh rahe hain…",
    quickNeedLogin: "Quick Findme tumhari saved profile use karta hai. Pehle log in karo, ya Detailed Findme karo (login nahi chahiye).",
    quickLoginBtn: "Log in", quickThin: "Abhi tumhari profile mein itna nahi hai ki achha estimate ban sake. Detailed Findme (15 se 25 sawaal) se asli result milega.",
  },
};

let bank = null;
let session = null;
let lang = "en";
let current = null; // question on screen
let draft = null; // answer being built on screen
let restoreFrom = null; // response dropped by "back", used to pre-fill
let busy = false;
let lastReport = null;
let lastMode = "detailed"; // "quick" or "detailed", for the share card and restart
let quickInputs = null; // { score, ranking, stage, facts, priorTop } to re-render quick on language change

const t = (k, ...a) => {
  const v = UI[lang][k] ?? UI.en[k];
  return typeof v === "function" ? v(...a) : v;
};
const qt = (obj, k) => (lang === "hi" && obj[k + "_hi"] ? obj[k + "_hi"] : obj[k]);

function track(name, params) {
  try {
    if (typeof window.jdTrack === "function") window.jdTrack(name, params || {});
  } catch (_) {}
}

// ---------------------------------------------------------------- language
function applyLang() {
  document.documentElement.lang = lang === "hi" ? "hi-Latn" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = UI[lang][el.dataset.i18n];
    if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll(".fm-lang-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  $("fm-lang-mini").textContent = lang === "hi" ? "EN" : "Hinglish";
  $("fm-lang-mini").setAttribute("aria-label", lang === "hi" ? "Switch to English" : "Switch to Hinglish");
  updateResumeButton();
}
function setLang(l) {
  lang = l === "hi" ? "hi" : "en";
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  if (session) {
    session = { ...session, lang };
  }
  applyLang();
  if (current && !$("fm-quiz").classList.contains("sd-hidden")) renderQuestion(current, { keepDraft: true, animate: false });
  // re-render the report in the new language. Detailed rebuilds from the
  // session; quick keeps its last report object (just re-renders it).
  if (lastReport && !$("fm-result").classList.contains("sd-hidden")) {
    if (lastMode === "detailed" && session) showReport();
    else if (lastMode === "quick" && quickInputs) {
      lastReport = buildQuickReport({ ...quickInputs, lang });
      renderReportInto(lastReport);
    } else renderReportInto(lastReport);
  }
}

// ---------------------------------------------------------------- screens
function show(id) {
  for (const s of ["fm-start", "fm-quiz", "fm-result"]) $(s).classList.toggle("sd-hidden", s !== id);
}

function updateResumeButton() {
  const saved = loadLocal();
  const btn = $("fm-resume");
  if (!saved || !saved.session.responses.length) {
    btn.classList.add("sd-hidden");
    return;
  }
  btn.classList.remove("sd-hidden");
  btn.textContent = saved.finished ? t("seeReport") : t("resume");
}

function selectedStage() {
  return document.querySelector('input[name="fm-stage"]:checked')?.value || null;
}

function begin() {
  const stage = selectedStage();
  if (!stage) {
    $("fm-stage-hint").hidden = false;
    document.querySelector('input[name="fm-stage"]').focus();
    return;
  }
  $("fm-stage-hint").hidden = true;
  session = createSession({ stage, lang, bankVersion: bank.version });
  restoreFrom = null;
  lastReport = null;
  lastMode = "detailed";
  track("quiz_start", { quiz_name: "findme", mode: "detailed" });
  ensureUser(); // start anonymous sign-in early, in the background
  syncSession(session, { bankVersion: bank.version });
  show("fm-quiz");
  advance();
}

// ---------------------------------------------------------------- Quick Findme
function quickStatus(html, { showLogin = false, showDetailed = false } = {}) {
  const el = $("fm-quick-status");
  el.hidden = false;
  el.innerHTML =
    `<p>${html}</p>` +
    `<div class="fm-quick-actions">` +
    (showLogin ? `<a class="sd-btn sd-btn-primary" href="/login/?redirect_url=${encodeURIComponent(location.pathname)}" data-ga-name="findme_quick_login">${t("quickLoginBtn")}</a>` : "") +
    (showDetailed ? `<button type="button" class="sd-btn sd-btn-ghost" id="fm-quick-detailed" data-ga-name="findme_quick_detailed">${t("detailedTitle")} →</button>` : "") +
    `</div>`;
  if (showDetailed) $("fm-quick-detailed").addEventListener("click", () => { el.hidden = true; begin(); });
}

async function quickFindme() {
  if (busy) return;
  busy = true;
  const btn = $("fm-quick");
  btn.classList.add("fm-busy");
  $("fm-stage-hint").hidden = true;
  quickStatus(t("quickReading"));
  track("quiz_start", { quiz_name: "findme", mode: "quick" });
  let res;
  try {
    res = await loadProfile();
  } catch (_) {
    res = { signedIn: false, reason: "error" };
  }
  busy = false;
  btn.classList.remove("fm-busy");

  if (!res.signedIn) {
    quickStatus(t("quickNeedLogin"), { showLogin: true, showDetailed: true });
    track("findme_quick_blocked", { reason: res.reason || "no_user" });
    return;
  }
  const ev = profileToEvidence(res.data);
  if (!hasEnoughSignal(ev, res.data)) {
    quickStatus(t("quickThin"), { showDetailed: true });
    track("findme_quick_thin", {});
    return;
  }
  // a previous detailed result gives each of its clusters a direct boost
  if (res.data.prior && Array.isArray(res.data.prior.top)) {
    res.data.prior.top.forEach((tc, i) => {
      const boost = Math.max(0.5, 2 - i * 0.5);
      for (const [d, val] of Object.entries(clusterSeed(tc.key))) {
        ev.sum[d] = (ev.sum[d] || 0) + val * boost;
        ev.exp[d] = (ev.exp[d] || 0) + Math.abs(val) * boost;
      }
    });
  }
  const score = scoreDims(ev.sum, ev.exp);
  const stage = inferStage(res.data);
  quickInputs = { score, ranking: score.ranking, stage, facts: ev.facts, priorTop: res.data.prior?.top || null };
  const report = buildQuickReport({ ...quickInputs, lang });
  $("fm-quick-status").hidden = true;
  lastReport = report;
  lastMode = "quick";
  track("quiz_complete", { quiz_name: "findme", mode: "quick", result: report.clusters[0]?.key });
  renderReportInto(report);
  // save the quick result too (reuses the same store)
  if (report.ok) finishSession({ id: "fmq_" + Date.now().toString(36), lang, stage, startedAt: Date.now(), responses: [], mode: "quick" }, resultSummary(report), { bankVersion: bank.version }).catch(() => {});
}

// A prior detailed result nudges the dims that define that cluster.
function clusterSeed(key) {
  return CLUSTERS[key]?.vector || {};
}

function resume() {
  const saved = loadLocal();
  if (!saved) return;
  session = { ...saved.session, lang };
  restoreFrom = null;
  const radio = document.querySelector(`input[name="fm-stage"][value="${session.stage}"]`);
  if (radio) radio.checked = true;
  track("quiz_resume", { quiz_name: "findme" });
  if (saved.finished) return finish({ alreadySaved: true });
  show("fm-quiz");
  advance();
}

// ---------------------------------------------------------------- flow
function advance() {
  const q = nextQuestion(bank, session);
  if (!q) return finish();
  renderQuestion(q);
}

function submit(value) {
  if (busy || !current) return;
  busy = true;
  const q = current;
  try {
    session = answer(bank, session, q.id, value);
  } catch (err) {
    busy = false;
    return;
  }
  restoreFrom = null;
  // (the click itself is tracked by ga.js via data-ga-* : position + type only)
  syncSession(session, { bankVersion: bank.version, phaseLog: replay(bank, session).phaseLog });
  toast(feedbackFor(q, value));
  setTimeout(() => {
    busy = false;
    advance();
  }, reduceMotion ? 250 : 650);
}

function doSkip() {
  if (busy || !current) return;
  session = skip(bank, session, current.id);
  restoreFrom = null;
  syncSession(session, { bankVersion: bank.version, phaseLog: replay(bank, session).phaseLog });
  toast("");
  advance();
}

function goBack() {
  if (busy) return;
  if (!session.responses.length) {
    show("fm-start");
    current = null;
    return;
  }
  restoreFrom = session.responses[session.responses.length - 1];
  session = back(session);
  syncSession(session, { bankVersion: bank.version, phaseLog: replay(bank, session).phaseLog });
  toast("");
  const q = getQuestion(bank, restoreFrom.qid);
  renderQuestion(q, { direction: "back" });
}

async function finish({ alreadySaved = false } = {}) {
  current = null;
  $("fm-progress-bar").style.width = "100%";
  const report = showReport();
  if (report.ok) {
    track("quiz_complete", { quiz_name: "findme", result: report.clusters[0].key, questions: report.answered });
    if (!alreadySaved) finishSession(session, resultSummary(report), { bankVersion: bank.version });
  }
}

function showReport() {
  const report = buildReport(bank, session, { lang });
  lastReport = report;
  lastMode = "detailed";
  renderReportInto(report);
  return report;
}

// Paint a report (quick or detailed) into the result box and focus it.
function renderReportInto(report) {
  const box = $("fm-result");
  box.innerHTML = renderReportHTML(report);
  show("fm-result");
  window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: reduceMotion ? "auto" : "smooth" });
  $("fm-report-title")?.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- feedback
let toastTimer = null;
function toast(text) {
  const el = $("fm-toast");
  clearTimeout(toastTimer);
  el.textContent = text || "";
  el.classList.toggle("fm-toast-on", !!text);
  if (text) toastTimer = setTimeout(() => el.classList.remove("fm-toast-on"), 2600);
}

function feedbackFor(q, value) {
  if (["scenario", "this_or_that", "image_choice"].includes(q.type)) {
    const o = q.options.find((x) => x.id === value);
    return o ? qt(o, "fb") : "";
  }
  if (q.type === "slider") {
    const s = q.scale;
    if (value >= 0.75) return qt(s, "fb_high");
    if (value <= 0.25) return qt(s, "fb_low");
    return qt(s, "fb_mid");
  }
  return qt(q, "fb");
}

// ---------------------------------------------------------------- rendering
function renderQuestion(q, { keepDraft = false, animate = true, direction = "fwd" } = {}) {
  current = q;
  if (!keepDraft) draft = initialDraft(q);
  const progress = getProgress(bank, session);
  $("fm-phase").textContent = lang === "hi" ? progress.label_hi : progress.label;
  $("fm-progress-bar").style.width = Math.round(progress.fill * 100) + "%";
  $("fm-back").disabled = false;

  const card = $("fm-card");
  const n = session.responses.length + 1;
  const build = () => {
    card.innerHTML = "";
    card.dataset.type = q.type;
    const h = document.createElement("h2");
    h.className = "fm-q";
    h.id = "fm-q";
    h.tabIndex = -1;
    h.textContent = qt(q, "text");
    const hint = document.createElement("p");
    hint.className = "fm-qhint";
    hint.id = "fm-qhint";
    card.append(h, hint);
    const body = document.createElement("div");
    body.className = "fm-body-" + q.type;
    card.append(body);
    RENDER[q.type](q, body, hint, n);
    updateNext();
    h.focus({ preventScroll: true });
  };
  if (!animate || reduceMotion || !card.childElementCount) {
    build();
    return;
  }
  card.classList.remove("fm-enter", "fm-enter-back");
  card.classList.add(direction === "back" ? "fm-leave-back" : "fm-leave");
  setTimeout(() => {
    card.classList.remove("fm-leave", "fm-leave-back");
    build();
    void card.offsetWidth;
    card.classList.add(direction === "back" ? "fm-enter-back" : "fm-enter");
  }, 160);
}

function initialDraft(q) {
  const prev = restoreFrom && restoreFrom.qid === q.id && !restoreFrom.skipped ? restoreFrom.answer : undefined;
  switch (q.type) {
    case "multi_select": return Array.isArray(prev) ? prev.slice() : [];
    case "ranking": return Array.isArray(prev) ? prev.slice() : q.options.map((o) => o.id);
    case "slider": return typeof prev === "number" ? prev : 0.5;
    case "open_short": return { text: "" }; // typed text is never restored or stored
    default: return prev ?? null;
  }
}

function updateNext() {
  const q = current;
  const btn = $("fm-next");
  const single = ["scenario", "this_or_that", "image_choice"].includes(q.type);
  btn.classList.toggle("sd-hidden", single);
  let ok = true;
  if (q.type === "multi_select") ok = draft.length >= (q.min || 1);
  if (q.type === "open_short") ok = draft.text.trim().length >= 2;
  btn.disabled = !ok;
  btn.textContent = t("next");
}

function gaAttrs(el, q, n) {
  // position and type only, never the answer
  el.setAttribute("data-ga-event", "quiz_answer");
  el.setAttribute("data-ga-name", "findme_q" + n);
  el.setAttribute("data-ga-private", "");
  el.setAttribute("data-ga-quiz-name", "findme");
  el.setAttribute("data-ga-question", String(n));
  el.setAttribute("data-ga-qtype", q.type);
}

function optionButton(q, o, n, extraClass = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sd-opt fm-opt " + extraClass;
  b.dataset.id = o.id;
  gaAttrs(b, q, n);
  return b;
}

const RENDER = {
  scenario(q, body, hint, n) {
    hint.textContent = t("pickOne");
    body.setAttribute("role", "group");
    body.setAttribute("aria-labelledby", "fm-q");
    q.options.forEach((o) => {
      const b = optionButton(q, o, n);
      b.textContent = qt(o, "text");
      b.setAttribute("aria-pressed", String(draft === o.id));
      b.addEventListener("click", () => pickSingle(body, o.id));
      body.append(b);
    });
  },
  this_or_that(q, body, hint, n) {
    hint.textContent = t("pickOne");
    body.setAttribute("role", "group");
    body.setAttribute("aria-labelledby", "fm-q");
    q.options.forEach((o, i) => {
      if (i === 1) {
        const or = document.createElement("span");
        or.className = "fm-or";
        or.setAttribute("aria-hidden", "true");
        or.textContent = t("or");
        body.append(or);
      }
      const b = optionButton(q, o, n, "fm-tot");
      b.textContent = qt(o, "text");
      b.setAttribute("aria-pressed", String(draft === o.id));
      b.addEventListener("click", () => pickSingle(body, o.id));
      body.append(b);
    });
  },
  image_choice(q, body, hint, n) {
    hint.textContent = t("pickOne");
    body.setAttribute("role", "group");
    body.setAttribute("aria-labelledby", "fm-q");
    q.options.forEach((o) => {
      const b = optionButton(q, o, n, "fm-img");
      const em = document.createElement("span");
      em.className = "fm-emoji";
      em.setAttribute("aria-hidden", "true");
      em.textContent = o.emoji;
      const lab = document.createElement("span");
      lab.className = "fm-img-label";
      lab.textContent = qt(o, "text");
      b.append(em, lab);
      b.setAttribute("aria-pressed", String(draft === o.id));
      b.addEventListener("click", () => pickSingle(body, o.id));
      body.append(b);
    });
  },
  multi_select(q, body, hint, n) {
    const refresh = () => {
      hint.textContent = `${t("pickUpTo", q.max)} · ${t("picked", draft.length, q.max)}`;
      [...body.children].forEach((b) => {
        const on = draft.includes(b.dataset.id);
        b.setAttribute("aria-pressed", String(on));
        const full = !on && draft.length >= q.max;
        b.classList.toggle("fm-full", full);
        b.setAttribute("aria-disabled", String(full));
      });
      updateNext();
    };
    body.setAttribute("role", "group");
    body.setAttribute("aria-labelledby", "fm-q");
    body.setAttribute("aria-describedby", "fm-qhint");
    q.options.forEach((o) => {
      const b = optionButton(q, o, n, "fm-check");
      b.textContent = qt(o, "text");
      b.addEventListener("click", () => {
        const i = draft.indexOf(o.id);
        if (i >= 0) draft.splice(i, 1);
        else if (draft.length < q.max) draft.push(o.id);
        refresh();
      });
      body.append(b);
    });
    refresh();
  },
  ranking(q, body, hint, n) {
    hint.textContent = t("rankHint");
    const ol = document.createElement("ol");
    ol.className = "fm-rank";
    ol.setAttribute("aria-labelledby", "fm-q");
    ol.setAttribute("aria-describedby", "fm-qhint");
    body.append(ol);
    const live = document.createElement("p");
    live.className = "visually-hidden-h";
    live.setAttribute("aria-live", "polite");
    body.append(live);
    let dragId = null;
    const draw = (focusId, focusDir) => {
      ol.innerHTML = "";
      draft.forEach((id, i) => {
        const o = q.options.find((x) => x.id === id);
        const li = document.createElement("li");
        li.className = "fm-rank-item";
        li.draggable = true;
        li.dataset.id = id;
        const pos = document.createElement("span");
        pos.className = "fm-rank-pos";
        pos.textContent = String(i + 1);
        pos.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.className = "fm-rank-label";
        label.textContent = qt(o, "text");
        const ctr = document.createElement("span");
        ctr.className = "fm-rank-ctrl";
        const mk = (dir, sym, disabled) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "fm-rank-btn";
          b.textContent = sym;
          b.disabled = disabled;
          b.dataset.dir = dir;
          b.setAttribute("aria-label", `${dir === "up" ? t("up") : t("down")}: ${qt(o, "text")}`);
          gaAttrs(b, q, n);
          b.addEventListener("click", () => move(id, dir === "up" ? -1 : 1));
          return b;
        };
        ctr.append(mk("up", "▲", i === 0), mk("down", "▼", i === draft.length - 1));
        li.append(pos, label, ctr);
        li.addEventListener("dragstart", (e) => {
          dragId = id;
          li.classList.add("fm-dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", id);
        });
        li.addEventListener("dragend", () => li.classList.remove("fm-dragging"));
        li.addEventListener("dragover", (e) => e.preventDefault());
        li.addEventListener("drop", (e) => {
          e.preventDefault();
          if (!dragId || dragId === id) return;
          // dragged item takes the drop target's place (works up and down)
          const from = draft.indexOf(dragId);
          const to = draft.indexOf(id);
          draft.splice(from, 1);
          draft.splice(to, 0, dragId);
          dragId = null;
          draw();
        });
        ol.append(li);
      });
      if (focusId) {
        const btn = ol.querySelector(`li[data-id="${focusId}"] button[data-dir="${focusDir}"]`);
        const alt = ol.querySelector(`li[data-id="${focusId}"] button:not(:disabled)`);
        (btn && !btn.disabled ? btn : alt)?.focus();
      }
    };
    const move = (id, delta) => {
      const i = draft.indexOf(id);
      const j = i + delta;
      if (j < 0 || j >= draft.length) return;
      [draft[i], draft[j]] = [draft[j], draft[i]];
      const o = q.options.find((x) => x.id === id);
      live.textContent = `${qt(o, "text")}: ${j + 1}`;
      draw(id, delta < 0 ? "up" : "down");
    };
    draw();
  },
  slider(q, body, hint, n) {
    const s = q.scale;
    const steps = (s.steps || 5) - 1;
    hint.textContent = t("sliderHint");
    const wrap = document.createElement("div");
    wrap.className = "fm-slider";
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = String(steps);
    input.step = "1";
    input.value = String(Math.round(draft * steps));
    input.id = "fm-range";
    input.setAttribute("aria-labelledby", "fm-q");
    gaAttrs(input, q, n);
    const ends = document.createElement("div");
    ends.className = "fm-slider-ends";
    const lo = document.createElement("span");
    lo.textContent = qt(s, "min_label");
    const hi = document.createElement("span");
    hi.textContent = qt(s, "max_label");
    ends.append(lo, hi);
    const val = document.createElement("output");
    val.className = "fm-slider-val";
    val.setAttribute("for", "fm-range");
    const valueText = (v) => (v <= 0.25 ? qt(s, "min_label") : v >= 0.75 ? qt(s, "max_label") : lang === "hi" ? "Beech mein" : "Somewhere in between");
    const sync = () => {
      draft = Number(input.value) / steps;
      input.style.setProperty("--fm-fill", `${draft * 100}%`);
      val.textContent = valueText(draft);
      input.setAttribute("aria-valuetext", valueText(draft));
    };
    input.addEventListener("input", sync);
    sync();
    wrap.append(input, ends, val);
    body.append(wrap);
  },
  open_short(q, body, hint, n) {
    hint.textContent = t("openHint");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "fm-text";
    input.maxLength = 120;
    input.autocomplete = "off";
    input.placeholder = qt(q, "placeholder");
    input.setAttribute("aria-labelledby", "fm-q");
    input.setAttribute("aria-describedby", "fm-qhint");
    input.value = draft.text;
    input.setAttribute("data-ga-ignore", "");
    input.addEventListener("input", () => {
      draft.text = input.value;
      updateNext();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !$("fm-next").disabled) {
        e.preventDefault();
        $("fm-next").click();
      }
    });
    body.append(input);
    setTimeout(() => input.focus({ preventScroll: true }), 50);
  },
};

function pickSingle(body, id) {
  if (busy) return;
  draft = id;
  [...body.querySelectorAll(".fm-opt")].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
  submit(id);
}

function onNext() {
  const q = current;
  if (!q || $("fm-next").disabled) return;
  if (q.type === "open_short") {
    // the raw text never leaves this function: only matched topic tags are kept
    const tags = matchKeywords(bank, draft.text);
    draft = { text: "" };
    return submit({ tags });
  }
  submit(Array.isArray(draft) ? draft.slice() : draft);
}

// ---------------------------------------------------------------- report actions
async function shareCard() {
  if (!lastReport?.ok) return;
  const canvas = drawShareCard(lastReport, document);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  const file = new File([blob], "my-findme-card.png", { type: "image/png" });
  track("share", { method: navigator.canShare ? "native" : "download", content_type: "findme_card" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Findme career match", text: lastReport.summary + " Try yours: https://jobsdoor360.in/findme/" });
      return;
    }
  } catch (err) {
    if (err && err.name === "AbortError") return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-findme-card.png";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  const btn = document.querySelector('[data-fm-action="share"]');
  if (btn) {
    const old = btn.textContent;
    btn.textContent = t("downloaded");
    setTimeout(() => (btn.textContent = old), 2500);
  }
}

function restart() {
  clearLocal();
  session = null;
  current = null;
  lastReport = null;
  quickInputs = null;
  $("fm-result").innerHTML = "";
  if ($("fm-quick-status")) $("fm-quick-status").hidden = true;
  updateResumeButton();
  show("fm-start");
  $("fm-start-title").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  $("fm-quick").focus({ preventScroll: true });
}

// ---------------------------------------------------------------- boot
async function boot() {
  try {
    lang = localStorage.getItem(LANG_KEY) === "hi" ? "hi" : "en";
  } catch (_) {}
  applyLang();
  document.querySelectorAll(".fm-lang-btn").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  $("fm-lang-mini").addEventListener("click", () => setLang(lang === "hi" ? "en" : "hi"));
  document.querySelectorAll('input[name="fm-stage"]').forEach((r) => r.addEventListener("change", () => ($("fm-stage-hint").hidden = true)));
  $("fm-begin").disabled = true;
  try {
    const res = await fetch(`/staticfiles/mainfiles/findme/findme-questions.json?v=${encodeURIComponent(VERSION)}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    bank = await res.json();
  } catch (err) {
    console.warn("Findme: question bank failed to load", err);
    $("fm-load-error").hidden = false;
    return;
  }
  $("fm-begin").disabled = false;
  $("fm-quick").disabled = false;
  $("fm-begin").addEventListener("click", begin);
  $("fm-quick").addEventListener("click", quickFindme);
  $("fm-resume").addEventListener("click", resume);
  $("fm-next").addEventListener("click", onNext);
  $("fm-skip").addEventListener("click", doSkip);
  $("fm-back").addEventListener("click", goBack);
  $("fm-result").addEventListener("click", (e) => {
    const action = e.target.closest("[data-fm-action]")?.dataset.fmAction;
    if (action === "share") shareCard();
    if (action === "pdf") {
      track("findme_pdf", { mode: lastMode });
      window.print();
    }
    if (action === "restart") restart();
    if (action === "detailed") {
      track("findme_quick_to_detailed", {});
      $("fm-result").innerHTML = "";
      begin();
    }
  });
  // PDF: open every "Next steps" panel while printing, then restore
  let closed = [];
  window.addEventListener("beforeprint", () => {
    closed = [...document.querySelectorAll("#fm-result details:not([open])")];
    closed.forEach((d) => (d.open = true));
  });
  window.addEventListener("afterprint", () => closed.forEach((d) => (d.open = false)));
  updateResumeButton();
}

boot();
