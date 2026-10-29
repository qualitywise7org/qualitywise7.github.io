// ============================================================
// Quick Findme: turn whatever is already in a user's account into the
// same dimension evidence the quiz produces, so the normal engine and
// report can run with no questions asked.
//
// Reads (all optional, all best-effort):
//   user_profile/{email}       about, education[], skills[], experience[]
//   smart_profiles/{email}     a previous findme result / interests
//   user_assessment_results    (optional) prior test scores
//
// Pure functions here (no Firestore, no DOM) so Node can test them.
// The loader that actually hits Firestore is loadProfile() at the end.
// ============================================================
import { DIMS } from "./findme-clusters.js";

// ---- keyword -> dimension rules -------------------------------------------------------
// Each rule: match terms (lowercase, whole-word) -> dim weights + a short
// human reason. Weights are on the same -2..3 scale the quiz options use.
const SKILL_RULES = [
  { terms: ["dsa", "data structure", "algorithm", "competitive programming", "leetcode"], w: { I: 1.5, t_logic: 2.5, v_challenge: 1 }, why: "your DSA / problem-solving skills" },
  { terms: ["java", "python", "c++", "javascript", "coding", "programming", "developer", "react", "node", "sql", "html", "css", "git"], w: { I: 1.5, R: 1, t_logic: 2 }, why: "your coding skills" },
  { terms: ["machine learning", "ml", "ai", "data science", "data analysis", "deep learning", "nlp", "tensorflow"], w: { I: 2.5, O: 1, t_logic: 2 }, why: "your AI / data skills" },
  { terms: ["system design", "cloud", "aws", "devops", "backend", "architecture", "docker", "kubernetes"], w: { I: 1.5, C: 1, t_logic: 1.5 }, why: "your system / backend skills" },
  { terms: ["cybersecurity", "security", "hacking", "networking"], w: { I: 2, t_logic: 2, v_challenge: 1 }, why: "your security / networking skills" },
  { terms: ["figma", "ui", "ux", "design", "photoshop", "illustrator", "canva", "graphic", "animation", "blender"], w: { A: 2.5, t_space: 2.5, v_creativity: 1 }, why: "your design skills" },
  { terms: ["writing", "content", "copywriting", "blogging", "editing", "seo", "journalism"], w: { A: 1, t_word: 2.5, v_creativity: 1 }, why: "your writing / content skills" },
  { terms: ["video", "editing", "premiere", "filmmaking", "youtube", "photography", "social media"], w: { A: 2, t_space: 1, t_word: 1, v_creativity: 1 }, why: "your video / media skills" },
  { terms: ["marketing", "sales", "business development", "entrepreneur", "startup"], w: { E: 2.5, v_autonomy: 1, v_money: 1 }, why: "your business / sales skills" },
  { terms: ["accounting", "finance", "excel", "tally", "taxation", "audit", "investment"], w: { C: 2.5, t_logic: 1, v_money: 1.5 }, why: "your finance / accounting skills" },
  { terms: ["teaching", "tutoring", "counselling", "mentoring", "training"], w: { S: 2.5, t_people: 1.5, v_service: 1 }, why: "your teaching / mentoring skills" },
  { terms: ["public speaking", "debate", "leadership", "communication", "management"], w: { E: 2, t_word: 1.5, E_big: 1 }, why: "your leadership / communication skills" },
  { terms: ["dance", "music", "singing", "choreography", "acting", "theatre", "guitar", "piano"], w: { A: 2, t_body: 1.5, t_music: 1.5, v_creativity: 1 }, why: "your performing-arts skills" },
  { terms: ["sports", "cricket", "football", "athletics", "fitness", "gym", "yoga", "coaching"], w: { R: 1.5, t_body: 2.5, v_challenge: 1 }, why: "your sports / fitness background" },
  { terms: ["nursing", "medical", "pharmacy", "physiotherapy", "biology", "lab", "clinical"], w: { I: 1.5, S: 1.5, t_nature: 2, v_service: 1.5 }, why: "your health / medical background" },
  { terms: ["electrician", "mechanic", "welding", "carpentry", "plumbing", "cnc", "fabrication", "automobile", "repair"], w: { R: 2.5, t_space: 1.5, v_security: 1 }, why: "your hands-on technical skills" },
  { terms: ["law", "legal", "advocacy", "policy", "civil service", "upsc"], w: { E: 1, C: 1, t_word: 2, v_impact: 2 }, why: "your law / public-service background" },
];

// Degree / stream -> dims. Matched against education.degree text.
const DEGREE_RULES = [
  { terms: ["b.tech", "btech", "b.e", "be ", "engineering", "polytechnic", "diploma in eng", "computer science", "bca", "mca", "information technology", "b.sc cs", "it"], w: { R: 1, I: 2, t_logic: 2, v_challenge: 1 }, why: "your engineering / computing studies" },
  { terms: ["mbbs", "bds", "nursing", "pharm", "physio", "bpt", "medical", "bams", "bhms", "b.sc nursing"], w: { I: 1.5, S: 2, t_nature: 2, v_service: 2 }, why: "your medical / health studies" },
  { terms: ["b.sc", "bsc", "m.sc", "msc", "physics", "chemistry", "mathematics", "biotech", "research", "phd"], w: { I: 2.5, O: 2, t_logic: 1.5, v_challenge: 1 }, why: "your science studies" },
  { terms: ["b.com", "bcom", "m.com", "ca", "cma", "cs ", "bba finance", "economics", "finance", "banking"], w: { C: 2.5, t_logic: 1, v_money: 1.5 }, why: "your commerce / finance studies" },
  { terms: ["bba", "mba", "management", "business"], w: { E: 2, C: 1, v_autonomy: 1, v_money: 1 }, why: "your management studies" },
  { terms: ["llb", "ll.b", "law", "ba llb", "political science", "public administration"], w: { E: 1, C: 1, t_word: 2, v_impact: 2 }, why: "your law / public-affairs studies" },
  { terms: ["b.des", "bdes", "design", "fashion", "nift", "nid", "fine art", "bfa", "architecture", "b.arch"], w: { A: 2.5, t_space: 2.5, v_creativity: 1.5 }, why: "your design / art studies" },
  { terms: ["journalism", "mass comm", "bjmc", "media", "film"], w: { A: 1.5, t_word: 2, E_big: 1, v_creativity: 1 }, why: "your media / communication studies" },
  { terms: ["ba psychology", "psychology", "social work", "bsw", "b.ed", "education", "sociology"], w: { S: 2.5, A_big: 1.5, t_people: 2, v_service: 1.5 }, why: "your psychology / education studies" },
  { terms: ["bpa", "performing art", "dance", "music", "theatre"], w: { A: 2.5, t_body: 1.5, t_music: 1.5, v_creativity: 1.5 }, why: "your performing-arts studies" },
  { terms: ["bped", "physical education", "sports science"], w: { R: 2, t_body: 2.5, v_challenge: 1 }, why: "your sports / physical-education studies" },
  { terms: ["iti", "hotel management", "culinary", "trade"], w: { R: 2.5, t_space: 1, v_security: 1 }, why: "your vocational / trade studies" },
];

const EXPERIENCE_HINTS = { v_money: 0.4, C_big: 0.6 }; // having work experience nudges discipline + reward focus

const norm = (s) => " " + String(s || "").toLowerCase().replace(/[^a-z0-9+.# ]+/g, " ").replace(/\s+/g, " ") + " ";
const hits = (text, terms) => terms.some((t) => norm(text).includes(" " + t.trim() + " ") || norm(text).includes(" " + t.trim()));

// Pull the readable fields out of a user_profile doc.
export function readProfile(profile = {}, smart = {}, assessment = null) {
  const about = profile.about || {};
  const education = Array.isArray(profile.education) ? profile.education : [];
  const skills = (Array.isArray(profile.skills) ? profile.skills : []).map((s) => (typeof s === "string" ? s : s.skillName || s.name || "")).filter(Boolean);
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const prior = smart?.findme || null;
  const priorInterests = Array.isArray(smart?.interests) ? smart.interests : [];
  return { about, education, skills, experience, prior, priorInterests, assessment };
}

// Decide a life stage from the account, so product rules still work.
export function inferStage(data) {
  if (data.experience && data.experience.length) return "graduate";
  const deg = (data.education || []).map((e) => (e.degree || "").toLowerCase()).join(" ");
  if (/class (1[12]|11|12)|intermediate|higher secondary|12th/.test(deg)) return "school_11_12";
  if (/class (8|9|10)|high school|10th|matric/.test(deg)) return "school_8_10";
  if (deg) return "college"; // any degree listed -> treat as college/greaduate level
  return "college";
}

// Build { sum, exp } evidence plus the facts used (for report reasons).
export function profileToEvidence(data) {
  const sum = {};
  const exp = {};
  const facts = []; // { why, w } used to explain the result
  const add = (w, strength = 1) => {
    for (const [d, v] of Object.entries(w)) {
      sum[d] = (sum[d] || 0) + v * strength;
      exp[d] = (exp[d] || 0) + Math.abs(v) * strength;
    }
  };

  // Skills (strongest signal: these are things the user actually built)
  const skillText = (data.skills || []).join(" , ");
  const usedSkillRules = new Set();
  for (const sk of data.skills || []) {
    for (const rule of SKILL_RULES) {
      if (hits(sk, rule.terms) && !usedSkillRules.has(rule.why)) {
        add(rule.w, 1);
        facts.push({ why: rule.why, w: rule.w, source: "skill" });
        usedSkillRules.add(rule.why);
      }
    }
  }

  // Education / degree
  const usedDegRules = new Set();
  for (const edu of data.education || []) {
    const text = [edu.degree, edu.institution, edu.stream, edu.field].filter(Boolean).join(" ");
    for (const rule of DEGREE_RULES) {
      if (hits(text, rule.terms) && !usedDegRules.has(rule.why)) {
        add(rule.w, 0.9);
        facts.push({ why: rule.why, w: rule.w, source: "education" });
        usedDegRules.add(rule.why);
      }
    }
  }

  // Experience: a mild maturity nudge
  if ((data.experience || []).length) {
    add(EXPERIENCE_HINTS, 0.8);
    facts.push({ why: "your work experience", w: EXPERIENCE_HINTS, source: "experience" });
  }

  // A previous detailed Findme result is the strongest prior we have
  if (data.prior && Array.isArray(data.prior.top)) {
    facts.push({ why: "your earlier detailed Findme result", w: {}, source: "prior", top: data.prior.top });
  }

  return { sum, exp, facts, skillText };
}

// ---- Firestore loader (browser only) -----------------------------------------------
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

// Returns { signedIn, email, data } or { signedIn:false }. Never throws.
export async function loadProfile() {
  const COMMON = "/staticfiles/mainfiles/platform/common.js?v=20261001";
  try {
    const common = await import(COMMON);
    if (!(await common.firebaseReady(4000))) return { signedIn: false, reason: "offline" };
    const user = await common.getCurrentUser();
    if (!user || !user.email) return { signedIn: false, reason: "no_user" };
    const email = user.email;
    const getDocSafe = async (coll, id) => {
      try {
        const snap = await withTimeout(window.getDoc(window.doc(window.db, coll, id)), 6000);
        return snap && snap.exists && snap.exists() ? snap.data() : null;
      } catch (_) {
        return null;
      }
    };
    const [profile, smart, assessment] = await Promise.all([
      getDocSafe("user_profile", email),
      getDocSafe("smart_profiles", email),
      getDocSafe("user_assessment_results", email),
    ]);
    const data = readProfile(profile || {}, smart || {}, assessment);
    return { signedIn: true, email, data, hasProfile: !!profile };
  } catch (err) {
    return { signedIn: false, reason: "error", error: err.message };
  }
}

// How much usable signal did we get? Drives the "not enough in your
// account" message vs a real quick report.
export function hasEnoughSignal(evidence, data) {
  if (data?.prior && Array.isArray(data.prior.top) && data.prior.top.length) return true;
  const measured = DIMS.filter((d) => (evidence.exp[d] || 0) > 0.5).length;
  return measured >= 4 && !!((data.skills?.length || 0) + (data.education?.length || 0));
}
