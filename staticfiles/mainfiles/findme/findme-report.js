// ============================================================
// Findme report: builds the report data from a finished session, renders
// it to HTML (a string, so Node tests can check it) and draws the share
// card (browser only).
// ============================================================
import { CLUSTERS, DIM_INFO, DIM_GROUPS, PRODUCTS, STAGES, SCHOOL_STAGES } from "./findme-clusters.js";
import { replay, getRanking, getQuestion, clusterAffinity } from "./findme-engine.js";

// friendly names for open-text keyword groups (the raw text is never kept)
const KEYWORD_LABELS = {
  tech: "coding and tech", science: "science", health: "health and medicine", dance: "dance", music: "music",
  acting: "acting", sport: "sport and fitness", art: "art and design", media: "videos and writing",
  business: "business", finance: "money and finance", public: "public service and law", people: "helping people",
  hands: "fixing and building things", nature: "nature",
};

export const MIN_FOR_REPORT = 5;
const MAX_PRODUCTS = 7;

export const CAVEAT = "Findme is guidance, not a verdict. It reflects what you told us today about your interests, personality and values. It is not an aptitude, IQ or medical test. People change, and many careers mix several of these areas, so use this as a starting point and talk it over with people you trust.";
export const CAVEAT_HI = "Findme ek salah hai, faisla nahi. Ye sirf aaj ke tumhare jawabon par based hai. Ye aptitude, IQ ya medical test nahi hai. Ise ek shuruaat samjho aur apne bharose ke logon se baat karo.";

const T = {
  en: {
    title: "Your Findme report", top: "Your top career areas", why: "Why this fits you", roles: "Roles to explore",
    nextSteps: "Next steps in India", exams: "Exams and entrances", courses: "Courses", skills: "Skills to build",
    plan: "Your 30-60-90 day plan", d30: "First 30 days", d60: "Days 31-60", d90: "Days 61-90",
    personality: "Your personality and strengths", riasec: "Your interest code", traits: "Key traits", talents: "Natural strengths",
    values: "What you value", workStyle: "Your work style", also: "Also consider", products: "Helpful next steps from JobsDoor360",
    mixed: "Mixed signals", caveat: "A quick note", ikigai: "Your ikigai snapshot",
    love: "What you love", good: "What you're good at", needs: "What you care about", paid: "Where it can pay",
    share: "Share my card", pdf: "Save as PDF", restart: "Take it again", nonTrad: "different path",
    smart: "Need help with insurance, property or tech instead?", smartLink: "Go to Smart Decisions",
    insufficient: "We need a few more answers to build your report.",
    quickBadge: "Quick estimate", quickNote: "This is a fast read based only on what's already in your profile. For a result that looks at every angle, take the full Detailed Findme.",
    goDetailed: "Take the Detailed Findme", quickReasonsHead: "Based on your profile",
    previewTitle: "Your Findme preview", halfTitle: "Your Findme report (first half)", previewTop: "Your top match",
    moreMatches: (n) => `${n} more career ${n === 1 ? "match is" : "matches are"} in your full report.`,
    lockedTitle: "In your full report",
    lockedPreview: ["All your top career matches, with reasons", "Your personality, strengths and values", "Roles to explore, including new-age careers", "Exams, courses and skills for India", "Your 30-60-90 day plan"],
    lockedHalf: ["Roles to explore for each career area", "Exams, courses and skills for India", "Your ikigai snapshot", "Your 30-60-90 day plan", "Surprising matches to also consider", "Share card and PDF"],
  },
  hi: {
    title: "Tumhari Findme report", top: "Tumhare top career areas", why: "Ye tumhe kyun suit karta hai", roles: "Explore karne layak roles",
    nextSteps: "India mein agle kadam", exams: "Exams aur entrances", courses: "Courses", skills: "Ye skills banao",
    plan: "Tumhara 30-60-90 din ka plan", d30: "Pehle 30 din", d60: "Din 31-60", d90: "Din 61-90",
    personality: "Tumhari personality aur strengths", riasec: "Tumhara interest code", traits: "Khaas baatein", talents: "Natural strengths",
    values: "Tumhare liye kya zaroori hai", workStyle: "Tumhara kaam karne ka style", also: "Ye bhi socho", products: "JobsDoor360 se madad",
    mixed: "Mixed signals", caveat: "Ek zaroori baat", ikigai: "Tumhara ikigai snapshot",
    love: "Jo pasand hai", good: "Jisme achhe ho", needs: "Jiski parwah hai", paid: "Jahan kamaai hai",
    share: "Card share karo", pdf: "PDF save karo", restart: "Dobara karo", nonTrad: "alag raasta",
    smart: "Insurance, property ya tech mein madad chahiye?", smartLink: "Smart Decisions pe jao",
    insufficient: "Report banane ke liye thode aur jawab chahiye.",
    quickBadge: "Quick estimate", quickNote: "Ye sirf tumhari profile se banaya gaya jaldi wala result hai. Har angle dekhne wale result ke liye poora Detailed Findme karo.",
    goDetailed: "Detailed Findme karo", quickReasonsHead: "Tumhari profile se",
    previewTitle: "Tumhara Findme preview", halfTitle: "Tumhari Findme report (pehla hissa)", previewTop: "Tumhara top match",
    moreMatches: (n) => `${n} aur career match tumhari poori report mein hain.`,
    lockedTitle: "Poori report mein",
    lockedPreview: ["Saare top career matches, wajah ke saath", "Tumhari personality, strengths aur values", "Explore karne layak roles, naye careers bhi", "India ke exams, courses aur skills", "Tumhara 30-60-90 din ka plan"],
    lockedHalf: ["Har career area ke roles", "India ke exams, courses aur skills", "Tumhara ikigai snapshot", "Tumhara 30-60-90 din ka plan", "Ye bhi socho: surprising matches", "Share card aur PDF"],
  },
};
export const strings = (lang) => T[lang === "hi" ? "hi" : "en"];

const RIASEC = DIM_GROUPS.riasec.dims;
const BIG5 = DIM_GROUPS.big5.dims;
const TALENTS = DIM_GROUPS.talent.dims;
const VALUES = DIM_GROUPS.values.dims;

// ---- quoting the user's own answers --------------------------------------------
function describeAnswer(bank, q, answer, lang) {
  const hi = lang === "hi";
  const txt = (o) => (hi && o.text_hi ? o.text_hi : o.text);
  const opt = (id) => q.options?.find((o) => o.id === id);
  if (["scenario", "this_or_that", "image_choice"].includes(q.type)) {
    const o = opt(answer);
    return o ? `${hi ? "Tumne chuna" : "You picked"} “${txt(o)}”` : null;
  }
  if (q.type === "multi_select") {
    const picked = (answer || []).map(opt).filter(Boolean).map(txt);
    return picked.length ? `${hi ? "Tumne chuna" : "You chose"} “${picked.join("”, “")}”` : null;
  }
  if (q.type === "ranking") {
    const o = opt(answer?.[0]);
    return o ? `${hi ? "Tumne sabse upar rakha" : "You ranked"} “${txt(o)}” ${hi ? "" : "first"}`.trim() : null;
  }
  if (q.type === "slider") {
    const s = q.scale;
    if (answer >= 0.75) return `${hi ? "Tumne kaha" : "You said"} “${hi ? s.max_label_hi : s.max_label}”`;
    if (answer <= 0.25) return `${hi ? "Tumne kaha" : "You said"} “${hi ? s.min_label_hi : s.min_label}”`;
    return null;
  }
  if (q.type === "open_short") {
    const tags = (answer?.tags || []).map((x) => KEYWORD_LABELS[x] || x);
    return tags.length ? (hi ? `Tumne apne shabdon mein ${tags.join(", ")} ka zikr kiya` : `In your own words you mentioned ${tags.join(", ")}`) : null;
  }
  return null;
}

// Picks the answers that point to THIS cluster more than to the others shown,
// so each cluster quotes different answers. `used` stops reuse across clusters.
function reasonsFor(bank, state, key, others, used, lang, max = 3) {
  const toReason = (c) => {
    const q = getQuestion(bank, c.qid);
    const said = q && describeAnswer(bank, q, c.answer, lang);
    return said ? { qid: c.qid, question: lang === "hi" ? q.text_hi : q.text, said } : null;
  };
  const scored = state.cites.map((c) => {
    const a = clusterAffinity(c.delta, key);
    const rival = Math.max(0, ...others.map((k) => clusterAffinity(c.delta, k)));
    return { c, a, specific: a - 0.8 * rival };
  });
  let picks = scored.filter((x) => x.a > 0.6 && x.specific > 0.2 && !used.has(x.c.qid)).sort((x, y) => y.specific - x.specific);
  if (!picks.length) picks = scored.filter((x) => x.a > 0.4).sort((x, y) => y.a - x.a).slice(0, 1);
  const out = [];
  for (const { c } of picks) {
    const r = toReason(c);
    if (!r) continue;
    out.push(r);
    used.add(c.qid);
    if (out.length >= max) break;
  }
  return out;
}

// ---- personality / values / work style ---------------------------------------------
function riasecCode(u) {
  const top = RIASEC.slice().sort((a, b) => u[b] - u[a] || RIASEC.indexOf(a) - RIASEC.indexOf(b)).slice(0, 3);
  return { code: top.join(""), letters: top.map((d) => ({ dim: d, label: DIM_INFO[d].label, hi: DIM_INFO[d].hi, plain: DIM_INFO[d].plain })) };
}

function bigFive(u, conf) {
  return BIG5
    .filter((d) => conf[d] > 0.3 && Math.abs(u[d]) >= 0.2)
    .sort((a, b) => Math.abs(u[b]) - Math.abs(u[a]))
    .slice(0, 3)
    .map((d) => {
      const high = u[d] > 0;
      const info = DIM_INFO[d];
      return { dim: d, value: u[d], label: high ? info.label : info.low, plain: high ? info.plain : lowPlain(d) };
    });
}
function lowPlain(d) {
  return {
    O: "You like what is proven and familiar, and you go deep instead of wide.",
    C_big: "You stay flexible and handle change easily.",
    E_big: "You recharge in quiet time and think before you speak.",
    A_big: "You say what you think and don't mind competing.",
    N: "You stay steady when things get stressful.",
  }[d];
}

const topPositive = (u, dims, n) => dims.filter((d) => u[d] > 0.05).sort((a, b) => u[b] - u[a]).slice(0, n);

function axis(value, left, right, mid) {
  const v = Math.max(-1, Math.min(1, value));
  return { left, right, position: Math.round(50 + 50 * v), label: Math.abs(v) < 0.15 ? mid : v > 0 ? right : left };
}
function workStyle(u) {
  return [
    axis((u.E_big + 0.5 * u.S + 0.3 * u.A_big - 0.6 * u.t_self) / 1.2, "Solo focus", "Team player", "Happy both ways"),
    axis((u.v_autonomy + 0.6 * u.v_challenge + 0.4 * u.E - u.v_security - 0.4 * u.C) / 1.5, "Prefers stability", "Comfortable with risk", "Balanced on risk"),
    axis((u.A + u.v_creativity + 0.5 * u.O - u.I - u.t_logic - 0.5 * u.C) / 1.8, "Analytical", "Creative", "Creative and analytical"),
  ];
}

// ---- products (only when relevant) -------------------------------------------------
function productsFor(top, stage, lowConfidence) {
  const out = [];
  const add = (key, forCluster) => {
    if (out.some((p) => p.key === key)) return;
    out.push({ key, forCluster, ...PRODUCTS[key] });
  };
  top.forEach((t, i) => {
    for (const rule of CLUSTERS[t.key].products) {
      if (i + 1 > rule.maxRank) continue;
      if (rule.stages && (!stage || !rule.stages.includes(stage))) continue;
      add(rule.key, t.key);
    }
  });
  if (SCHOOL_STAGES.includes(stage) && lowConfidence) add("smart_career", null);
  if (lowConfidence) add("counselling", null);
  return out.slice(0, MAX_PRODUCTS);
}

// ---- detailed report (from a finished quiz session) --------------------------------
export function buildReport(bank, session, { lang = session.lang || "en", now = Date.now() } = {}) {
  const state = replay(bank, session);
  const ranking = getRanking(bank, session);
  const stage = session.stage || null;
  if (state.answered < MIN_FOR_REPORT) {
    return { ok: false, answered: state.answered, lang, mode: session.mode === "quick" ? "quick" : "detailed", caveat: lang === "hi" ? CAVEAT_HI : CAVEAT };
  }
  return assemble({
    mode: session.mode === "quick" ? "quick" : "detailed", lang, now, stage,
    score: state.score, ranking, answered: state.answered,
    contradictions: state.contradictions,
    reasonsFor: (key, others, used) => reasonsFor(bank, state, key, others, used, lang),
  });
}

// ---- quick report (from an account profile, no questions) --------------------------
// `score` and `ranking` come from engine.scoreDims(sum, exp); `facts` and
// `priorTop` come from findme-profile.js so we can still give reasons.
export function buildQuickReport({ score, ranking, stage = null, facts = [], priorTop = null, lang = "en", now = Date.now() }) {
  const reasonsFor = (key, others, used) => quickReasons(key, facts, used, lang);
  return assemble({
    mode: "quick", lang, now, stage,
    score, ranking, answered: 0, contradictions: [],
    reasonsFor, priorTop,
  });
}

// Reasons for Quick Findme come from the profile facts whose weights point
// at this cluster. `used` keeps each fact to one cluster.
function quickReasons(key, facts, used, lang, max = 3) {
  const scored = facts
    .filter((f) => Object.keys(f.w || {}).length)
    .map((f) => ({ f, a: clusterAffinity(f.w, key) }))
    .filter((x) => x.a > 0.2 && !used.has(x.f.why))
    .sort((x, y) => y.a - x.a);
  const out = [];
  for (const { f } of scored) {
    out.push({ qid: "profile", question: "", said: (lang === "hi" ? "Isse: " : "From ") + f.why });
    used.add(f.why);
    if (out.length >= max) break;
  }
  return out;
}

// ---- shared assembly ---------------------------------------------------------------
function assemble({ mode, lang, now, stage, score, ranking, answered, contradictions, reasonsFor, priorTop }) {
  const { u, conf } = score;

  // top 3, plus #4/#5 only when they're close to #3
  const top = ranking.slice(0, 3);
  for (const r of ranking.slice(3, 5)) if (r.match >= 65 && top[2].match - r.match <= 3) top.push(r);
  const [a, b] = ranking;
  // quick reports are always marked lower-confidence (they're an estimate)
  const lowConfidence = mode === "quick" || a.p / b.p < 1.3 || a.match < 70;

  const used = new Set();
  const clusters = top.map((r, i) => {
    const c = CLUSTERS[r.key];
    const others = top.filter((x) => x.key !== r.key).map((x) => x.key);
    return {
      key: r.key, rank: i + 1, match: r.match, label: lang === "hi" ? c.hi : c.label, label_en: c.label,
      emoji: c.emoji, icon: c.icon, tagline: lang === "hi" ? c.tagline_hi : c.tagline,
      reasons: reasonsFor(r.key, others, used),
      roles: c.roles, exams: c.exams, courses: c.courses, skills: c.skills,
    };
  });

  // "Also consider": the best-matching cluster outside the top list that
  // shares the user's strongest talent or value (a surprising match)
  const shown = new Set(clusters.map((c) => c.key));
  const strong = [...topPositive(u, TALENTS, 3), ...topPositive(u, VALUES, 2)];
  const also = ranking
    .filter((r) => !shown.has(r.key) && r.match >= 50)
    .map((r) => {
      const v = CLUSTERS[r.key].vector;
      const via = strong.find((d) => (v[d] || 0) >= 2);
      return via ? { key: r.key, match: r.match, label: lang === "hi" ? CLUSTERS[r.key].hi : CLUSTERS[r.key].label, emoji: CLUSTERS[r.key].emoji, via, viaLabel: DIM_INFO[via].label, roles: CLUSTERS[r.key].roles.filter((x) => x.nontraditional).slice(0, 2) } : null;
    })
    .filter(Boolean)
    .slice(0, 2);

  const riasec = riasecCode(u);
  const traits = bigFive(u, conf);
  const talents = topPositive(u, TALENTS, 3).map((d) => ({ dim: d, label: DIM_INFO[d].label, plain: DIM_INFO[d].plain }));
  const values = topPositive(u, VALUES, 3).map((d) => ({ dim: d, label: DIM_INFO[d].label, plain: DIM_INFO[d].plain }));
  const mixedSignals = (contradictions || []).map((d) => ({ dim: d, label: DIM_INFO[d].label }));
  const first = clusters[0];
  // only name the second interest type if it's actually positive
  const who = u[riasec.letters[1].dim] > 0.08 ? `${riasec.letters[0].label} + ${riasec.letters[1].label}` : riasec.letters[0].label;
  const pull = lang === "hi" ? `, aur jhukaav ${first.label} ki taraf.` : `, with a strong pull towards ${first.label_en}.`;
  const summary = who + pull;

  return {
    ok: true, mode, lang, stage, stageLabel: stage ? STAGES[stage]?.label : null,
    generatedAt: new Date(now).toISOString(), answered, confidence: Math.round(100 * Math.min(1, a.p / (a.p + b.p))) / 100,
    lowConfidence, summary, clusters, also, riasec, traits, talents, values, workStyle: workStyle(u),
    plan: CLUSTERS[first.key].plan, planFor: first.label,
    ikigai: {
      love: riasec.letters.slice(0, 2).map((x) => x.label),
      good: talents.slice(0, 2).map((x) => x.label),
      needs: values.slice(0, 2).map((x) => x.label),
      paid: CLUSTERS[first.key].roles.slice(0, 2).map((r) => r.title),
    },
    products: productsFor(clusters, stage, lowConfidence),
    mixedSignals,
    caveat: lang === "hi" ? CAVEAT_HI : CAVEAT,
  };
}

// Compact result saved to Firestore / the profile (no free text).
export function resultSummary(report) {
  if (!report.ok) return null;
  return {
    top: report.clusters.map((c) => ({ key: c.key, match: c.match })),
    riasec: report.riasec.code,
    traits: Object.fromEntries(report.traits.map((t) => [t.dim, Math.round(t.value * 100) / 100])),
    values: report.values.map((v) => v.dim),
    confidence: report.confidence,
    answered: report.answered,
    mixedSignals: report.mixedSignals.map((m) => m.dim),
  };
}

// ---- HTML ------------------------------------------------------------------------------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const list = (items) => `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

// access: "full"    everything (after login + details)
//         "half"    Detailed Findme before unlocking: summary, top career areas
//                   (match + why), personality, values and work style. The rest
//                   is listed as locked.
//         "preview" Quick Findme before unlocking: the #1 match only.
// Locked sections are NOT rendered (only their titles), so they can't be
// revealed from the page source. The gate form is mounted into #fm-gate-slot.
// features: the site switches (smartDecisions, findmeProducts).
export function renderReportHTML(report, { access = "full", features = {} } = {}) {
  const t = strings(report.lang);
  if (!report.ok) {
    return `<section class="fm-report" aria-labelledby="fm-report-title"><h2 id="fm-report-title" tabindex="-1">${esc(t.title)}</h2><p>${esc(t.insufficient)}</p><div class="fm-actions"><button type="button" class="sd-btn sd-btn-primary" data-fm-action="restart" data-ga-name="findme_restart">${esc(t.restart)}</button></div></section>`;
  }
  const full = access === "full";
  const preview = access === "preview";
  const on = (flag) => features[flag] !== false;

  const clusterCard = (c, { details = true, maxReasons = 3 } = {}) => `
    <article class="fm-cluster" id="fm-c-${esc(c.key)}" data-rank="${c.rank}">
      <header class="fm-cluster-head">
        <span class="fm-cluster-emoji" aria-hidden="true">${esc(c.emoji)}</span>
        <div><h4>${esc(c.label)}</h4><p class="fm-tagline">${esc(c.tagline)}</p></div>
        <div class="fm-match" aria-label="${c.match}% match"><span>${c.match}%</span><small>match</small></div>
      </header>
      <div class="fm-meter" aria-hidden="true"><span style="width:${c.match}%"></span></div>
      ${c.reasons.length ? `<h5>${esc(t.why)}</h5><ul class="fm-reasons">${c.reasons.slice(0, maxReasons).map((r) => `<li>${esc(r.said)}</li>`).join("")}</ul>` : ""}
      ${details ? `
      <h5>${esc(t.roles)}</h5>
      <ul class="fm-roles">${c.roles.map((r) => `<li${r.nontraditional ? ' class="fm-nontrad"' : ""}><strong>${esc(r.title)}</strong>: ${esc(r.note)}${r.nontraditional ? ` <span class="fm-chip">${esc(t.nonTrad)}</span>` : ""}</li>`).join("")}</ul>
      <details class="fm-steps"${c.rank === 1 ? " open" : ""}>
        <summary>${esc(t.nextSteps)}</summary>
        <div class="fm-steps-grid">
          <div><h6>${esc(t.exams)}</h6>${list(c.exams)}</div>
          <div><h6>${esc(t.courses)}</h6>${list(c.courses)}</div>
          <div><h6>${esc(t.skills)}</h6>${list(c.skills)}</div>
        </div>
      </details>` : ""}
    </article>`;

  const showProducts = on("findmeProducts");
  const products = !showProducts ? "" : report.products.length ? `
    <section class="fm-block fm-products" aria-labelledby="fm-h-products">
      <h3 id="fm-h-products">${esc(t.products)}</h3>
      <div class="fm-product-grid">${report.products.map((p) => `
        <a class="sd-reco fm-product" href="${esc(p.href)}"${p.external ? ' target="_blank" rel="noopener"' : ""} data-ga-event="cta_click" data-ga-name="findme_product_${esc(p.key)}">
          <h4><i class="fa-solid ${esc(p.icon)}" aria-hidden="true"></i> ${esc(p.label)} →</h4>
          <div class="sd-why">${esc(p.why)}</div>
        </a>`).join("")}
      </div>
    </section>` : `
    <p class="fm-soft">Want to talk it through with someone? <a href="/career-counselling/" data-ga-event="cta_click" data-ga-name="findme_soft_counselling">Career counselling</a> is there whenever you need it.</p>`;

  const quick = report.mode === "quick";
  const quickBanner = quick && full ? `
    <div class="fm-quick-note" data-ga-section="quick_note">
      <p>${esc(t.quickNote)}</p>
      <button type="button" class="sd-btn sd-btn-primary" data-fm-action="detailed" data-ga-name="findme_quick_to_detailed">${esc(t.goDetailed)} →</button>
    </div>` : "";

  const personality = `
    <section class="fm-block" aria-labelledby="fm-h-personality">
      <h3 id="fm-h-personality">${esc(t.personality)}</h3>
      <div class="fm-two">
        <div>
          <h4>${esc(t.riasec)}: <span class="fm-code">${esc(report.riasec.code)}</span></h4>
          <ul class="fm-plain">${report.riasec.letters.map((l) => `<li><strong>${esc(l.dim)} · ${esc(l.label)}</strong>: ${esc(l.plain)}</li>`).join("")}</ul>
        </div>
        <div>
          ${report.traits.length ? `<h4>${esc(t.traits)}</h4><ul class="fm-plain">${report.traits.map((x) => `<li><strong>${esc(x.label)}</strong>: ${esc(x.plain)}</li>`).join("")}</ul>` : ""}
          ${report.talents.length ? `<h4>${esc(t.talents)}</h4><ul class="fm-plain">${report.talents.map((x) => `<li><strong>${esc(x.label)}</strong>: ${esc(x.plain)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    </section>`;

  const values = `
    <section class="fm-block" aria-labelledby="fm-h-values">
      <h3 id="fm-h-values">${esc(t.values)}</h3>
      ${report.values.length ? `<ul class="fm-chips">${report.values.map((v) => `<li title="${esc(v.plain)}">${esc(v.label)}</li>`).join("")}</ul>` : ""}
      <h4>${esc(t.workStyle)}</h4>
      <div class="fm-axes">${report.workStyle.map((ax) => `
        <div class="fm-axis">
          <div class="fm-axis-labels"><span>${esc(ax.left)}</span><strong>${esc(ax.label)}</strong><span>${esc(ax.right)}</span></div>
          <div class="fm-axis-track" role="img" aria-label="${esc(ax.label)}"><span style="left:${ax.position}%"></span></div>
        </div>`).join("")}
      </div>
    </section>`;

  const ikigai = `
    <section class="fm-block fm-ikigai" aria-labelledby="fm-h-ikigai">
      <h3 id="fm-h-ikigai">${esc(t.ikigai)}</h3>
      <div class="fm-ikigai-grid">
        <div><h6>${esc(t.love)}</h6><p>${esc(report.ikigai.love.join(", "))}</p></div>
        <div><h6>${esc(t.good)}</h6><p>${esc(report.ikigai.good.join(", ") || "Still discovering")}</p></div>
        <div><h6>${esc(t.needs)}</h6><p>${esc(report.ikigai.needs.join(", ") || "Still discovering")}</p></div>
        <div><h6>${esc(t.paid)}</h6><p>${esc(report.ikigai.paid.join(", "))}</p></div>
      </div>
    </section>`;

  const plan = `
    <section class="fm-block" aria-labelledby="fm-h-plan">
      <h3 id="fm-h-plan">${esc(t.plan)} <small>(${esc(report.planFor)})</small></h3>
      <ol class="fm-plan">
        <li><h6>${esc(t.d30)}</h6>${list(report.plan.d30)}</li>
        <li><h6>${esc(t.d60)}</h6>${list(report.plan.d60)}</li>
        <li><h6>${esc(t.d90)}</h6>${list(report.plan.d90)}</li>
      </ol>
    </section>`;

  const also = report.also.length ? `
    <section class="fm-block" aria-labelledby="fm-h-also">
      <h3 id="fm-h-also">${esc(t.also)}</h3>
      <ul class="fm-also">${report.also.map((x) => `<li><span aria-hidden="true">${esc(x.emoji)}</span> <strong>${esc(x.label)}</strong> (${x.match}%): your ${esc(x.viaLabel.toLowerCase())} points here too.${x.roles.length ? ` Think ${esc(x.roles.map((r) => r.title).join(" or "))}.` : ""}</li>`).join("")}</ul>
    </section>` : "";

  const mixed = report.mixedSignals.length ? `
    <section class="fm-block fm-mixed" aria-labelledby="fm-h-mixed">
      <h3 id="fm-h-mixed">${esc(t.mixed)}</h3>
      <p>You gave different answers about <strong>${esc(report.mixedSignals.map((m) => m.label.toLowerCase()).join(", "))}</strong>. That's normal: it often depends on the situation. Notice when it shows up for you.</p>
    </section>` : "";

  const caveat = `
    <section class="fm-block fm-caveat" aria-labelledby="fm-h-caveat">
      <h3 id="fm-h-caveat">${esc(t.caveat)}</h3>
      <p>${esc(report.caveat)}</p>
    </section>`;

  // What the locked part contains (titles only, no content)
  const lockedList = (items) => `
    <section class="fm-block fm-locked" aria-labelledby="fm-h-locked">
      <h3 id="fm-h-locked"><i class="fa-solid fa-lock" aria-hidden="true"></i> ${esc(t.lockedTitle)}</h3>
      <ul class="fm-locked-list">${items.map((x) => `<li><span class="fm-locked-name">${esc(x)}</span><span class="fm-skel" aria-hidden="true"></span><span class="fm-skel fm-skel-s" aria-hidden="true"></span></li>`).join("")}</ul>
    </section>`;

  const head = `
    <header class="fm-report-head">
      <span class="sd-badge">${quick ? esc(t.quickBadge) + " · " : ""}${esc(report.riasec.code)}</span>
      <h2 id="fm-report-title" tabindex="-1">${esc(full ? t.title : preview ? t.previewTitle : t.halfTitle)}</h2>
      <p class="fm-summary">${esc(report.summary)}</p>
      ${full ? `<div class="fm-actions no-print">
        <button type="button" class="sd-btn sd-btn-primary" data-fm-action="share" data-ga-name="findme_share">${esc(t.share)}</button>
        <button type="button" class="sd-btn sd-btn-ghost" data-fm-action="pdf" data-ga-name="findme_pdf">${esc(t.pdf)}</button>
      </div>` : ""}
    </header>`;

  const gateSlot = `<div id="fm-gate-slot" class="no-print" data-ga-section="report_gate"></div>`;
  const tail = `
    <div class="fm-actions no-print">
      <button type="button" class="sd-btn sd-btn-ghost" data-fm-action="restart" data-ga-name="findme_restart">${esc(t.restart)}</button>
    </div>
    ${on("smartDecisions") ? `<p class="sd-note no-print">${esc(t.smart)} <a href="/smart-decisions/" data-ga-event="cta_click" data-ga-name="findme_report_smart_decisions">${esc(t.smartLink)} →</a></p>` : ""}`;
  const open = `<section class="fm-report${quick ? " fm-report-quick" : ""}" aria-labelledby="fm-report-title" data-fm-mode="${esc(report.mode)}" data-fm-access="${esc(access)}">`;

  if (preview) {
    const first = report.clusters[0];
    const more = report.clusters.length - 1;
    return `${open}${head}
    <section class="fm-block" aria-labelledby="fm-h-top">
      <h3 id="fm-h-top">${esc(t.previewTop)}</h3>
      ${clusterCard(first, { details: false, maxReasons: 1 })}
      ${more > 0 ? `<p class="fm-more-locked"><i class="fa-solid fa-lock" aria-hidden="true"></i> ${esc(t.moreMatches(more))}</p>` : ""}
    </section>
    ${gateSlot}
    ${lockedList(t.lockedPreview)}
    ${caveat}${tail}
  </section>`;
  }
  if (access === "half") {
    return `${open}${head}
    <section class="fm-block" aria-labelledby="fm-h-top">
      <h3 id="fm-h-top">${esc(t.top)}</h3>
      ${report.clusters.map((c) => clusterCard(c, { details: false })).join("")}
    </section>
    ${personality}
    ${values}
    ${gateSlot}
    ${lockedList(t.lockedHalf)}
    ${caveat}${tail}
  </section>`;
  }
  return `${open}${head}
    ${quickBanner}
    <section class="fm-block" aria-labelledby="fm-h-top">
      <h3 id="fm-h-top">${esc(t.top)}</h3>
      ${report.clusters.map((c) => clusterCard(c)).join("")}
    </section>
    ${personality}
    ${values}
    ${ikigai}
    ${plan}
    ${also}
    ${products}
    ${mixed}
    ${caveat}${tail}
  </section>`;
}

// ---- share card (browser only) ----------------------------------------------------------
export function drawShareCard(report, doc = document) {
  const W = 1080;
  const H = 1350;
  const canvas = doc.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#1e3a8a");
  grad.addColorStop(1, "#7c3aed");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.08)";
  g.beginPath();
  g.arc(W - 120, 140, 260, 0, Math.PI * 2);
  g.fill();

  const font = (w, s) => `${w} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  g.fillStyle = "#fff";
  g.font = font(700, 40);
  g.fillText("JobsDoor360 · Findme", 80, 120);
  g.font = font(800, 76);
  g.fillText("My career match", 80, 230);
  g.font = font(500, 34);
  g.fillStyle = "rgba(255,255,255,0.85)";
  wrap(g, report.summary, 80, 300, W - 160, 46);

  let y = 450;
  for (const c of report.clusters.slice(0, 3)) {
    g.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(g, 80, y, W - 160, 170, 28);
    g.fill();
    g.fillStyle = "#fff";
    g.font = font(400, 64);
    g.fillText(c.emoji, 115, y + 108);
    g.font = font(700, 40);
    g.fillText(trim(g, c.label_en, W - 520), 220, y + 80);
    g.font = font(800, 56);
    g.textAlign = "right";
    g.fillText(c.match + "%", W - 120, y + 102);
    g.textAlign = "left";
    g.fillStyle = "rgba(255,255,255,0.25)";
    roundRect(g, 220, y + 112, W - 520, 16, 8);
    g.fill();
    g.fillStyle = "#facc15";
    roundRect(g, 220, y + 112, ((W - 520) * c.match) / 100, 16, 8);
    g.fill();
    y += 200;
  }
  g.fillStyle = "#fff";
  g.font = font(700, 44);
  g.fillText("Interest code: " + report.riasec.code, 80, y + 60);
  g.font = font(500, 32);
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.fillText("Find yours free at jobsdoor360.in/findme", 80, H - 90);
  return canvas;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function wrap(g, text, x, y, maxW, lh) {
  let line = "";
  for (const word of String(text).split(" ")) {
    const test = line ? line + " " + word : word;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y);
      line = word;
      y += lh;
    } else line = test;
  }
  if (line) g.fillText(line, x, y);
}
function trim(g, text, maxW) {
  if (g.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 3 && g.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}
