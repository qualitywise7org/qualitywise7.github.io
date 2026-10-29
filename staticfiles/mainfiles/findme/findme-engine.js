// ============================================================
// Findme adaptive engine. Pure functions: no DOM, no network, so the
// browser and the Node tests run exactly the same logic.
//
// A session is event-sourced: { responses: [{ qid, answer, skipped }] }.
// Every score is rebuilt by replaying the responses, so "back" is just
// "drop the last response".
//
// ---------------------------------------------------------------- algorithm
//
//   state = replay(responses)
//     for each response (skips change nothing except "seen" and the screen count):
//       delta, exposure = evidence(question, answer)
//         single choice : delta = w[chosen] - mean(w[all options])
//         multi select  : sum over picked (w[o] - mean) / #picked
//         ranking       : sum over positions f(i) * (w[o] - mean), f = +1 (top) .. -1 (bottom)
//         slider        : (2v - 1) * w          (v in 0..1)
//         open short    : 0.5 * w of every matched keyword group
//       sum[d] += delta[d]; exposure[d] += max |w[o][d] - mean[d]|
//       unlocked tags   += option unlocks (slider: high / low end)
//       contradiction   : same dim got >= +1.5 and <= -1.5 in single answers
//
//   u[d]     = sum[d] / (exposure[d] + 1)                  normalised dim score
//   conf[d]  = exposure[d] / (exposure[d] + 2)
//   sim[c]   = weighted cosine(u, centred cluster vector c), weight = group weight * conf
//   P        = softmax(sim / T)
//
//   phase    = 1 while answered < 5
//              3 once answered >= 12 and the top 3 is unchanged for 3 answers (or answered >= 18)
//              2 otherwise
//
//   nextQuestion():
//     candidates = unseen questions allowed in this phase
//                  (phase 2 needs `requires` unlocked; phase 3 needs cluster_focus to hit 2 of the top 3)
//                  minus any type already used on the last 2 screens
//     for q in candidates:
//       gain  = H(P) - sum_o p(o | state) * H(P after o)
//               p(o | state) = sum_c P[c] * softmax_o(affinity(o, c))
//       score = gain + unlockBonus + coverageBonus + varietyBonus
//               + tieBreakBonus (q measures a contradicted dim)
//               + focusBonus (phase 3: q pits #1 against #2)
//       phase 1 weights coverage more than gain, so the first 5 stay broad.
//     return argmax score (ties broken by id, so it's deterministic)
//
//   shouldStop():
//     answered >= 25, or screens >= 30, or nothing left to ask
//     or answered >= 15 and phase 3 and >= 2 phase-3 answers
//        and top 3 stable for 3 answers and a clear #1 (P1/P2 >= 1.25 or sim gap >= 0.05)
//
// Skips don't count toward the minimum of 15. Back = drop last response.
// ============================================================

import { CLUSTERS, CLUSTER_KEYS, DIMS, DIM_GROUPS, dimGroup } from "./findme-clusters.js";

export const LIMITS = { minAnswers: 15, maxAnswers: 25, maxScreens: 30, phase1: 5, phase3After: 12, phase3Force: 18 };
// Quick Findme: the same adaptive engine, cut short (about 6 to 8 answers).
export const QUICK_LIMITS = { minAnswers: 6, maxAnswers: 8, maxScreens: 12, phase1: 4, phase3After: 5, phase3Force: 6 };
// A session can carry its own limits (Quick Findme); otherwise the defaults.
const limitsOf = (session) => (session && session.limits ? { ...LIMITS, ...session.limits } : LIMITS);
const T = 0.12; // softmax temperature
const BETA = 0.6; // option-choice sharpness for p(o | cluster)
const SINGLE = ["scenario", "this_or_that", "image_choice"];

// ---- static precomputation ---------------------------------------------------
const GW = Object.fromEntries(DIMS.map((d) => [d, DIM_GROUPS[dimGroup(d)].weight]));
const CENTRED = (() => {
  const mean = {};
  for (const d of DIMS) mean[d] = CLUSTER_KEYS.reduce((s, k) => s + (CLUSTERS[k].vector[d] || 0), 0) / CLUSTER_KEYS.length;
  const out = {};
  for (const k of CLUSTER_KEYS) out[k] = Object.fromEntries(DIMS.map((d) => [d, (CLUSTERS[k].vector[d] || 0) - mean[d]]));
  return out;
})();

const indexCache = new WeakMap();
function index(bank) {
  let ix = indexCache.get(bank);
  if (!ix) {
    ix = { byId: new Map(bank.questions.map((q) => [q.id, q])), meta: new Map() };
    for (const q of bank.questions) {
      if (!q.options) continue;
      const mean = {};
      for (const o of q.options) for (const [d, v] of Object.entries(o.w)) mean[d] = (mean[d] || 0) + v / q.options.length;
      const spread = {};
      for (const d of Object.keys(mean)) spread[d] = Math.max(...q.options.map((o) => Math.abs((o.w[d] || 0) - mean[d])));
      const rel = q.options.map((o) => {
        const r = {};
        for (const d of Object.keys(mean)) {
          const v = (o.w[d] || 0) - mean[d];
          if (Math.abs(v) > 1e-9) r[d] = v;
        }
        return r;
      });
      ix.meta.set(q.id, { mean, spread, rel });
    }
    indexCache.set(bank, ix);
  }
  return ix;
}

export function getQuestion(bank, id) {
  return index(bank).byId.get(id) || null;
}

// ---- keyword matching for open_short (text stays in the browser) ----------
export function matchKeywords(bank, text) {
  const t = " " + String(text || "").toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g, " ") + " ";
  const hits = [];
  for (const g of bank.keywords || []) {
    if (g.match.some((m) => t.includes(" " + m + " "))) hits.push(g.id);
  }
  return hits;
}

// ---- evidence for one answer ---------------------------------------------------
// Returns { delta, exposure, unlocks, valid }.
export function evidence(bank, q, answer) {
  const delta = {};
  const exposure = {};
  const unlocks = new Set();
  const add = (obj, d, v) => (obj[d] = (obj[d] || 0) + v);
  const meta = index(bank).meta.get(q.id);
  const optIdx = (id) => q.options.findIndex((o) => o.id === id);

  if (SINGLE.includes(q.type)) {
    const i = optIdx(answer);
    if (i < 0) return { valid: false };
    for (const [d, v] of Object.entries(meta.rel[i])) add(delta, d, v);
    for (const [d, s] of Object.entries(meta.spread)) add(exposure, d, s);
    q.options[i].unlocks.forEach((t) => unlocks.add(t));
  } else if (q.type === "multi_select") {
    const picked = (Array.isArray(answer) ? answer : []).map(optIdx).filter((i) => i >= 0);
    if (picked.length < (q.min || 1) || picked.length > (q.max || q.options.length)) return { valid: false };
    for (const i of picked) {
      for (const [d, v] of Object.entries(meta.rel[i])) add(delta, d, v / picked.length);
      q.options[i].unlocks.forEach((t) => unlocks.add(t));
    }
    for (const [d, s] of Object.entries(meta.spread)) add(exposure, d, s);
  } else if (q.type === "ranking") {
    const order = (Array.isArray(answer) ? answer : []).map(optIdx);
    const n = q.options.length;
    if (order.length !== n || new Set(order).size !== n || order.some((i) => i < 0)) return { valid: false };
    const f = order.map((_, pos) => (n - 1 - 2 * pos) / (n - 1));
    const norm = f.reduce((s, x) => s + Math.abs(x), 0) / 2;
    order.forEach((i, pos) => {
      for (const [d, v] of Object.entries(meta.rel[i])) add(delta, d, (f[pos] * v) / norm);
    });
    for (const [d, s] of Object.entries(meta.spread)) add(exposure, d, s);
    q.options[order[0]].unlocks.forEach((t) => unlocks.add(t));
  } else if (q.type === "slider") {
    const v = Number(answer);
    if (!Number.isFinite(v) || v < 0 || v > 1) return { valid: false };
    const k = 2 * v - 1;
    for (const [d, w] of Object.entries(q.scale.w)) {
      if (k !== 0) add(delta, d, k * w);
      add(exposure, d, Math.abs(w));
    }
    if (v >= 0.75) q.scale.unlocks_high.forEach((t) => unlocks.add(t));
    if (v <= 0.25) q.scale.unlocks_low.forEach((t) => unlocks.add(t));
  } else if (q.type === "open_short") {
    const tags = Array.isArray(answer?.tags) ? answer.tags : [];
    for (const id of tags) {
      const g = (bank.keywords || []).find((x) => x.id === id);
      if (!g) continue;
      for (const [d, w] of Object.entries(g.w)) {
        add(delta, d, 0.5 * w);
        add(exposure, d, 0.5 * Math.abs(w));
      }
      g.unlocks.forEach((t) => unlocks.add(t));
    }
  } else {
    return { valid: false };
  }
  return { valid: true, delta, exposure, unlocks: [...unlocks] };
}

// ---- scoring ----------------------------------------------------------------------
function normalised(sum, exp) {
  const u = {};
  const conf = {};
  for (const d of DIMS) {
    const e = exp[d] || 0;
    u[d] = (sum[d] || 0) / (e + 1);
    conf[d] = e / (e + 2);
  }
  return { u, conf };
}

function similarities(u, conf) {
  const sims = {};
  let un = 0;
  for (const d of DIMS) un += GW[d] * conf[d] * u[d] * u[d];
  for (const k of CLUSTER_KEYS) {
    const c = CENTRED[k];
    let dot = 0;
    let cn = 0;
    for (const d of DIMS) {
      const w = GW[d] * conf[d];
      if (w === 0) continue;
      dot += w * u[d] * c[d];
      cn += w * c[d] * c[d];
    }
    sims[k] = un > 1e-9 && cn > 1e-9 ? dot / (Math.sqrt(un) * Math.sqrt(cn)) : 0;
  }
  return sims;
}

function softmax(obj, temp) {
  const keys = Object.keys(obj);
  const m = Math.max(...keys.map((k) => obj[k]));
  const ex = keys.map((k) => Math.exp((obj[k] - m) / temp));
  const z = ex.reduce((a, b) => a + b, 0);
  return Object.fromEntries(keys.map((k, i) => [k, ex[i] / z]));
}

function entropy(P) {
  let h = 0;
  for (const p of Object.values(P)) if (p > 0) h -= p * Math.log(p);
  return h;
}

function rankOf(P) {
  return Object.keys(P).sort((a, b) => P[b] - P[a] || (a < b ? -1 : 1));
}

function scoreFrom(sum, exp) {
  const { u, conf } = normalised(sum, exp);
  const sims = similarities(u, conf);
  const P = softmax(sims, T);
  return { u, conf, sims, P, order: rankOf(P) };
}

// How much one answer's evidence pushed towards a cluster (used by the
// report to quote the user's own answers as reasons).
export function clusterAffinity(delta, key) {
  let a = 0;
  for (const [d, v] of Object.entries(delta || {})) a += (GW[d] || 0) * v * (CENTRED[key]?.[d] || 0);
  return a;
}

// match % shown to users: similarity mapped to a friendly 0-100 scale
export function matchPercent(sim) {
  return Math.round(Math.max(5, Math.min(97, 50 + 55 * sim)));
}

// Build a score straight from dimension evidence, without any quiz
// responses. Used by Quick Findme, which maps an account profile to
// { sum, exp } and then reuses the exact same scoring and ranking.
// Returns the same shape a replayed session's score has.
export function scoreDims(sum, exp) {
  const score = scoreFrom(sum || {}, exp || {});
  return {
    ...score,
    ranking: score.order.map((key) => ({ key, sim: score.sims[key], p: score.P[key], match: matchPercent(score.sims[key]) })),
  };
}

// ---- replay -------------------------------------------------------------------------
const replayCache = new WeakMap();

export function replay(bank, session) {
  const cached = replayCache.get(session.responses);
  if (cached && cached.bank === bank) return cached.state;
  const s = {
    sum: {}, exp: {}, unlocked: new Set(), seen: new Set(), types: [],
    answered: 0, screens: 0, phase3Answered: 0,
    maxPos: {}, maxNeg: {}, contradictions: [], tieBroken: new Set(),
    topHistory: [], phase: 1, phaseLog: [{ phase: 1, atQuestion: 1 }], cites: [],
    limits: limitsOf(session),
  };
  let score = scoreFrom(s.sum, s.exp);
  for (const r of session.responses) {
    const q = getQuestion(bank, r.qid);
    if (!q) continue;
    s.seen.add(q.id);
    s.screens++;
    s.types.push(q.type);
    if (r.skipped) continue;
    const ev = evidence(bank, q, r.answer);
    if (!ev.valid) continue;
    // an answer that measures an already-contradicted dim acts as its tie-break
    for (const d of s.contradictions) if ((ev.exposure[d] || 0) > 0) s.tieBroken.add(d);
    for (const [d, v] of Object.entries(ev.delta)) {
      s.sum[d] = (s.sum[d] || 0) + v;
      s.maxPos[d] = Math.max(s.maxPos[d] || 0, v);
      s.maxNeg[d] = Math.min(s.maxNeg[d] || 0, v);
      if (s.maxPos[d] >= 1.5 && s.maxNeg[d] <= -1.5 && !s.contradictions.includes(d)) s.contradictions.push(d);
    }
    for (const [d, v] of Object.entries(ev.exposure)) s.exp[d] = (s.exp[d] || 0) + v;
    ev.unlocks.forEach((t) => s.unlocked.add(t));
    s.answered++;
    if (q.phase === 3) s.phase3Answered++;
    s.cites.push({ qid: q.id, answer: r.answer, delta: ev.delta });
    score = scoreFrom(s.sum, s.exp);
    // stability = same #1 and same #2 (the #3 slot is often a noisy near-tie)
    s.topHistory.push(score.order.slice(0, 2).join(">"));
    const next = phaseFor(s);
    if (next !== s.phase) {
      s.phase = next;
      s.phaseLog.push({ phase: next, atQuestion: s.answered + 1 });
    }
  }
  s.score = score;
  replayCache.set(session.responses, { bank, state: s });
  return s;
}

function topStable(s, n = 3) {
  const h = s.topHistory;
  if (h.length < n) return false;
  const last = h.slice(-n);
  return last.every((x) => x === last[0]);
}

function phaseFor(s) {
  if (s.phase === 3) return 3; // sticky
  const L = s.limits || LIMITS;
  if (s.answered < L.phase1) return 1;
  if (s.answered >= L.phase3Force) return 3;
  if (s.answered >= L.phase3After && topStable(s)) return 3;
  return 2;
}

// ---- public session API (immutable: every call returns a new session) ------------
export function createSession({ id, stage = null, lang = "en", bankVersion = null, mode = "detailed", now = Date.now() } = {}) {
  const session = {
    id: id || "fm_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 8),
    stage, lang, bankVersion, mode, startedAt: now, responses: [],
  };
  if (mode === "quick") session.limits = { ...QUICK_LIMITS };
  return session;
}

export function answer(bank, session, qid, value, atMs = Date.now()) {
  const q = getQuestion(bank, qid);
  if (!q) throw new Error("unknown question " + qid);
  if (!evidence(bank, q, value).valid) throw new Error("invalid answer for " + qid);
  const phase = replay(bank, session).phase;
  return { ...session, responses: [...session.responses, { qid, type: q.type, phase, answer: value, skipped: false, atMs }] };
}

export function skip(bank, session, qid, atMs = Date.now()) {
  const q = getQuestion(bank, qid);
  if (!q) throw new Error("unknown question " + qid);
  const phase = replay(bank, session).phase;
  return { ...session, responses: [...session.responses, { qid, type: q.type, phase, answer: null, skipped: true, atMs }] };
}

export function back(session) {
  if (!session.responses.length) return session;
  return { ...session, responses: session.responses.slice(0, -1) };
}

export function getScores(bank, session) {
  const s = replay(bank, session);
  return {
    dims: s.score.u, conf: s.score.conf, sims: s.score.sims, probs: s.score.P,
    answered: s.answered, screens: s.screens, phase: s.phase, phaseLog: s.phaseLog,
    mixedSignals: [...s.contradictions], unlocked: [...s.unlocked],
  };
}

export function getRanking(bank, session) {
  const s = replay(bank, session);
  return s.score.order.map((key) => ({ key, sim: s.score.sims[key], p: s.score.P[key], match: matchPercent(s.score.sims[key]) }));
}

// How sure we are, 0..1 (drives the vague progress bar, never shows a total).
export function getProgress(bank, session) {
  const s = replay(bank, session);
  const [a, b] = s.score.order;
  const ratio = s.score.P[b] > 0 ? s.score.P[a] / s.score.P[b] : 1;
  const certainty = Math.min(1, Math.max(0, (ratio - 1) / 0.6));
  const confidence = Math.min(1, 0.6 * Math.min(1, s.answered / s.limits.minAnswers) + 0.4 * certainty * Math.min(1, s.answered / 10));
  const fill = Math.min(0.97, 0.7 * (s.answered / s.limits.maxAnswers) + 0.3 * confidence + (s.phase === 3 ? 0.1 : 0));
  const label = { 1: "Getting to know you", 2: "Going deeper", 3: "Almost there" }[s.phase];
  const label_hi = { 1: "Tumhe jaan rahe hain", 2: "Aur gehrai mein", 3: "Bas thoda aur" }[s.phase];
  return { phase: s.phase, label, label_hi, fill, confidence };
}

export function shouldStop(bank, session) {
  const s = replay(bank, session);
  const L = s.limits;
  if (s.answered >= L.maxAnswers || s.screens >= L.maxScreens) return true;
  if (s.answered >= L.minAnswers && s.phase === 3 && s.phase3Answered >= 2 && topStable(s)) {
    const [a, b] = s.score.order;
    const clear = s.score.P[a] / s.score.P[b] >= 1.25 || s.score.sims[a] - s.score.sims[b] >= 0.05;
    if (clear) return true;
  }
  return candidates(bank, s).length === 0;
}

// ---- selection ------------------------------------------------------------------------
function candidates(bank, s) {
  const top3 = s.score.order.slice(0, 3);
  const lastTwo = s.types.slice(-2);
  const banned = lastTwo.length === 2 && lastTwo[0] === lastTwo[1] ? lastTwo[0] : null;
  // open text: at most 3 per session, never within 4 screens of another
  const openCount = s.types.filter((t) => t === "open_short").length;
  // (the short Quick Findme run has no typed answers, to stay about a minute)
  const openBlocked = openCount >= 3 || s.types.slice(-4).includes("open_short") || s.screens === 0 || s.limits.maxAnswers <= 10;
  const allowed = (q) => {
    if (s.seen.has(q.id)) return false;
    if (q.type === "open_short" && openBlocked) return false;
    if (s.screens === 0 && bank.questions.some((x) => x.opener)) return !!q.opener;
    if (q.requires && !q.requires.some((t) => s.unlocked.has(t))) return false;
    const focusHits = (q.cluster_focus || []).filter((c) => top3.includes(c)).length;
    if (s.phase === 1) return q.phase === 1;
    if (s.phase === 2) return q.phase === 1 || q.phase === 2 || (q.phase === 3 && s.answered >= 8 && focusHits >= 2);
    return q.phase === 3 ? focusHits >= 2 : true;
  };
  const open = (q) => !s.seen.has(q.id) && (!q.requires || q.requires.some((t) => s.unlocked.has(t))) && !(q.type === "open_short" && openBlocked);
  let list = bank.questions.filter(allowed);
  // a contradicted dim may be re-measured by any reachable question, whatever the phase
  const pending = s.contradictions.filter((d) => !s.tieBroken.has(d));
  if (pending.length) {
    const ids = new Set(list.map((q) => q.id));
    for (const q of bank.questions) if (!ids.has(q.id) && q.phase !== 3 && q.type !== "open_short" && open(q) && pending.some((d) => q.dims.includes(d))) list.push(q);
  }
  // phase 3 with no matching confirmation question left: fall back to anything unseen
  if (s.phase === 3 && !list.some((q) => q.phase === 3)) list = bank.questions.filter((q) => open(q) && q.phase !== 3);
  // ran out (e.g. lots of skips in phase 1): widen to anything reachable
  if (!list.length) list = bank.questions.filter((q) => open(q) && q.phase !== 3);
  if (!list.length) list = bank.questions.filter(open);
  const typed = list.filter((q) => q.type !== banned);
  return typed.length ? typed : list;
}

// Possible outcomes of a question, each { delta, exposure } (for expected gain).
function outcomes(bank, q) {
  if (q.type === "open_short") return [];
  if (q.type === "slider") {
    return [0, 0.5, 1].map((v) => evidence(bank, q, v));
  }
  const meta = index(bank).meta.get(q.id);
  return q.options.map((_, i) => ({ delta: meta.rel[i], exposure: meta.spread }));
}

function expectedGain(bank, q, s) {
  const outs = outcomes(bank, q);
  if (!outs.length) return 0;
  const P = s.score.P;
  const H0 = entropy(P);
  // p(o | cluster): softmax over options of affinity(o, c)
  const pO = new Array(outs.length).fill(0);
  for (const k of CLUSTER_KEYS) {
    const aff = outs.map((o) => {
      let a = 0;
      for (const [d, v] of Object.entries(o.delta)) a += GW[d] * v * CENTRED[k][d];
      return BETA * a;
    });
    const m = Math.max(...aff);
    const ex = aff.map((x) => Math.exp(x - m));
    const z = ex.reduce((x, y) => x + y, 0);
    ex.forEach((e, i) => (pO[i] += P[k] * (e / z)));
  }
  let EH = 0;
  outs.forEach((o, i) => {
    const sum = { ...s.sum };
    const exp = { ...s.exp };
    for (const [d, v] of Object.entries(o.delta)) sum[d] = (sum[d] || 0) + v;
    for (const [d, v] of Object.entries(o.exposure)) exp[d] = (exp[d] || 0) + v;
    EH += pO[i] * entropy(scoreFrom(sum, exp).P);
  });
  return H0 - EH;
}

export function scoreCandidates(bank, session) {
  const s = replay(bank, session);
  const [c1, c2] = s.score.order;
  const top3 = s.score.order.slice(0, 3);
  const recent = s.types.slice(-4);
  // a contradiction is resolved once a later answered question measured that dim
  const pendingTie = s.contradictions.filter((d) => !s.tieBroken.has(d));
  return candidates(bank, s).map((q) => {
    const gain = expectedGain(bank, q, s);
    const tagHits = [...q.tags, ...(q.requires || [])].filter((t) => s.unlocked.has(t));
    const unlockBonus = Math.min(0.12, 0.04 * new Set(tagHits).size);
    let coverage = 0;
    // open text can't promise coverage (we don't know what they'll type)
    if (q.type !== "open_short") for (const d of q.dims) if (s.score.conf[d] < 0.3) coverage += 0.012 * GW[d];
    coverage = Math.min(0.06, coverage);
    const varietyBonus = recent.includes(q.type) ? 0 : 0.03;
    const tieBreakBonus = pendingTie.some((d) => q.dims.includes(d) && q.type !== "open_short") ? 0.3 : 0;
    let focusBonus = 0;
    if (q.cluster_focus) {
      const hits = q.cluster_focus.filter((c) => top3.includes(c)).length;
      if (q.cluster_focus.includes(c1) && q.cluster_focus.includes(c2)) focusBonus = 0.15;
      else if (hits >= 2) focusBonus = 0.07;
      if (s.phase !== 3) focusBonus /= 2;
    }
    const openPenalty = q.type === "open_short" && s.phase !== 1 ? -0.02 : 0;
    const score = s.phase === 1
      ? 0.5 * gain + 3 * coverage + varietyBonus + tieBreakBonus
      : gain + unlockBonus + coverage + varietyBonus + tieBreakBonus + focusBonus + openPenalty;
    return { id: q.id, score, gain, unlockBonus, coverage, varietyBonus, tieBreakBonus, focusBonus };
  }).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
}

export function nextQuestion(bank, session) {
  if (shouldStop(bank, session)) return null;
  const ranked = scoreCandidates(bank, session);
  return ranked.length ? getQuestion(bank, ranked[0].id) : null;
}
