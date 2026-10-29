// ============================================================
// Findme storage.
//   Firestore  findme_sessions/{sessionId}   every session + every answer
//   Firestore  smart_profiles/{email}        final result (signed-in users, via common.js)
//   localStorage "findme_session"            save/resume, and the fallback
//
// Visitors who aren't signed in get a Firebase ANONYMOUS user, so each
// session document carries a uid that the security rule can check:
//   allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
//   allow update: if request.auth != null && resource.data.uid == request.auth.uid
//                 && request.resource.data.uid == request.auth.uid;
//   allow read, delete: if false;
// Until the owner adds that rule and enables the Anonymous provider, writes
// fail quietly and everything stays in localStorage. The quiz never breaks.
//
// Raw open-text answers are never stored anywhere: responses only carry the
// matched keyword tags.
// ============================================================

const LOCAL_KEY = "findme_session";
const COLLECTION = "findme_sessions";
const COMMON = "/staticfiles/mainfiles/platform/common.js?v=20261001";
const AUTH_SDK = "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// ---- pure: the Firestore document (tested in Node) ------------------------------
export function buildSessionDoc(session, { uid, email = null, status = "in_progress", result = null, bankVersion = null, phaseLog = [], now = Date.now() } = {}) {
  const docData = {
    sessionId: session.id,
    uid,
    email: email || null,
    status,
    lang: session.lang === "hi" ? "hi" : "en",
    stage: session.stage || null,
    bankVersion: bankVersion || session.bankVersion || null,
    startedAtMs: session.startedAt,
    updatedAtMs: now,
    responses: session.responses.map((r) => ({
      qid: r.qid,
      type: r.type,
      phase: r.phase ?? null,
      skipped: !!r.skipped,
      atMs: r.atMs ?? null,
      answer: r.skipped ? null : safeAnswer(r),
    })),
    phaseLog: (phaseLog || []).map((p) => ({ phase: p.phase, atQuestion: p.atQuestion })),
  };
  if (result) {
    docData.result = result;
    docData.finishedAtMs = now;
  }
  return docData;
}

// Only derived values go out: option ids, numbers, keyword tags.
function safeAnswer(r) {
  const a = r.answer;
  if (r.type === "open_short") return { tags: Array.isArray(a?.tags) ? a.tags.filter((t) => typeof t === "string") : [] };
  if (Array.isArray(a)) return a.map(String);
  if (typeof a === "number") return a;
  return a == null ? null : String(a);
}

// ---- localStorage -------------------------------------------------------------------
export function saveLocal(session, extra = {}) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...extra, session, savedAt: Date.now() }));
    return true;
  } catch (_) {
    return false;
  }
}
export function loadLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    return raw && raw.session && Array.isArray(raw.session.responses) ? raw : null;
  } catch (_) {
    return null;
  }
}
export function clearLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch (_) {}
}

// ---- Firebase -------------------------------------------------------------------------
const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(label + " timed out")), ms))]);

let userPromise = null;
let remoteOff = false; // set after a permission error, so we stop retrying every answer
let lastNote = "";

function note(msg) {
  if (msg !== lastNote) console.info("Findme: " + msg);
  lastNote = msg;
}

// Signed-in user, or a new anonymous one. Resolves null if Firebase is unavailable.
export function ensureUser() {
  if (!userPromise) {
    userPromise = (async () => {
      try {
        const common = await import(COMMON);
        if (!(await common.firebaseReady(4000))) return null;
        const existing = await common.getCurrentUser();
        if (existing) return existing;
        const { signInAnonymously } = await import(AUTH_SDK);
        const cred = await withTimeout(signInAnonymously(window.auth), 6000, "anonymous sign-in");
        return cred.user || null;
      } catch (err) {
        note("saved locally (sign-in unavailable: " + (err.code || err.message) + ")");
        return null;
      }
    })();
  }
  return userPromise;
}

async function writeRemote(session, opts) {
  if (remoteOff) return { savedTo: "local" };
  const user = await ensureUser();
  if (!user || !window.db || !window.doc || !window.setDoc) {
    note("saved locally");
    return { savedTo: "local" };
  }
  try {
    const data = buildSessionDoc(session, { ...opts, uid: user.uid, email: user.isAnonymous ? null : user.email });
    if (window.Timestamp) {
      data.startedAt = window.Timestamp.fromMillis(data.startedAtMs);
      data.updatedAt = window.Timestamp.now();
      if (data.finishedAtMs) data.finishedAt = window.Timestamp.fromMillis(data.finishedAtMs);
    }
    await withTimeout(window.setDoc(window.doc(window.db, COLLECTION, session.id), data, { merge: true }), 8000, "Firestore write");
    note("saved to findme_sessions");
    return { savedTo: "cloud" };
  } catch (err) {
    if (err && (err.code === "permission-denied" || /permission/i.test(err.message || ""))) remoteOff = true;
    note("saved locally (" + (err.code || err.message) + ")");
    return { savedTo: "local", error: err.code || err.message };
  }
}

// Debounced sync after each answer; finish() always writes immediately.
let timer = null;
let pending = null;
export function syncSession(session, opts = {}) {
  saveLocal(session);
  pending = { session, opts };
  clearTimeout(timer);
  timer = setTimeout(() => {
    const p = pending;
    pending = null;
    if (p) writeRemote(p.session, { status: "in_progress", ...p.opts });
  }, 800);
}

export async function finishSession(session, summary, { bankVersion } = {}) {
  clearTimeout(timer);
  pending = null;
  saveLocal(session, { finished: true, result: summary });
  const remote = await writeRemote(session, { status: "finished", result: summary, bankVersion });
  try {
    const common = await import(COMMON);
    const user = await ensureUser();
    const email = user && !user.isAnonymous ? user.email : null;
    const interests = summary.top.slice(0, 3).map((t) => t.key);
    await common.saveSmartProfile(email, {
      findme: { top: summary.top, riasec: summary.riasec, completedAt: new Date().toISOString(), sessionId: session.id },
      interests,
    });
  } catch (_) {}
  return remote;
}
