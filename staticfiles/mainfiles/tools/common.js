// ============================================================
// Utility Tools: helpers SHARED by every tool page.
//
// Load order on a tool page (all classic scripts, no imports):
//   1. the tool's libraries from CDN (pinned + SRI)
//   2. /staticfiles/mainfiles/tools/common.js         (this file)
//   3. /staticfiles/mainfiles/tools/<tool>/script.js  (the converter
//      and settings for that one tool; registers itself here)
//   4. /staticfiles/mainfiles/tools/script.js         (the page UI:
//      pick / drop files -> reorder + options -> process -> download)
//
// Change a single tool in its own folder; this file and the UI are
// used by all five tools.
// ============================================================
(function () {
  "use strict";

  const MAX_FILES = 50;
  const MAX_MB = 100;
  const A4_PX_W = 794;
  const A4_PX_H = 1123;
  const PAGE_PAD = 72;

  // ---------------- helpers ----------------
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const baseName = (n) => n.replace(/\.[^.]+$/, "") || "file";
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function fmtSize(b) {
    if (b < 1024) return b + " B";
    if (b < 1048576) return Math.round(b / 1024) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  }
  function userError(msg) {
    const e = new Error(msg);
    e.userMessage = msg;
    return e;
  }
  // Let the page repaint between heavy steps (skipped in background tabs,
  // where animation frames pause).
  const yieldUI = () =>
    document.hidden ? Promise.resolve() : new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  function track(name, params) {
    try {
      if (typeof window.jdTrack === "function") window.jdTrack(name, params);
      else if (typeof window.gtag === "function") window.gtag("event", name, params);
    } catch (_) {}
  }
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(userError(`One of the images couldn't be opened (${file.name}).`));
      };
      img.src = url;
    });
  }
  const canvasToBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));

  const isImage = (f) => /^image\/(png|jpeg|webp)$/i.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name);
  const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
  const isDocx = (f) => /\.docx$/i.test(f.name);

  const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
  const MARGINS = { none: 0, small: 24, big: 56 };

  const IMG_ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
  const PDF_ACCEPT = "application/pdf,.pdf";
  const DOCX_ACCEPT = ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const META = {
    "image-to-pdf": { title: "Image to PDF", desc: "Turn JPG, PNG or WEBP images into a PDF.", icon: "fa-file-image", color: "jd-c-img" },
    "merge-pdf": { title: "Merge PDF", desc: "Join several PDFs into one, in any order.", icon: "fa-layer-group", color: "jd-c-mpdf" },
    "merge-images": { title: "Merge images", desc: "Join images into one picture.", icon: "fa-images", color: "jd-c-mimg" },
    "word-to-pdf": { title: "Word to PDF", desc: "Turn Word (.docx) files into PDFs.", icon: "fa-file-word", color: "jd-c-w2p" },
    "pdf-to-word": { title: "PDF to Word", desc: "Get editable text out of a PDF.", icon: "fa-file-pen", color: "jd-c-p2w" },
  };

  // Each tool's script.js calls register() with its settings + converter.
  const defs = {};
  function register(key, def) {
    defs[key] = def;
  }

  window.JDTools = {
    defs,
    register,
    MAX_FILES,
    MAX_MB,
    A4_PX_W,
    A4_PX_H,
    PAGE_PAD,
    esc,
    baseName,
    plural,
    fmtSize,
    userError,
    yieldUI,
    track,
    loadImage,
    canvasToBlob,
    isImage,
    isPdf,
    isDocx,
    PAGE_SIZES,
    MARGINS,
    IMG_ACCEPT,
    PDF_ACCEPT,
    DOCX_ACCEPT,
    META,
  };
})();
