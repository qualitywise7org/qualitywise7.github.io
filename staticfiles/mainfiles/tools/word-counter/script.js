// Word counter page (/tools/word-counter/). Logic: count.js (window.JDWordCount).
// The text never leaves the page; it is kept in this tab's sessionStorage only,
// so a refresh doesn't lose it.
(function () {
  "use strict";
  const { countText, minutesLabel, limitStatus } = window.JDWordCount;
  const $ = (id) => document.getElementById(id);
  const box = $("wc-text");
  const limit = $("wc-limit");
  const unit = $("wc-unit");
  const KEY = "jd_word_counter_text";
  let tracked = false;
  let timer = null;

  function render() {
    const c = countText(box.value);
    $("wc-words").textContent = c.words.toLocaleString("en-IN");
    $("wc-chars").textContent = c.characters.toLocaleString("en-IN");
    $("wc-chars-ns").textContent = c.charactersNoSpaces.toLocaleString("en-IN");
    $("wc-sent").textContent = c.sentences.toLocaleString("en-IN");
    $("wc-para").textContent = c.paragraphs.toLocaleString("en-IN");
    $("wc-read").textContent = minutesLabel(c.readingMinutes);
    $("wc-speak").textContent = minutesLabel(c.speakingMinutes);
    const st = limitStatus(c, limit.value, unit.value);
    const out = $("wc-limit-out");
    if (!st) out.innerHTML = "";
    else if (st.over) out.innerHTML = `<div class="jd-verdict no" role="status">${(-st.left).toLocaleString("en-IN")} ${unit.value} over the limit of ${st.limit.toLocaleString("en-IN")}.</div>`;
    else out.innerHTML = `<div class="jd-verdict ok" role="status">${st.left.toLocaleString("en-IN")} ${unit.value} left (limit ${st.limit.toLocaleString("en-IN")}).</div>`;
    if (!tracked && c.words >= 5 && typeof window.jdTrack === "function") {
      tracked = true;
      window.jdTrack("tool_process_success", { tool: "word_counter" });
    }
  }

  try {
    box.value = sessionStorage.getItem(KEY) || "";
  } catch (_) {}
  const keep = () => {
    try {
      sessionStorage.setItem(KEY, box.value);
    } catch (_) {}
  };
  box.addEventListener("input", () => {
    render();
    clearTimeout(timer);
    timer = setTimeout(keep, 400);
  });
  // also on refresh / tab close, in case the last keystroke was < 400 ms ago
  window.addEventListener("pagehide", keep);
  [limit, unit].forEach((el) => el.addEventListener("input", render));
  $("wc-clear").addEventListener("click", () => {
    box.value = "";
    try {
      sessionStorage.removeItem(KEY);
    } catch (_) {}
    render();
    box.focus();
  });
  $("wc-copy").addEventListener("click", async () => {
    const b = $("wc-copy");
    try {
      await navigator.clipboard.writeText(box.value);
      b.textContent = "Copied";
    } catch (_) {
      box.select();
      b.textContent = "Press Ctrl+C to copy";
    }
    setTimeout(() => (b.textContent = "Copy text"), 1800);
  });
  render();
})();
