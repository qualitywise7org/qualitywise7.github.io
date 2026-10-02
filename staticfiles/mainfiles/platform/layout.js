// ============================================================
// Shared navbar + footer for the platform pages.
//
// Pages include <div id="jd-navbar-slot"></div> and
// <div id="jd-footer-slot"></div>, and load this file as a module.
// The homepage (/index.html) carries a STATIC copy of the same markup
// (generated from renderNav/renderFooter below) for SEO and speed, so
// if you change the menu here, update the homepage copy too.
//
// Navigation is grouped by what the user wants to do:
//   Smart Decisions  – the 4 decision helpers (career, insurance,
//                      property, IT)
//   Courses          – existing course, placement and certification pages
//   Career Counselling
//   Utility Tools    – PDF / image tools
//   CTA              – Findme quiz ("not sure where to start?")
// Login / Sign up / My Account are intentionally NOT in the navbar:
// sign-up is offered at the moment it's useful (saving a result), and
// "My account" lives in the footer for returning users.
// ============================================================

export const NAV = [
  {
    label: "Smart Decisions",
    ga: "nav_smart_decisions",
    base: "/smart-decisions/",
    items: [
      { href: "/smart-decisions/career/", title: "Career decisions", desc: "Which stream or career fits you", ga: "nav_smart_career" },
      { href: "/smart-decisions/insurance/", title: "Insurance", desc: "The cover you actually need", ga: "nav_smart_insurance" },
      { href: "/smart-decisions/investment/", title: "Property investment", desc: "Price check before you buy", ga: "nav_smart_investment" },
      { href: "/smart-decisions/it-help/", title: "IT help", desc: "Which tech expert to hire", ga: "nav_smart_it_help" },
    ],
    all: { href: "/smart-decisions/", title: "All Smart Decisions", ga: "nav_smart_all" },
  },
  {
    label: "Courses",
    ga: "nav_courses",
    base: null,
    items: [
      { href: "/pricing/", title: "Courses & fees", desc: "Programming courses and internships", ga: "nav_courses_pricing" },
      { href: "/placement/", title: "Placement classes", desc: "Interview and placement prep", ga: "nav_courses_placement" },
      { href: "/test/", title: "Free certifications", desc: "Take a test, get certified", ga: "nav_courses_certifications" },
    ],
  },
  { label: "Career Counselling", href: "/career-counselling/", ga: "nav_career_counselling" },
  {
    label: "Utility Tools",
    ga: "nav_utility_tools",
    base: "/tools/",
    items: [
      { href: "/tools/image-to-pdf/", title: "Image to PDF", desc: "JPG, PNG or WEBP into a PDF", ga: "nav_tool_image_to_pdf" },
      { href: "/tools/merge-pdf/", title: "Merge PDF", desc: "Join several PDFs into one", ga: "nav_tool_merge_pdf" },
      { href: "/tools/word-to-pdf/", title: "Word to PDF", desc: "Turn .docx files into PDFs", ga: "nav_tool_word_to_pdf" },
      { href: "/tools/pdf-to-word/", title: "PDF to Word", desc: "Get editable text from a PDF", ga: "nav_tool_pdf_to_word" },
      { href: "/tools/merge-images/", title: "Merge images", desc: "Join images into one picture", ga: "nav_tool_merge_images" },
    ],
    all: { href: "/tools/", title: "All tools", ga: "nav_tools_all" },
  },
];

export const NAV_CTA = { href: "/findme/", label: "Take the free quiz", ga: "nav_cta_findme" };

export const FOOTER = [
  {
    title: "Smart Decisions",
    links: [
      ["/smart-decisions/career/", "Career decisions"],
      ["/smart-decisions/insurance/", "Insurance"],
      ["/smart-decisions/investment/", "Property investment"],
      ["/smart-decisions/it-help/", "IT help"],
      ["/findme/", "Findme quiz"],
    ],
  },
  {
    title: "Learn & grow",
    links: [
      ["/pricing/", "Courses & fees"],
      ["/placement/", "Placement classes"],
      ["/test/", "Free certifications"],
      ["/career-counselling/", "Career counselling"],
      ["/apply/", "Apply for a course"],
    ],
  },
  {
    title: "Utility Tools",
    links: [
      ["/tools/image-to-pdf/", "Image to PDF"],
      ["/tools/merge-pdf/", "Merge PDF"],
      ["/tools/word-to-pdf/", "Word to PDF"],
      ["/tools/pdf-to-word/", "PDF to Word"],
      ["/tools/merge-images/", "Merge images"],
    ],
  },
  {
    title: "Career resources",
    links: [
      ["/careeroptions/", "Careers after 10th & 12th"],
      ["/careeroptions/industries/", "Industries & sectors"],
      ["/blog/career-guide-by-big-people/", "Career advice from leaders"],
      ["/biographies/", "Biographies"],
      ["/blog/businessplans/", "Business plans"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about/", "About us"],
      ["/results/", "Our results"],
      ["/contactus/", "Contact us"],
      ["/privacy/", "Privacy policy"],
      ["/socialwork/donatebook/", "Donate books"],
      ["/myaccount/", "My account"],
    ],
  },
];

const SOCIAL = [
  ["https://www.facebook.com/profile.php?id=100093276582711", "https://img.icons8.com/color/48/facebook-new.png", "Facebook"],
  ["https://www.instagram.com/jobsdoor360/", "https://img.icons8.com/color/48/instagram-new--v1.png", "Instagram"],
  ["https://www.linkedin.com/in/qualitywise-b05857275/", "https://img.icons8.com/color/48/linkedin.png", "LinkedIn"],
  ["https://www.youtube.com/channel/UCKs2I2QtwuMG4jKDycq6ZKQ", "https://img.icons8.com/color/48/youtube-play.png", "YouTube"],
];

const WHATSAPP = "https://api.whatsapp.com/send?phone=918319349660&text=I want to know more!";

const norm = (p) => (p.endsWith("/") ? p : p + "/");
const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export function renderNav(path = "/") {
  const here = norm(path);
  const cur = (href) => (href === here ? ' aria-current="page"' : "");
  const item = (it) =>
    `<li><a class="dropdown-item${it.href === here ? " active" : ""}" href="${it.href}" data-ga-name="${it.ga}"${cur(it.href)}>` +
    `<span class="jd-mi-t">${it.title}</span><span class="jd-mi-d">${it.desc}</span></a></li>`;

  const groups = NAV.map((g) => {
    if (!g.items) {
      const active = here === g.href;
      return `<li class="nav-item"><a class="nav-link${active ? " active" : ""}" href="${g.href}" data-ga-name="${g.ga}"${cur(g.href)}>${g.label}</a></li>`;
    }
    const inGroup = g.base ? here.startsWith(g.base) : g.items.some((it) => it.href === here);
    const all = g.all
      ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item jd-mi-all${g.all.href === here ? " active" : ""}" href="${g.all.href}" data-ga-name="${g.all.ga}"${cur(g.all.href)}>${g.all.title} →</a></li>`
      : "";
    return (
      `<li class="nav-item dropdown">` +
      `<a class="nav-link dropdown-toggle${inGroup ? " active" : ""}" href="#" id="jd-dd-${slugOf(g.label)}" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-ga-name="${g.ga}">${g.label}</a>` +
      `<ul class="dropdown-menu" aria-labelledby="jd-dd-${slugOf(g.label)}">${g.items.map(item).join("")}${all}</ul>` +
      `</li>`
    );
  }).join("");

  return (
    `<nav class="navbar navbar-expand-lg bg-body-tertiary jd-nav" aria-label="Main">` +
    `<div class="container-fluid">` +
    `<a class="brand" href="/" data-ga-name="nav_logo"><img src="/assets/Jobsdoor360 -logos__black.png" alt="JobsDoor360 home" /></a>` +
    `<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#jdNavMenu" aria-controls="jdNavMenu" aria-expanded="false" aria-label="Open menu" data-ga-name="nav_menu_toggle"><span class="navbar-toggler-icon"></span></button>` +
    `<div class="collapse navbar-collapse" id="jdNavMenu">` +
    `<ul class="navbar-nav align-items-lg-center">${groups}` +
    `<li class="nav-item jd-nav-cta"><a class="nav-link" href="${NAV_CTA.href}" data-ga-event="cta_click" data-ga-name="${NAV_CTA.ga}">${NAV_CTA.label}</a></li>` +
    `</ul></div></div></nav>`
  );
}

export function renderFooter() {
  const cols = FOOTER.map(
    (c) =>
      `<div class="col-6 col-md-4 col-lg">` +
      `<h2>${c.title}</h2><ul>` +
      c.links.map(([href, label]) => `<li><a class="jd-fl" href="${href}">${label}</a></li>`).join("") +
      `</ul></div>`
  ).join("");
  const social = SOCIAL.map(
    ([href, img, name]) =>
      `<a href="${href}" target="_blank" rel="noopener" data-ga-name="social_${name.toLowerCase()}" aria-label="JobsDoor360 on ${name}"><img src="${img}" width="30" height="30" alt="" /></a>`
  ).join("");
  return (
    `<footer class="jd-footer">` +
    `<div class="container">` +
    `<div class="row">${cols}</div>` +
    `<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-1">` +
    `<div class="jd-social">${social}</div>` +
    `<a class="jd-fl" href="${WHATSAPP}" target="_blank" rel="noopener" data-ga-name="footer_whatsapp">Questions? Chat with us on WhatsApp</a>` +
    `</div>` +
    `<div class="jd-foot-bottom">` +
    `<p class="mb-1">Copyright JobsDoor360 © 2025. All rights reserved</p>` +
    `<p class="mb-0"><strong>Vinod</strong> · AIEEE AIR 10630, State Rank 602, BTech + MTech from ABV-IIITM Gwalior · <strong>12 years in IT companies</strong></p>` +
    `</div></div></footer>`
  );
}

export function renderWidgets() {
  return (
    `<div class="chat-back-to-top" data-ga-section="whatsapp_widget">` +
    `<a href="${WHATSAPP}" target="_blank" rel="noopener" style="font-size:14px;font-weight:500;color:black" data-ga-name="whatsapp_widget_text">Any question or complaint</a>` +
    `<div class="whatsapp-chat"><a href="${WHATSAPP}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" data-ga-name="whatsapp_widget_icon"><i class="fab fa-whatsapp" style="font-size:27px;margin-bottom:13px" aria-hidden="true"></i></a></div>` +
    `<button id="backToTopBtn" class="back-to-top-btn" type="button" aria-label="Back to top" data-ga-name="back_to_top"><i class="fa-solid fa-chevron-up" aria-hidden="true"></i></button>` +
    `</div>`
  );
}

function mount() {
  const head = document.getElementById("jd-navbar-slot");
  const foot = document.getElementById("jd-footer-slot");
  if (head) head.innerHTML = renderNav(location.pathname);
  if (foot) {
    foot.innerHTML = renderFooter() + renderWidgets();
    const top = document.getElementById("backToTopBtn");
    if (top) {
      top.style.display = "none";
      top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      window.addEventListener("scroll", () => (top.style.display = window.scrollY > 800 ? "block" : "none"), { passive: true });
    }
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}
