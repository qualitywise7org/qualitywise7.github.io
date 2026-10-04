// "We'll get back to you soon" page (/request-received/?for=<product>).
// Shows what the visitor asked for and pre-fills the WhatsApp message.
// Unknown or missing ?for= keeps the generic text that is already on the page.
const PRODUCTS = {
  career_detailed_report: "the detailed career report",
  counselling_report: "the detailed career report",
  counselling_session: "a one-to-one career counselling session",
  book_report_bundle: "the book and report bundle",
  school_workshop: "a career workshop for your school",
  insurance_comparison: "the detailed insurance comparison",
  insurance_expert_call: "a call with an insurance adviser",
  property_report: "the detailed property report",
  it_expert_match: "being matched with an IT expert",
};
const WHATSAPP = "https://api.whatsapp.com/send?phone=918319349660&text=";

const key = new URLSearchParams(location.search).get("for");
const label = Object.prototype.hasOwnProperty.call(PRODUCTS, key) ? PRODUCTS[key] : null;

if (label) {
  document.getElementById("jd-rr-line").textContent =
    `We've noted your interest in ${label}. Someone from our team will get back to you soon.`;
  document.getElementById("jd-rr-whatsapp").href = WHATSAPP + encodeURIComponent(`Hi, I'm interested in ${label}.`);
}

// "Go back" returns to the page the visitor came from on this site.
try {
  const ref = document.referrer ? new URL(document.referrer) : null;
  if (ref && ref.origin === location.origin && ref.pathname !== location.pathname) {
    document.getElementById("jd-rr-back").href = ref.pathname + ref.search;
  }
} catch (_) {}
