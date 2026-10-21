// ============================================================
// Behaviour for the site footer + widget (every page).
//
// The header and footer MARKUP comes from the EJS partials
//   jobsdoor360-website/src/main/ejs/partials/navbar.ejs
//   jobsdoor360-website/src/main/ejs/partials/footer.ejs
// and is compiled into each page by `node build.js`.
//
// This file:
//   - shows the back-to-top button after scrolling
//   - for signed-in users, on pages that load Firebase
//     (/staticfiles/db/dbconfig.js): header "Login" becomes "My account",
//     "Sign up" becomes "Log out", and "Log out" shows in the footer.
//     Pages without Firebase always show Login / Sign up.
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

function signOut(auth) {
  // same as the old header "Logout" button
  localStorage.clear();
  auth
    .signOut()
    .catch((err) => console.error("Error signing out:", err))
    .finally(() => (window.location.href = "/login/"));
}

async function authLinks() {
  // Only pages that load Firebase can know who is signed in.
  if (!document.querySelector('script[src*="/staticfiles/db/dbconfig.js"]')) return;
  const auth = await firebaseAuth();
  if (!auth) return;
  const footItem = document.getElementById("jd-logout-item");
  const login = document.getElementById("jd-login");
  const signup = document.getElementById("jd-signup");
  let signedIn = false;
  window.onAuthStateChanged(auth, (user) => {
    signedIn = !!user;
    if (footItem) footItem.hidden = !user;
    if (login) {
      login.textContent = user ? "My account" : "Login";
      login.href = user ? "/myaccount/" : "/login/";
      login.dataset.gaName = user ? "nav_myaccount" : "nav_login";
    }
    if (signup) {
      signup.textContent = user ? "Log out" : "Sign up";
      signup.href = user ? "/login/" : "/signup/";
      signup.dataset.gaName = user ? "nav_logout" : "nav_signup";
    }
  });
  if (signup) {
    signup.addEventListener("click", (e) => {
      if (!signedIn) return; // plain "Sign up" link
      e.preventDefault();
      signOut(auth);
    });
  }
  const footLink = document.getElementById("jd-logout");
  if (footLink) {
    footLink.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth);
    });
  }
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
  authLinks();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}
