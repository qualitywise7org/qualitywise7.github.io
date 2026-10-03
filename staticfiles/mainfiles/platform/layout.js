// ============================================================
// Shared behaviour for the platform pages' footer widget.
//
// The navbar and footer MARKUP now comes from the EJS partials
//   jobsdoor360-website/src/main/ejs/partials/platform/navbar.ejs
//   jobsdoor360-website/src/main/ejs/partials/platform/footer.ejs
// and is compiled into each page by `node compile.js`, so menus are
// changed in one place and pages no longer build them in the browser.
//
// This file only wires the back-to-top button (shown after scrolling).
// ============================================================
function mount() {
  const top = document.getElementById("backToTopBtn");
  if (!top) return;
  top.style.display = "none";
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => (top.style.display = window.scrollY > 800 ? "block" : "none"), { passive: true });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}
