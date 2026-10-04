// ============================================================
// Behaviour for the site footer + widget (every page).
//
// The header and footer MARKUP comes from the EJS partials
//   jobsdoor360-website/src/main/ejs/partials/layout/site-navbar.ejs
//   jobsdoor360-website/src/main/ejs/partials/layout/site-footer.ejs
// and is compiled into each page by `node compile.js`.
//
// This file:
//   - shows the back-to-top button after scrolling
//   - shows "Log out" in the footer when someone is signed in, on pages
//     that load Firebase (/staticfiles/db/dbconfig.js). On pages without
//     Firebase the link simply stays hidden.
// ============================================================
function backToTop() {
  const top = document.getElementById("backToTopBtn");
  if (!top) return;
  top.style.display = "none";
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => (top.style.display = window.scrollY > 800 ? "block" : "none"), { passive: true });
}

// Wait (briefly) for dbconfig.js to put Firebase auth on window.
function firebaseAuth(timeoutMs = 6000) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function check() {
      if (window.auth && typeof window.onAuthStateChanged === "function") resolve(window.auth);
      else if (Date.now() - start > timeoutMs) resolve(null);
      else setTimeout(check, 100);
    })();
  });
}

async function logoutLink() {
  const item = document.getElementById("jd-logout-item");
  const link = document.getElementById("jd-logout");
  if (!item || !link) return;
  // Only pages that load Firebase can know who is signed in.
  if (!document.querySelector('script[src*="/staticfiles/db/dbconfig.js"]')) return;
  const auth = await firebaseAuth();
  if (!auth) return;
  window.onAuthStateChanged(auth, (user) => {
    item.hidden = !user;
  });
  link.addEventListener("click", (e) => {
    e.preventDefault();
    // same as the old header "Logout" button
    localStorage.clear();
    auth
      .signOut()
      .catch((err) => console.error("Error signing out:", err))
      .finally(() => (window.location.href = "/login/"));
  });
}

// Scrollbar width, used by layout.css to keep the header/footer full width
// on pages whose <body> has side padding.
function scrollbarWidth() {
  const set = () =>
    document.documentElement.style.setProperty("--jd-sbw", `${window.innerWidth - document.documentElement.clientWidth}px`);
  set();
  window.addEventListener("resize", set, { passive: true });
}

function mount() {
  scrollbarWidth();
  backToTop();
  logoutLink();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}
