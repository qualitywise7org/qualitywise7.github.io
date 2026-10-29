// ============================================================
// Age calculator logic (pure, no DOM). Used by the page and by the tests.
// Dates are plain "YYYY-MM-DD" strings, read as calendar dates (no time
// zones), so the result is the same in every browser.
// ============================================================
(function (root) {
  "use strict";

  function parse(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    const y = +m[1];
    const mo = +m[2];
    const d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
    return { y, m: mo, d };
  }
  const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  function daysInMonth(y, m) {
    return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  }
  const dayNumber = (dt) => Math.round(Date.UTC(dt.y, dt.m - 1, dt.d) / 86400000);
  const cmp = (a, b) => dayNumber(a) - dayNumber(b);
  const iso = (dt) => `${dt.y}-${String(dt.m).padStart(2, "0")}-${String(dt.d).padStart(2, "0")}`;

  // `dt` plus k calendar months; the day is clamped to the month's length
  // (31 Jan + 1 month = 28 or 29 Feb).
  function addMonths(dt, k) {
    const total = dt.y * 12 + (dt.m - 1) + k;
    const y = Math.floor(total / 12);
    const m = (total % 12) + 1;
    return { y, m, d: Math.min(dt.d, daysInMonth(y, m)) };
  }

  // Completed years, months and days from `dob` to `on` (on >= dob):
  // the most whole months that fit, then the days left over.
  function ageOn(dobStr, onStr) {
    const dob = parse(dobStr);
    const on = parse(onStr);
    if (!dob || !on) return { ok: false, error: "Enter both dates." };
    if (cmp(on, dob) < 0) return { ok: false, error: "The date of birth is after the date you are checking." };
    let k = (on.y - dob.y) * 12 + (on.m - dob.m);
    if (cmp(addMonths(dob, k), on) > 0) k -= 1;
    const years = Math.floor(k / 12);
    const months = k % 12;
    const days = dayNumber(on) - dayNumber(addMonths(dob, k));
    const totalDays = dayNumber(on) - dayNumber(dob);
    return { ok: true, years, months, days, totalDays, totalWeeks: Math.floor(totalDays / 7), nextBirthday: nextBirthday(dob, on) };
  }

  // Days until the next birthday on or after `on`. 29 Feb birthdays fall on
  // 28 Feb in other years.
  function nextBirthday(dob, on) {
    const bdayIn = (y) => ({ y, m: dob.m, d: dob.m === 2 && dob.d === 29 && !isLeap(y) ? 28 : dob.d });
    let next = bdayIn(on.y);
    if (cmp(next, on) < 0) next = bdayIn(on.y + 1);
    return { date: iso(next), inDays: dayNumber(next) - dayNumber(on), turning: next.y - dob.y };
  }

  // Exam notices state the allowed birth dates, e.g. "born not before
  // 02-08-1999 and not later than 01-08-2008". Both ends are inclusive.
  function bornBetween(dobStr, fromStr, toStr) {
    const dob = parse(dobStr);
    const from = parse(fromStr);
    const to = parse(toStr);
    if (!dob) return { ok: false, error: "Enter the date of birth first." };
    if (!from && !to) return { ok: false, error: "Enter at least one date from the notice." };
    if (from && to && cmp(from, to) > 0) return { ok: false, error: "The first date should be the earlier one." };
    if (from && cmp(dob, from) < 0) return { ok: true, eligible: false, reason: "born before " + iso(from) };
    if (to && cmp(dob, to) > 0) return { ok: true, eligible: false, reason: "born after " + iso(to) };
    return { ok: true, eligible: true };
  }

  const api = { parse, isLeap, daysInMonth, ageOn, bornBetween, iso };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JDAge = api;
})(this);
