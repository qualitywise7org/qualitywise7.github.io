// ============================================================
// Word counter logic (pure, no DOM). Used by the page and by the tests.
// Works for English, Hindi and other scripts: a word is a run of letters,
// marks (Devanagari matras) or digits, optionally joined by ' or -.
// ============================================================
(function (root) {
  "use strict";

  const WORD = /[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*/gu;
  const HAS_WORD = /[\p{L}\p{N}]/u;
  const SENTENCE_END = /[.!?।॥]+/u;

  // Characters as people see them (grapheme clusters), when the browser supports it.
  function charCount(s) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      let n = 0;
      for (const _ of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)) n++;
      return n;
    }
    return [...s].length;
  }

  function countText(text) {
    const s = String(text || "");
    const words = s.match(WORD) || [];
    const sentences = s.split(SENTENCE_END).filter((part) => HAS_WORD.test(part)).length;
    const paragraphs = s.split(/\n+/).filter((p) => p.trim().length).length;
    return {
      words: words.length,
      characters: charCount(s),
      charactersNoSpaces: charCount(s.replace(/\s+/g, "")),
      sentences,
      paragraphs,
      readingMinutes: words.length / 200, // average silent reading speed
      speakingMinutes: words.length / 130, // average speaking speed
    };
  }

  // "about 2 min", "under a minute", "45 sec"
  function minutesLabel(min) {
    if (min <= 0) return "0 sec";
    if (min < 1) return Math.max(1, Math.round(min * 60)) + " sec";
    const m = Math.round(min);
    return m + " min";
  }

  // Remaining against a limit; negative = over the limit.
  function limitStatus(counts, limit, unit) {
    const n = Number(limit);
    if (!n || n < 1) return null;
    const used = unit === "characters" ? counts.characters : counts.words;
    return { used, limit: n, left: n - used, over: used > n };
  }

  const api = { countText, minutesLabel, limitStatus };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JDWordCount = api;
})(this);
