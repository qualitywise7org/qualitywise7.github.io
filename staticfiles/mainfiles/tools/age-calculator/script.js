// Age calculator page (/tools/age-calculator/). Logic: age.js (window.JDAge).
(function () {
  "use strict";
  const { ageOn, bornBetween, iso } = window.JDAge;
  const $ = (id) => document.getElementById(id);
  const dob = $("age-dob");
  const on = $("age-on");
  const from = $("age-from");
  const to = $("age-to");
  const out = $("age-out");
  const elig = $("age-elig");
  const todayIso = () => {
    const d = new Date();
    return iso({ y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
  };
  const fmt = (s) => {
    const [y, m, d] = s.split("-");
    return `${+d} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+m - 1]} ${y}`;
  };
  const plural = (n, w) => `${n.toLocaleString("en-IN")} ${w}${n === 1 ? "" : "s"}`;
  let tracked = false;

  function render() {
    if (!dob.value) {
      out.innerHTML = `<div class="jd-empty-state"><i class="fa-solid fa-cake-candles" aria-hidden="true"></i>Enter your date of birth to see your exact age.</div>`;
      elig.innerHTML = "";
      return;
    }
    const r = ageOn(dob.value, on.value || todayIso());
    if (!r.ok) {
      out.innerHTML = `<div class="jd-verdict no" role="alert">${r.error}</div>`;
      elig.innerHTML = "";
      return;
    }
    const nb = r.nextBirthday;
    out.innerHTML = `
      <p class="jd-sub">Age on ${fmt(on.value || todayIso())}</p>
      <p class="jd-big">${plural(r.years, "year")}, ${plural(r.months, "month")}, ${plural(r.days, "day")}</p>
      <div class="jd-stats jd-stats-3">
        <div class="jd-stat"><b>${r.totalDays.toLocaleString("en-IN")}</b><span>days in total</span></div>
        <div class="jd-stat"><b>${r.totalWeeks.toLocaleString("en-IN")}</b><span>weeks in total</span></div>
        <div class="jd-stat"><b>${nb.inDays === 0 ? "Today!" : nb.inDays.toLocaleString("en-IN")}</b><span>${nb.inDays === 0 ? `turning ${nb.turning}` : `days to birthday ${nb.turning} (${fmt(nb.date)})`}</span></div>
      </div>`;
    if (from.value || to.value) {
      const e = bornBetween(dob.value, from.value, to.value);
      elig.innerHTML = !e.ok
        ? `<div class="jd-verdict no" role="alert">${e.error}</div>`
        : e.eligible
          ? `<div class="jd-verdict ok" role="status"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Your date of birth is inside the allowed range.</div>`
          : `<div class="jd-verdict no" role="status"><i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Outside the allowed range: ${e.reason.replace(/\d{4}-\d{2}-\d{2}/, (s) => fmt(s))}. Check the notice for age relaxation (for example SC/ST, OBC or PwBD).</div>`;
    } else elig.innerHTML = "";
    if (!tracked && typeof window.jdTrack === "function") {
      tracked = true;
      window.jdTrack("tool_process_success", { tool: "age_calculator" });
    }
  }

  on.value = todayIso();
  [dob, on, from, to].forEach((el) => el.addEventListener("input", render));
  document.querySelectorAll("[data-on]").forEach((b) =>
    b.addEventListener("click", () => {
      const v = b.getAttribute("data-on");
      const y = new Date().getFullYear();
      on.value = v === "today" ? todayIso() : `${y}-${v}`;
      render();
    })
  );
  render();
})();
