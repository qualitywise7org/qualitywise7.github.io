// Smart Investment — free, broker-neutral property price snapshot for a
// city and budget, then a clearly priced detailed report.
import {
  getCurrentUser,
  saveSmartProfile,
  track,
  loginUrlBack,
} from "/staticfiles/mainfiles/platform/common.js?v=20261001";

// Small indicative sample so the free snapshot is useful. Clearly
// labelled on the page as rough numbers, not live data.
const CITY_DATA = {
  Pune: { avg: 8200, trend: "up about 6% in the last year", note: "Wakad, Hinjewadi and Baner are moving fastest because of IT jobs nearby." },
  Bengaluru: { avg: 9500, trend: "up about 8% in the last year", note: "Whitefield and Sarjapur stay in demand. The outer ring is where the value is." },
  Mumbai: { avg: 27500, trend: "up about 4% in the last year", note: "Navi Mumbai and Thane give you much more space for the money." },
  Delhi: { avg: 12500, trend: "up about 5% in the last year", note: "Dwarka and the expressway belt are practical picks for first-time buyers." },
  Hyderabad: { avg: 7200, trend: "up about 7% in the last year", note: "Gachibowli and Kokapet are the growth pockets right now." },
  Other: { avg: null, trend: "very different from one area to the next", note: "Your detailed report will cover your exact localities." },
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let started = false;

function submit(e) {
  e.preventDefault();
  const city = $("f_city").value;
  const budget = $("f_budget").value;
  const purpose = $("f_purpose").value;
  if (!city || !budget || !purpose) {
    $("sd-form-error").classList.remove("sd-hidden");
    return;
  }
  $("sd-form-error").classList.add("sd-hidden");

  const d = CITY_DATA[city] || CITY_DATA.Other;
  const place = city === "Other" ? "your city" : city;
  const avgLine = d.avg
    ? `Flats in ${esc(place)} are selling for roughly <strong>₹${d.avg.toLocaleString("en-IN")} per sq. ft</strong> on average.`
    : `We don't have an average for ${esc(place)} on this page yet.`;

  $("sd-recos").innerHTML = `
    <div class="sd-reco">
      <h3>${esc(city === "Other" ? "Your city" : city)}: quick snapshot</h3>
      <div class="sd-why">${avgLine} Prices are ${esc(d.trend)}. ${esc(d.note)}</div>
      <span class="sd-cover">${purpose === "invest" ? "Buying as an investment" : "Buying to live in"}, budget ${esc(budget)}</span>
    </div>
    <div class="sd-reco">
      <h3>What we'd tell a friend</h3>
      <div class="sd-why">Don't rush. Compare at least three localities, check the registered sale prices (not just what the broker quotes), and look at how prices moved over the last three years before you commit.</div>
    </div>`;
  $("sd-form-card").classList.add("sd-hidden");
  $("sd-result-card").classList.remove("sd-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  $("sd-result-title").focus();
  track("quiz_complete", { quiz_name: "investment", result: city, purpose });

  (async () => {
    const user = await getCurrentUser();
    await saveSmartProfile(user?.email, { investment: { city, budget, purpose, at: new Date().toISOString() } });
    if (!user) {
      $("sd-signin-hint").classList.remove("sd-hidden");
      $("sd-signin-link").href = loginUrlBack();
    }
  })();
}

$("sd-inv-form").addEventListener("submit", submit);
$("sd-inv-form").addEventListener("change", () => {
  if (!started) {
    started = true;
    track("quiz_start", { quiz_name: "investment" });
  }
});
$("sd-restart").addEventListener("click", () => {
  $("sd-result-card").classList.add("sd-hidden");
  $("sd-form-card").classList.remove("sd-hidden");
});
