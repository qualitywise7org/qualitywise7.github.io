// Admin-only page that seeds the unified `tests` collection from
// /website_data/tests_seed.js (window.tests_seed). No service-account key:
// it uses the normal web SDK and is gated to master_admin via login_roles.
//
// Firebase helpers (auth, db, doc, getDoc, setDoc, collection, serverTimestamp,
// onAuthStateChanged, Timestamp) are globals put on window by dbconfig.js,
// which the (non-platform) footer loads before this module runs.

const gateMsg = document.getElementById("gate-msg");
const panel = document.getElementById("admin-panel");
const preview = document.getElementById("preview");
const seedBtn = document.getElementById("seed-btn");
const logEl = document.getElementById("log");

function log(line) {
  logEl.classList.remove("hidden");
  logEl.textContent += line + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

// serverTimestamp may or may not be exported as a global; fall back to Timestamp.now().
function now() {
  if (typeof window.serverTimestamp === "function") return window.serverTimestamp();
  if (window.Timestamp && typeof window.Timestamp.now === "function") return window.Timestamp.now();
  return new Date();
}

// ---- access gate ----------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    gateMsg.textContent = "Please log in. Redirecting…";
    window.location.href = "/login/";
    return;
  }
  try {
    const roleSnap = await getDoc(doc(db, "login_roles", user.email));
    const role = roleSnap.exists() ? roleSnap.data().role : null;
    if (role !== "master_admin") {
      gateMsg.textContent = "Access denied. This page is for master admins only.";
      return;
    }
    gateMsg.classList.add("hidden");
    panel.classList.remove("hidden");
    await buildPreview();
  } catch (e) {
    console.error(e);
    gateMsg.textContent = "Could not verify access: " + e.message;
  }
});

// ---- preview ---------------------------------------------------------------
const seed = Array.isArray(window.tests_seed) ? window.tests_seed : [];

// Compare only the fields we write, ignoring timestamps, to decide new/diff/same.
function stableShape(t) {
  const { createdAt, updatedAt, ...rest } = t || {};
  return JSON.stringify(rest);
}

async function buildPreview() {
  if (!seed.length) {
    preview.innerHTML = "<p>No seed data found. Did the build copy website_data/tests_seed.js?</p>";
    return;
  }
  preview.innerHTML = "";
  for (const t of seed) {
    const card = document.createElement("div");
    card.className = "seed-card";
    let status = "new";
    try {
      const snap = await getDoc(doc(db, "tests", t.testId));
      if (snap.exists()) {
        const existing = snap.data();
        status = stableShape(stripServer(existing)) === stableShape(normalize(t)) ? "same" : "diff";
      }
    } catch (e) {
      status = "new";
    }
    const qCount = Array.isArray(t.questions) ? t.questions.length : 0;
    const streams = Array.isArray(t.streams) ? t.streams.length : 0;
    card.innerHTML =
      `<h3>${escapeHtml(t.title || t.testId)} <span class="pill ${status}">${status}</span></h3>` +
      `<div class="seed-meta">id: <code>${escapeHtml(t.testId)}</code> · type: ${escapeHtml(t.feature_type)} · ` +
      `${qCount} questions${streams ? " · " + streams + " streams" : ""}${t.payload ? " · full bank payload" : ""}</div>`;
    preview.appendChild(card);
  }
  seedBtn.disabled = false;
}

function stripServer(obj) {
  const { createdAt, updatedAt, ...rest } = obj || {};
  return rest;
}

// The document we actually write (adds bankVersion default + isActive default).
function normalize(t) {
  return {
    testId: t.testId,
    feature_type: t.feature_type,
    title: t.title || t.testId,
    description: t.description || "",
    category: t.category || "",
    lang: t.lang || "en",
    isActive: t.isActive !== false,
    bankVersion: t.bankVersion || "seed",
    config: t.config || {},
    streams: Array.isArray(t.streams) ? t.streams : [],
    questions: Array.isArray(t.questions) ? t.questions : [],
    ...(t.payload ? { payload: t.payload } : {}),
  };
}

// ---- seed ------------------------------------------------------------------
seedBtn.addEventListener("click", async () => {
  seedBtn.disabled = true;
  log(`Seeding ${seed.length} test(s)…`);
  let ok = 0, fail = 0;
  for (const t of seed) {
    try {
      const data = normalize(t);
      data.updatedAt = now();
      // keep createdAt if the doc already exists; otherwise set it
      const existing = await getDoc(doc(db, "tests", t.testId));
      data.createdAt = existing.exists() && existing.data().createdAt ? existing.data().createdAt : now();
      await setDoc(doc(db, "tests", t.testId), data, { merge: true });
      ok++;
      log(`  ✓ ${t.testId} (${t.feature_type})`);
    } catch (e) {
      fail++;
      log(`  ✗ ${t.testId}: ${e.message}`);
    }
  }
  log(`Done. ${ok} written, ${fail} failed.`);
  if (fail === 0) log("All tests seeded. The test and Findme pages will now read from Firestore.");
  await buildPreview();
});

// ---- utils -----------------------------------------------------------------
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
