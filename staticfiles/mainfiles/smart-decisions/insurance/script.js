// Smart Insurance — needs check before any selling. A short form maps
// the user's situation to the policy types they need, with a plain
// "why". Saves the answers to the shared profile.
import {
  getCurrentUser,
  saveSmartProfile,
  track,
  loginUrlBack,
} from "/staticfiles/mainfiles/platform/common.js?v=20261001";

const FORM_FIELDS = [
  { id: "age", label: "Your age", options: ["18 to 25", "26 to 35", "36 to 45", "46 to 60", "Over 60"] },
  { id: "dependents", label: "Does anyone depend on your income?", options: ["No one", "Spouse only", "Spouse and children", "Parents or wider family"] },
  { id: "income", label: "Yearly income (roughly)", options: ["Below ₹3L", "₹3L to ₹7L", "₹7L to ₹15L", "Above ₹15L"] },
  { id: "existing", label: "What cover do you have already?", options: ["None", "Only what my employer gives", "My own health policy", "Health and term cover"] },
  { id: "vehicle", label: "Do you own a car or two-wheeler?", options: ["No", "Two-wheeler", "Car", "Both"] },
  { id: "goal", label: "What worries you most right now?", options: ["Medical bills", "My family's future if something happens to me", "Vehicle damage or legal trouble", "Saving and growing money"] },
];

function recommend(a) {
  const recos = [];
  const higherIncome = a.income === "Above ₹15L" || a.income === "₹7L to ₹15L";

  if (a.existing === "None" || a.existing === "Only what my employer gives") {
    recos.push({
      type: "Health insurance (individual or family)",
      why:
        a.existing === "Only what my employer gives"
          ? "Employer cover ends when the job does, and it's often too small. A policy of your own stays with you and can be topped up later."
          : "You have no health cover right now. One hospital stay can wipe out years of savings, so this is the first policy most people should own.",
      cover: higherIncome ? "₹10L to ₹25L sum insured" : "₹5L to ₹10L sum insured",
    });
  }
  if (a.dependents && a.dependents !== "No one") {
    const multiple = a.income === "Above ₹15L" ? "15 to 20 times" : a.income === "₹7L to ₹15L" ? "12 to 15 times" : "10 to 12 times";
    recos.push({
      type: "Term life insurance",
      why: `People depend on your income. A pure term plan replaces it if something happens to you, and it's cheap. Aim for about ${multiple} your yearly income.`,
      cover: "Pure term plan, no investment mixed in",
    });
  }
  if (a.vehicle && a.vehicle !== "No") {
    recos.push({
      type: "Motor insurance",
      why: "Third-party motor cover is required by law in India. A comprehensive plan also covers damage to your own vehicle and theft.",
      cover: a.vehicle === "Both" ? "Car and two-wheeler, comprehensive" : `${a.vehicle}, comprehensive`,
    });
  }
  if (a.goal === "Saving and growing money") {
    recos.push({
      type: "Protection first, then investing",
      why: "Insurance and investing work best kept apart. Get health and term cover sorted first, then invest what's left over.",
      cover: "Avoid plans that mix insurance with investment",
    });
  }
  if (recos.length === 0) {
    recos.push({
      type: "Health top-up and a term review",
      why: "You're already well covered. A super top-up raises your health limit cheaply, and it's worth checking your term amount as your income grows.",
      cover: "Review every 2 to 3 years",
    });
  }
  return recos;
}

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let started = false;

function buildForm() {
  $("sd-insurance-fields").innerHTML = FORM_FIELDS.map((f) => {
    const opts = f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
    return `<div class="sd-field"><label for="f_${f.id}">${esc(f.label)}</label>
      <select id="f_${f.id}" required><option value="" disabled selected>Choose one</option>${opts}</select></div>`;
  }).join("");
}

function readForm() {
  const a = {};
  let complete = true;
  FORM_FIELDS.forEach((f) => {
    const v = $("f_" + f.id).value;
    if (!v) complete = false;
    a[f.id] = v;
  });
  return { a, complete };
}

function submit(e) {
  e.preventDefault();
  const { a, complete } = readForm();
  if (!complete) {
    $("sd-form-error").classList.remove("sd-hidden");
    return;
  }
  $("sd-form-error").classList.add("sd-hidden");
  const recos = recommend(a);
  $("sd-recos").innerHTML = recos
    .map((r) => `<div class="sd-reco"><h3>${esc(r.type)}</h3><div class="sd-why">${esc(r.why)}</div><span class="sd-cover">${esc(r.cover)}</span></div>`)
    .join("");
  $("sd-form-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("sd-result-title").focus();
  // only the recommended policy types go to analytics, never the answers
  track("quiz_complete", { quiz_name: "insurance", result: recos[0].type, result_count: recos.length });

  (async () => {
    const user = await getCurrentUser();
    await saveSmartProfile(user?.email, {
      insurance: { answers: a, recommended: recos.map((r) => r.type), completedAt: new Date().toISOString() },
    });
    if (!user) {
      $("sd-signin-hint").classList.remove("sd-hidden");
      $("sd-signin-link").href = loginUrlBack();
    }
  })();
}

buildForm();
$("sd-insurance-form").addEventListener("submit", submit);
$("sd-insurance-form").addEventListener("change", () => {
  if (!started) {
    started = true;
    track("quiz_start", { quiz_name: "insurance" });
  }
});
$("sd-restart").addEventListener("click", () => {
  $("sd-result-card").classList.add("sd-hidden");
  $("sd-form-card").classList.remove("sd-hidden");
  buildForm();
});
