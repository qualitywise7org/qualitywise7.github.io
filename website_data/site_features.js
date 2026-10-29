// ============================================================
// Site switches: what the header, footer and homepage show.
//
//   true  = shown
//   false = hidden. The code and the pages stay; the page is still
//           reachable by its URL. Flip it back to true and run
//           `node build.js` to show it again.
//
// Used by partials/navbar.ejs, partials/footer.ejs, main-files/index.ejs,
// tools/index.ejs and findme/index.ejs (passed to every page as
// `features` and `tools` by build_tasks.js).
// ============================================================

const features = {
  // ---- shown (the two main options) ----
  findme: true, //          header CTA, footer column, homepage card
  utilityTools: true, //    header menu, footer column, homepage card + tool grid

  // ---- hidden for now ----
  smartDecisions: false, // header "Smart Decisions" menu, footer column, homepage
  //                        "Make a decision" section, Findme start-screen and
  //                        report links to /smart-decisions/
  courses: false, //        header "Courses" menu (Study material, Courses & fees,
  //                        Placement classes, Free certifications), footer
  //                        "Courses" column, homepage learning cards
  careerCounselling: false, // header "Career Counselling" link (+ homepage card)
  blog: false, //           header "Blog" menu and footer "Blog" column
  results: false, //        footer "Our results" link
  donateBooks: false, //    footer "Donate books" link
  homeClassic: false, //    the previous homepage hero and "How JobsDoor360 works"

  // ---- inside Findme ----
  findmeProducts: true, //  JobsDoor360 product suggestions in the Findme report
};

// Every utility tool, in the order the hub, header, footer and homepage show
// them. `group` sets the section; `popular` marks the homepage card chips;
// `added` tools get a "New" tag.
// off: true = switched off: left out of every list and its page sends
// visitors to /tools/. The code stays; delete `off: true` to bring it back.
const allTools = [
  { key: "resize-image-kb", title: "Resize image to KB", desc: "Photo or signature under 20, 50 or 100 KB for exam and job forms", icon: "fa-compress", color: "jd-c-rkb", group: "photos", popular: true, added: true },
  { key: "crop-image", title: "Crop image", desc: "Square, passport photo, 16:9 and more", icon: "fa-crop-simple", color: "jd-c-crop", group: "photos", popular: true },
  { key: "merge-images", title: "Merge images", desc: "Join several images into one picture", icon: "fa-images", color: "jd-c-mimg", group: "photos" },
  { key: "compress-pdf", title: "Compress PDF", desc: "Make a PDF smaller to fit an upload limit", icon: "fa-file-zipper", color: "jd-c-cpdf", group: "pdf", popular: true, added: true },
  { key: "image-to-pdf", title: "Image to PDF", desc: "Turn JPG, PNG or WEBP images into one PDF", icon: "fa-file-image", color: "jd-c-img", group: "pdf", popular: true },
  { key: "merge-pdf", title: "Merge PDF", desc: "Join several PDFs into one, in your order", icon: "fa-layer-group", color: "jd-c-mpdf", group: "pdf", popular: true },
  { key: "word-to-pdf", title: "Word to PDF", desc: "Turn Word (.docx) files into PDFs", icon: "fa-file-word", color: "jd-c-w2p", group: "pdf" },
  { key: "pdf-to-word", title: "PDF to Word", desc: "Get editable text out of a PDF", icon: "fa-file-pen", color: "jd-c-p2w", group: "pdf" },
  { key: "pdf-to-image", title: "PDF to image", desc: "Save every PDF page as a JPG or PNG", icon: "fa-file-export", color: "jd-c-p2i", group: "pdf" },
  { key: "age-calculator", title: "Age calculator", desc: "Exact age on any date, and an exam age-limit check", icon: "fa-cake-candles", color: "jd-c-age", group: "everyday", added: true, off: true },
  { key: "word-counter", title: "Word counter", desc: "Words, characters and reading time for essays and forms", icon: "fa-align-left", color: "jd-c-wc", group: "everyday", added: true },
  { key: "qr-code", title: "QR code generator", desc: "QR codes for links, WhatsApp, UPI payments and Wi-Fi", icon: "fa-qrcode", color: "jd-c-qr", group: "everyday", added: true },
];
// the tools that are switched on (what every page lists)
const tools = allTools.filter((t) => !t.off);

const toolGroups = [
  { key: "photos", title: "Photos for exam and job forms", desc: "Get photos and signatures to the size and shape a form asks for." },
  { key: "pdf", title: "PDF and documents", desc: "Convert, join and shrink documents." },
  { key: "everyday", title: "Everyday helpers", desc: "Count words and make QR codes." },
];

module.exports = { features, tools, allTools, toolGroups };
