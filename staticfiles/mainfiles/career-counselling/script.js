// Career Counselling — remembers which option (free quiz, report,
// live session, book bundle) the family picked. The click itself is
// tracked by ga.js through the data-ga-* attributes on each button.
import { getCurrentUser, saveSmartProfile } from "/staticfiles/mainfiles/platform/common.js?v=20261001";

document.querySelectorAll("[data-tier]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tier = btn.getAttribute("data-tier");
    // don't block the navigation; save in the background
    getCurrentUser().then((user) =>
      saveSmartProfile(user?.email, { counselling: { picked: tier, at: new Date().toISOString() } })
    );
  });
});
