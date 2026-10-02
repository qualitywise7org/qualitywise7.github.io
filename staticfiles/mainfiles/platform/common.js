// ============================================================
// Shared helpers for the Smart Decisions / Findme / Counselling pages.
//
// Uses the site's EXISTING Firebase setup (/staticfiles/db/dbconfig.js
// puts auth, db, doc, getDoc, setDoc ... on window). Firebase is treated
// as optional: every wait has a timeout, so quizzes still work if the
// backend is slow or blocked. Results then fall back to localStorage.
//
// Data (unchanged from before):
//   Firestore "smart_profiles/{email}"  one shared profile per user
// ============================================================

export function firebaseReady(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (window.auth && window.db && window.doc && window.getDoc && window.setDoc && window.onAuthStateChanged) {
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 50);
      }
    })();
  });
}

let userPromise = null;
// Signed-in Firebase user, or null (never hangs).
export function getCurrentUser() {
  if (!userPromise) {
    userPromise = (async () => {
      if (!(await firebaseReady())) return null;
      return new Promise((resolve) => {
        let settled = false;
        let unsubscribe = null;
        const done = (user) => {
          if (settled) return;
          settled = true;
          if (typeof unsubscribe === "function") unsubscribe();
          resolve(user || null);
        };
        try {
          unsubscribe = window.onAuthStateChanged(window.auth, done);
        } catch (e) {
          done(null);
        }
        setTimeout(() => done(null), 4000);
      });
    })();
  }
  return userPromise;
}

function saveLocal(payload) {
  try {
    const cached = JSON.parse(localStorage.getItem("smart_profile") || "{}");
    localStorage.setItem("smart_profile", JSON.stringify(Object.assign(cached, payload)));
  } catch (_) {}
}

// Merge a section into the shared profile (Firestore when signed in,
// localStorage otherwise).
export async function saveSmartProfile(email, patch) {
  const payload = Object.assign({}, patch, { updatedAt: new Date().toISOString() });
  if (!email || !(await firebaseReady(1000))) {
    saveLocal(payload);
    return { savedTo: "local" };
  }
  try {
    const ref = window.doc(window.db, "smart_profiles", email);
    await window.setDoc(ref, Object.assign({ email }, payload), { merge: true });
    return { savedTo: "cloud" };
  } catch (err) {
    console.warn("smart profile save failed:", err.message);
    saveLocal(payload);
    return { savedTo: "local", error: err.message };
  }
}

// GA4 event via the shared tracker in ga.js (falls back to gtag).
export function track(eventName, params) {
  try {
    if (typeof window.jdTrack === "function") window.jdTrack(eventName, params || {});
    else if (typeof window.gtag === "function") window.gtag("event", eventName, params || {});
  } catch (_) {}
}

// Login link that brings the user back here afterwards (existing
// ?redirect_url= convention of /login/).
export function loginUrlBack() {
  return "/login/?redirect_url=" + encodeURIComponent(location.pathname);
}

// Quiz helper shared by Findme / Career / IT help: renders a question with
// real <button> options (keyboard accessible) and tracks progress in GA4.
export function createQuiz({ quizName, questions, els, lastLabel, onFinish }) {
  let idx = 0;
  let started = false;
  const answers = [];

  function render() {
    const item = questions[idx];
    els.progress.style.width = `${(idx / questions.length) * 100}%`;
    if (els.step) els.step.textContent = `Question ${idx + 1} of ${questions.length}`;
    els.qText.textContent = item.q;
    els.options.innerHTML = "";
    item.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sd-opt" + (answers[idx] === i ? " selected" : "");
      b.setAttribute("aria-pressed", answers[idx] === i ? "true" : "false");
      b.textContent = opt.text;
      // answers are tracked by position only, never by what was chosen
      b.setAttribute("data-ga-event", "quiz_answer");
      b.setAttribute("data-ga-name", `${quizName}_q${idx + 1}`);
      b.setAttribute("data-ga-private", "");
      b.setAttribute("data-ga-quiz-name", quizName);
      b.setAttribute("data-ga-question", String(idx + 1));
      b.addEventListener("click", () => select(i));
      els.options.appendChild(b);
    });
    els.prevBtn.style.visibility = idx === 0 ? "hidden" : "visible";
    els.nextBtn.textContent = idx === questions.length - 1 ? lastLabel : "Next";
    els.nextBtn.disabled = answers[idx] === undefined;
  }

  function select(i) {
    if (!started) {
      started = true;
      track("quiz_start", { quiz_name: quizName });
    }
    answers[idx] = i;
    [...els.options.children].forEach((c, ci) => {
      c.classList.toggle("selected", ci === i);
      c.setAttribute("aria-pressed", ci === i ? "true" : "false");
    });
    els.nextBtn.disabled = false;
  }

  function next() {
    if (answers[idx] === undefined) return;
    if (idx < questions.length - 1) {
      idx++;
      render();
      els.qText.focus?.();
    } else {
      els.progress.style.width = "100%";
      onFinish(answers.slice());
    }
  }

  function prev() {
    if (idx > 0) {
      idx--;
      render();
    }
  }

  function restart() {
    idx = 0;
    answers.length = 0;
    render();
  }

  els.nextBtn.addEventListener("click", next);
  els.prevBtn.addEventListener("click", prev);
  render();
  return { restart, answers };
}

// Weighted scoring used by the quizzes: sums option weights per key.
export function scoreAnswers(questions, answers, keys) {
  const score = {};
  keys.forEach((k) => (score[k] = 0));
  answers.forEach((choice, qi) => {
    if (choice === undefined) return;
    const w = questions[qi].options[choice].w || {};
    for (const k in w) score[k] = (score[k] || 0) + w[k];
  });
  return score;
}
