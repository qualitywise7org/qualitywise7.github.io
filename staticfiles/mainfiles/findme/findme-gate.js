// ============================================================
// Findme report gate: the full report needs a login and a few details.
//
//   Quick Findme     -> preview (top match only)  -> gate -> full report
//   Detailed Findme  -> first half of the report  -> gate -> full report
//
// The gate asks for the details first, then the login:
//   - Continue with Google: a pop-up, the visitor stays on the page.
//   - Log in with email / create an account: goes to /login/ or /signup/ and
//     comes back to /findme/?unlock=1. The details wait in localStorage
//     ("findme_pending_unlock") until then.
// After login, the details and the report are saved to Firestore:
//   findme_users/{uid}       the person (details, consent, counters)
//   findme_reports/{autoId}  one document per report unlocked (analytics)
// plus the existing smart_profiles/{email} merge. If Firestore refuses (rules
// not deployed yet), everything is kept in localStorage, retried on the next
// visit, and the report is still shown.
//
// Pure helpers (validateDetails, buildUserDoc, buildReportDoc ...) have no DOM
// or network access so the Node tests can use them.
// ============================================================

export const GATE_MESSAGE = "Please login and fill the required details just to login and get your report.";
export const GATE_MESSAGE_HI = "Apni report dekhne ke liye login karo aur zaroori details bharo.";
export const CONSENT_VERSION = "2026-10";

const LS_PENDING = "findme_pending_unlock";
const LS_DETAILS = "findme_user_details"; // { [uid]: details }
const LS_UNSYNCED = "findme_unsynced"; // [{ kind, uid, data }]
const LS_UTM = "findme_utm";
const FIRESTORE_SDK = "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
const COMMON = "/staticfiles/mainfiles/platform/common.js?v=20261001";

// ---- the details we ask for --------------------------------------------------
export const STAGE_OPTIONS = [
  ["school_8_10", "Class 8 to 10"],
  ["school_11_12", "Class 11 or 12"],
  ["college", "In college"],
  ["graduate", "Graduated or working"],
];
export const STREAMS = {
  school_8_10: [],
  school_11_12: [
    ["pcm", "Science (PCM)"], ["pcb", "Science (PCB)"], ["pcmb", "Science (PCMB)"], ["commerce", "Commerce"],
    ["arts", "Arts / Humanities"], ["vocational", "Vocational"], ["undecided", "Not decided yet"],
  ],
  college: [
    ["engineering", "Engineering / Technology"], ["medical", "Medical / Health"], ["science", "Science"], ["commerce", "Commerce / Finance"],
    ["management", "Management (BBA, MBA)"], ["arts", "Arts / Humanities"], ["law", "Law"], ["design_media", "Design / Media"], ["other", "Other"],
  ],
};
STREAMS.graduate = STREAMS.college;
export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Outside India",
];

// Indian mobile: 10 digits starting 6-9, with or without +91 / 0 in front.
export function normalizeMobile(raw) {
  let d = String(raw || "").replace(/\D+/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

// Returns { ok, errors: { field: message }, clean }.
export function validateDetails(input = {}) {
  const errors = {};
  const name = String(input.name || "").replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 60 || !/[\p{L}]/u.test(name)) errors.name = "Enter your full name.";
  const mobile = normalizeMobile(input.mobile);
  if (!mobile) errors.mobile = "Enter a 10-digit Indian mobile number.";
  const stage = STAGE_OPTIONS.some(([k]) => k === input.stage) ? input.stage : null;
  if (!stage) errors.stage = "Choose where you are right now.";
  const streams = stage ? STREAMS[stage] : [];
  const stream = streams.length ? (streams.some(([k]) => k === input.stream) ? input.stream : null) : null;
  if (stage && streams.length && !stream) errors.stream = "Choose your stream or field.";
  const state = STATES.includes(input.state) ? input.state : null;
  if (!state) errors.state = "Choose your state.";
  const city = String(input.city || "").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!input.consent) errors.consent = "Please agree so we can save your report.";
  const clean = { name, mobile, stage, stream, state, city, consent: !!input.consent, updates: !!input.updates };
  return { ok: Object.keys(errors).length === 0, errors, clean };
}

export function isComplete(details) {
  return !!details && validateDetails({ ...details, consent: details.consent !== false }).ok;
}

// ---- Firestore document shapes (analytics) ---------------------------------------
export function buildUserDoc({ user, details, report, mode, utm, lang, nowMs }) {
  return {
    uid: user.uid,
    email: user.email || null,
    provider: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || null,
    name: details.name,
    mobile: details.mobile,
    stage: details.stage,
    stream: details.stream || null,
    state: details.state,
    city: details.city || null,
    consent: { report: true, updates: !!details.updates, version: CONSENT_VERSION, atMs: nowMs },
    lang: lang === "hi" ? "hi" : "en",
    utm: utm || null,
    updatedAtMs: nowMs,
    lastReport: report && report.ok ? { mode, top: report.clusters[0].key, match: report.clusters[0].match, atMs: nowMs } : null,
  };
}

export function buildReportDoc({ user, details, report, session, mode, source, accessBefore, gateShownAtMs, utm, lang, bankVersion, device, nowMs }) {
  return {
    uid: user.uid,
    email: user.email || null,
    mode, // "quick" | "detailed"
    source, // "quiz" | "profile"
    accessBefore, // "preview" | "half"
    sessionId: (session && session.id) || null,
    stage: details.stage,
    stream: details.stream || null,
    state: details.state,
    city: details.city || null,
    lang: lang === "hi" ? "hi" : "en",
    bankVersion: bankVersion || null,
    answered: report.answered || 0,
    top: report.clusters.map((c) => ({ key: c.key, match: c.match })),
    riasec: report.riasec.code,
    confidence: report.confidence,
    unlockSeconds: gateShownAtMs ? Math.max(0, Math.round((nowMs - gateShownAtMs) / 1000)) : null,
    device: device || null,
    utm: utm || null,
    createdAtMs: nowMs,
  };
}

// First-touch campaign info (no personal data), kept for analytics.
export function captureUtm(search, store) {
  try {
    if (store.getItem(LS_UTM)) return JSON.parse(store.getItem(LS_UTM));
    const p = new URLSearchParams(search || "");
    const utm = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) if (p.get(k)) utm[k.slice(4)] = p.get(k).slice(0, 80);
    if (!Object.keys(utm).length) return null;
    store.setItem(LS_UTM, JSON.stringify(utm));
    return utm;
  } catch (_) {
    return null;
  }
}

// ---- local storage helpers -----------------------------------------------------
const ls = {
  get(k, fallback = null) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (_) {
      return fallback;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {}
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (_) {}
  },
};
export const pending = {
  get: () => ls.get(LS_PENDING),
  set: (v) => ls.set(LS_PENDING, { ...v, atMs: Date.now() }),
  clear: () => ls.del(LS_PENDING),
};
function localDetails(uid) {
  return (ls.get(LS_DETAILS, {}) || {})[uid] || null;
}
function saveLocalDetails(uid, details) {
  const all = ls.get(LS_DETAILS, {}) || {};
  all[uid] = details;
  ls.set(LS_DETAILS, all);
}

// ---- auth --------------------------------------------------------------------------
function firebaseReady(timeoutMs = 6000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (window.auth && window.onAuthStateChanged && window.db) resolve(true);
      else if (Date.now() - start > timeoutMs) resolve(false);
      else setTimeout(check, 60);
    })();
  });
}
const realUser = (u) => (u && !u.isAnonymous && u.email ? u : null);

// Resolves with the signed-in (non-anonymous) user or null. Never hangs.
export async function currentUser() {
  if (!(await firebaseReady())) return null;
  return new Promise((resolve) => {
    let done = false;
    let unsub = null;
    const finish = (u) => {
      if (done) return;
      done = true;
      if (typeof unsub === "function") unsub();
      resolve(realUser(u));
    };
    try {
      unsub = window.onAuthStateChanged(window.auth, finish);
    } catch (_) {
      finish(null);
    }
    setTimeout(() => finish(window.auth && window.auth.currentUser), 5000);
  });
}

function rememberLogin(user) {
  // same keys the /login/ page sets; other pages read them
  try {
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);
  } catch (_) {}
}

export async function signInWithGoogle() {
  if (!(await firebaseReady())) throw new Error("offline");
  const provider = new window.GoogleAuthProvider();
  const cred = await window.signInWithPopup(window.auth, provider);
  const user = realUser(cred.user);
  if (user) rememberLogin(user);
  return user;
}

export function goToLogin(kind) {
  const back = "/findme/?unlock=1";
  try {
    localStorage.setItem("redirect_url", back); // /login/ and /signup/ read this after login
  } catch (_) {}
  location.href = kind === "signup" ? "/signup/" : "/login/?redirect_url=" + encodeURIComponent(back);
}

// ---- details: Firestore first, then this browser ------------------------------------
export async function loadDetails(user) {
  if (!user) return null;
  try {
    if (await firebaseReady(3000)) {
      const snap = await withTimeout(window.getDoc(window.doc(window.db, "findme_users", user.uid)), 5000);
      if (snap && snap.exists && snap.exists()) {
        const d = snap.data();
        const details = { name: d.name, mobile: d.mobile, stage: d.stage, stream: d.stream, state: d.state, city: d.city, updates: !!(d.consent && d.consent.updates), consent: true };
        saveLocalDetails(user.uid, details);
        return details;
      }
    }
  } catch (_) {
    // rules not deployed yet, offline ... fall back to this browser
  }
  return localDetails(user.uid);
}

// Name/phone from the account profile, to prefill the form (read only).
export async function profileHints(user) {
  if (!user) return {};
  try {
    const snap = await withTimeout(window.getDoc(window.doc(window.db, "user_profile", user.email)), 4000);
    if (!snap || !snap.exists || !snap.exists()) return { name: user.displayName || "" };
    const a = snap.data().about || {};
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ") || a.full_name || user.displayName || "";
    return { name, mobile: a.phone || a.mobile || a.phoneNumber || "" };
  } catch (_) {
    return { name: user.displayName || "" };
  }
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function writeUser(uid, data) {
  let extra = {};
  try {
    const fs = await import(FIRESTORE_SDK);
    extra = { reportsCount: fs.increment(1), updatedAt: fs.serverTimestamp() };
  } catch (_) {}
  const ref = window.doc(window.db, "findme_users", uid);
  // createdAt only on the first write
  let exists = false;
  try {
    const snap = await withTimeout(window.getDoc(ref), 4000);
    exists = !!(snap && snap.exists && snap.exists());
  } catch (_) {}
  const firstSeen = exists ? {} : { createdAt: window.Timestamp ? window.Timestamp.now() : null, createdAtMs: data.updatedAtMs };
  await withTimeout(window.setDoc(ref, { ...data, ...firstSeen, ...extra }, { merge: true }), 8000);
}

async function writeReport(data) {
  const doc = { ...data, createdAt: window.Timestamp ? window.Timestamp.now() : null };
  await withTimeout(window.addDoc(window.collection(window.db, "findme_reports"), doc), 8000);
}

function queue(item) {
  const list = ls.get(LS_UNSYNCED, []) || [];
  list.push(item);
  ls.set(LS_UNSYNCED, list.slice(-20));
}

// Retry anything that couldn't be saved earlier (same user only).
export async function flushUnsynced(user) {
  if (!user || !(await firebaseReady(3000))) return 0;
  const list = ls.get(LS_UNSYNCED, []) || [];
  if (!list.length) return 0;
  const keep = [];
  let sent = 0;
  for (const item of list) {
    if (item.uid !== user.uid) {
      keep.push(item);
      continue;
    }
    try {
      if (item.kind === "user") await writeUser(item.uid, item.data);
      else await writeReport(item.data);
      sent++;
    } catch (_) {
      keep.push(item);
    }
  }
  ls.set(LS_UNSYNCED, keep);
  return sent;
}

// Save the details + this report. Never throws; tells where it went.
export async function saveUnlock(ctx) {
  const nowMs = Date.now();
  const userDoc = buildUserDoc({ ...ctx, nowMs });
  const reportDoc = buildReportDoc({ ...ctx, nowMs });
  saveLocalDetails(ctx.user.uid, { ...ctx.details });
  let savedTo = "cloud";
  try {
    if (!(await firebaseReady(3000))) throw new Error("offline");
    await writeUser(ctx.user.uid, userDoc);
  } catch (err) {
    savedTo = "local";
    queue({ kind: "user", uid: ctx.user.uid, data: userDoc });
    console.info("Findme: details kept on this device (" + (err.code || err.message) + ")");
  }
  try {
    if (savedTo === "local") throw new Error("skipped");
    await writeReport(reportDoc);
  } catch (err) {
    savedTo = "local";
    queue({ kind: "report", uid: ctx.user.uid, data: reportDoc });
  }
  try {
    const common = await import(COMMON);
    await common.saveSmartProfile(ctx.user.email, {
      findme: { top: reportDoc.top, riasec: reportDoc.riasec, mode: reportDoc.mode, completedAt: new Date(nowMs).toISOString() },
      interests: reportDoc.top.slice(0, 3).map((t) => t.key),
    });
  } catch (_) {}
  return { savedTo };
}

// ---- the gate UI -----------------------------------------------------------------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const opt = (list, sel) => list.map(([v, l]) => `<option value="${esc(v)}"${v === sel ? " selected" : ""}>${esc(l)}</option>`).join("");

// Mounts the gate into `el`. opts:
//   lang, mode ("quick" | "detailed"), user (or null), defaults (prefill),
//   onUnlock(details, user) -> called once details are valid AND the user is
//                              logged in (the app then saves and shows the report)
//   track(name, params)
export function mountGate(el, opts) {
  const { lang = "en", mode = "detailed", defaults = {}, track = () => {} } = opts;
  let user = opts.user || null;
  const hi = lang === "hi";
  const d = { stage: null, stream: null, state: null, ...defaults };
  const streamsFor = (stage) => (stage ? STREAMS[stage] || [] : []);

  el.innerHTML = `
    <div class="fm-gate" role="region" aria-labelledby="fm-gate-title">
      <div class="fm-gate-ico" aria-hidden="true"><i class="fa-solid fa-lock"></i></div>
      <h3 id="fm-gate-title">${mode === "quick" ? (hi ? "Tumhari poori report tayyar hai" : "Your full report is ready") : hi ? "Report ka baaki hissa unlock karo" : "Unlock the rest of your report"}</h3>
      <p class="fm-gate-msg">${esc(GATE_MESSAGE)}</p>
      ${hi ? `<p class="fm-gate-sub">${esc(GATE_MESSAGE_HI)}</p>` : ""}
      <form class="fm-gate-form" id="fm-gate-form" novalidate>
        <p class="fm-gate-step"><span>1</span> ${hi ? "Tumhari details" : "Your details"}</p>
        <div class="fm-gf-grid">
          <div class="fm-gf"><label for="fm-g-name">${hi ? "Poora naam" : "Full name"}</label>
            <input id="fm-g-name" name="name" type="text" autocomplete="name" maxlength="60" required value="${esc(d.name || "")}" data-ga-ignore />
            <p class="fm-gf-err" id="fm-g-name-err"></p></div>
          <div class="fm-gf"><label for="fm-g-mobile">${hi ? "Mobile number" : "Mobile number"}</label>
            <div class="fm-gf-tel"><span aria-hidden="true">+91</span><input id="fm-g-mobile" name="mobile" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" required value="${esc(d.mobile || "")}" aria-describedby="fm-g-mobile-err" data-ga-ignore /></div>
            <p class="fm-gf-err" id="fm-g-mobile-err"></p></div>
          <div class="fm-gf"><label for="fm-g-stage">${hi ? "Tum abhi kahan ho" : "Where you are now"}</label>
            <select id="fm-g-stage" name="stage" required data-ga-ignore><option value="">${hi ? "Chuno" : "Choose"}</option>${opt(STAGE_OPTIONS, d.stage)}</select>
            <p class="fm-gf-err" id="fm-g-stage-err"></p></div>
          <div class="fm-gf" id="fm-g-stream-wrap"><label for="fm-g-stream">${hi ? "Stream / field" : "Stream or field"}</label>
            <select id="fm-g-stream" name="stream" data-ga-ignore></select>
            <p class="fm-gf-err" id="fm-g-stream-err"></p></div>
          <div class="fm-gf"><label for="fm-g-state">${hi ? "State" : "State"}</label>
            <select id="fm-g-state" name="state" required autocomplete="address-level1" data-ga-ignore><option value="">${hi ? "Chuno" : "Choose"}</option>${opt(STATES.map((s) => [s, s]), d.state)}</select>
            <p class="fm-gf-err" id="fm-g-state-err"></p></div>
          <div class="fm-gf"><label for="fm-g-city">${hi ? "Shehar (optional)" : "City (optional)"}</label>
            <input id="fm-g-city" name="city" type="text" autocomplete="address-level2" maxlength="60" value="${esc(d.city || "")}" data-ga-ignore /></div>
        </div>
        <label class="fm-gf-check"><input type="checkbox" id="fm-g-consent" name="consent"${d.consent ? " checked" : ""} required />
          <span>${hi ? "Main manta/manti hoon ki JobsDoor360 ye details aur meri Findme report mere account mein save kare," : "I agree that JobsDoor360 can save these details and my Findme report to my account, as in the"} <a href="/privacy/" target="_blank" rel="noopener">${hi ? "Privacy policy" : "Privacy policy"}</a>. ${hi ? "Agar meri umar 18 se kam hai, to mere parent ya guardian bhi sahmat hain." : "If I am under 18, my parent or guardian agrees too."}</span></label>
        <p class="fm-gf-err" id="fm-g-consent-err"></p>
        <label class="fm-gf-check fm-gf-optional"><input type="checkbox" id="fm-g-updates" name="updates"${d.updates ? " checked" : ""} />
          <span>${hi ? "Mujhe WhatsApp pe career tips aur updates bhejo (optional)" : "Send me career tips and updates on WhatsApp (optional)"}</span></label>

        <p class="fm-gate-step"><span>2</span> ${hi ? "Login" : "Log in"}</p>
        <div id="fm-g-auth"></div>
        <p class="fm-gate-status" id="fm-g-status" role="status" aria-live="polite"></p>
      </form>
    </div>`;

  const $ = (id) => el.querySelector("#" + id);
  const form = $("fm-gate-form");

  function fillStreams(stage, selected) {
    const list = streamsFor(stage);
    $("fm-g-stream-wrap").hidden = !list.length;
    $("fm-g-stream").innerHTML = `<option value="">${hi ? "Chuno" : "Choose"}</option>` + opt(list, selected);
    $("fm-g-stream").required = !!list.length;
  }
  fillStreams(d.stage, d.stream);
  $("fm-g-stage").addEventListener("change", () => fillStreams($("fm-g-stage").value, null));

  function renderAuth() {
    const box = $("fm-g-auth");
    if (user) {
      box.innerHTML = `
        <p class="fm-g-who"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${hi ? "Logged in:" : "Logged in as"} <strong>${esc(user.email)}</strong></p>
        <button type="submit" class="sd-btn sd-btn-primary fm-g-main" data-ga-name="findme_gate_submit">${hi ? "Meri poori report dikhao" : "Show my full report"} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`;
    } else {
      box.innerHTML = `
        <button type="submit" class="sd-btn sd-btn-primary fm-g-main fm-g-google" data-method="google" data-ga-name="findme_gate_google"><i class="fa-brands fa-google" aria-hidden="true"></i> ${hi ? "Google se continue karo" : "Continue with Google"}</button>
        <div class="fm-g-alt">
          <button type="submit" class="sd-btn sd-btn-ghost" data-method="email" data-ga-name="findme_gate_email">${hi ? "Email se login" : "Log in with email"}</button>
          <button type="submit" class="fm-g-link" data-method="signup" data-ga-name="findme_gate_signup">${hi ? "Naye ho? Account banao" : "New here? Create an account"}</button>
        </div>
        <p class="fm-g-fine">${hi ? "Email se login karne par tum wapas yahin aaoge, aur tumhari details save rahengi." : "With email, you'll come straight back here and your details will be kept."}</p>`;
    }
  }
  renderAuth();

  const read = () => ({
    name: $("fm-g-name").value,
    mobile: $("fm-g-mobile").value,
    stage: $("fm-g-stage").value,
    stream: $("fm-g-stream").value,
    state: $("fm-g-state").value,
    city: $("fm-g-city").value,
    consent: $("fm-g-consent").checked,
    updates: $("fm-g-updates").checked,
  });
  function showErrors(errors) {
    for (const f of ["name", "mobile", "stage", "stream", "state", "consent"]) {
      const msg = errors[f] || "";
      const box = $("fm-g-" + f + "-err");
      if (box) box.textContent = msg;
      const input = $("fm-g-" + f);
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    const first = ["name", "mobile", "stage", "stream", "state", "consent"].find((f) => errors[f]);
    if (first) $("fm-g-" + first).focus();
  }
  const status = (text) => ($("fm-g-status").textContent = text || "");
  let busy = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    const method = (e.submitter && e.submitter.dataset.method) || (user ? "session" : "google");
    const v = validateDetails(read());
    showErrors(v.errors);
    if (!v.ok) {
      track("findme_gate_invalid", { fields: Object.keys(v.errors).join(",") });
      return;
    }
    busy = true;
    try {
      if (!user) {
        track("findme_unlock_start", { method, mode });
        if (method === "email" || method === "signup") {
          pending.set({ details: v.clean, mode });
          status(hi ? "Login page khul raha hai…" : "Taking you to log in…");
          goToLogin(method);
          return;
        }
        status(hi ? "Google window khul rahi hai…" : "Opening Google…");
        try {
          user = await signInWithGoogle();
        } catch (err) {
          const code = (err && err.code) || "";
          if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
            status(hi ? "Pop-up block ho gaya. Email se login karo." : "The pop-up was blocked. Please use Log in with email.");
          } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
            status(hi ? "Login poora nahi hua. Dobara try karo." : "Login wasn't finished. Please try again.");
          } else {
            status(hi ? "Login nahi ho paaya. Email se try karo." : "We couldn't log you in. Try Log in with email.");
          }
          track("findme_unlock_error", { method, error: code || "failed" });
          return;
        }
        if (!user) return;
        renderAuth();
      }
      status(hi ? "Report save ho rahi hai…" : "Saving your report…");
      await opts.onUnlock(v.clean, user);
    } finally {
      busy = false;
    }
  });

  return {
    setUser(u) {
      user = realUser(u);
      renderAuth();
    },
  };
}
