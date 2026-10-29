// ============================================================
// Utility Tools: Compress PDF (/tools/compress-pdf/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
//
// Each page is drawn with pdf.js at a lower resolution, saved as a JPEG,
// and the pages are put back together with jsPDF at their original size.
// This shrinks scanned documents and photo-heavy PDFs a lot. The cost:
// text in the new PDF is part of the picture, so it can't be selected or
// searched. If the result isn't smaller, we say so and keep nothing.
// ============================================================
(function () {
  "use strict";
  const { baseName, userError, yieldUI, canvasToBlob, isPdf, PDF_ACCEPT } = window.JDTools;

  const MAX_PAGES = 300;
  // scale 1 = 72 dpi
  const LEVELS = {
    strong: { scale: 1.0, quality: 0.5 }, //   ~72 dpi, smallest
    balanced: { scale: 1.4, quality: 0.62 }, // ~100 dpi
    light: { scale: 2.0, quality: 0.75 }, //   ~144 dpi, sharpest
  };
  const MAX_SIDE = 4000;
  const MIN_SAVING = 0.03; // must be at least 3% smaller to be worth it

  async function compressPdfs(files, opts, progress) {
    const { jsPDF } = window.jspdf;
    const level = LEVELS[opts.level] || LEVELS.balanced;
    const gray = opts.color === "gray";
    const results = [];
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      let pdf;
      try {
        pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      } catch (e) {
        results.push({ name: file.name, error: e && e.name === "PasswordException" ? "is password-protected" : "couldn't be read. It may be damaged" });
        continue;
      }
      if (pdf.numPages > MAX_PAGES) {
        results.push({ name: file.name, error: `has more than ${MAX_PAGES} pages, which is too many to compress in the browser` });
        pdf.destroy();
        continue;
      }
      let out = null;
      for (let p = 1; p <= pdf.numPages; p++) {
        progress(`File ${f + 1} of ${files.length}: page ${p} of ${pdf.numPages}`, (f + (p - 1) / pdf.numPages) / files.length);
        const page = await pdf.getPage(p);
        const base = page.getViewport({ scale: 1 }); // PDF points
        const scale = Math.min(level.scale, MAX_SIDE / Math.max(base.width, base.height));
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(vp.width));
        canvas.height = Math.max(1, Math.floor(vp.height));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        let src = canvas;
        if (gray) {
          const g = document.createElement("canvas");
          g.width = canvas.width;
          g.height = canvas.height;
          const gctx = g.getContext("2d");
          gctx.filter = "grayscale(1)";
          gctx.drawImage(canvas, 0, 0);
          src = g;
        }
        const blob = await canvasToBlob(src, "image/jpeg", level.quality);
        canvas.width = canvas.height = 0;
        if (src !== canvas) src.width = src.height = 0;
        page.cleanup();
        if (!blob) throw userError("A page is too big for your browser. Try the Strong level.");
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const orientation = base.width > base.height ? "landscape" : "portrait";
        if (!out) out = new jsPDF({ unit: "pt", format: [base.width, base.height], orientation, compress: true });
        else out.addPage([base.width, base.height], orientation);
        out.addImage(bytes, "JPEG", 0, 0, base.width, base.height, undefined, "FAST");
        await yieldUI();
      }
      pdf.destroy();
      const blob = out.output("blob");
      if (blob.size >= file.size * (1 - MIN_SAVING)) {
        results.push({ name: file.name, error: "is already as small as we can make it with this level. Try Strong, or Black and white" });
        continue;
      }
      results.push({ name: `${baseName(file.name)}-compressed.pdf`, blob });
    }
    return results;
  }

  window.JDTools.register("compress-pdf", {
    ga: "compress_pdf", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 1, ordered: false, fileIcon: "fa-file-pdf",
    wrongType: "only PDF files work here",
    pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
    fine: "Works best on scanned documents and PDFs with photos. Add one or more PDFs.",
    side: "Compression",
    sideNote: "Pages are saved as images, so text in the smaller PDF can't be selected or searched. Keep your original file too. Strong gives the smallest file; Light keeps it sharpest.",
    action: "Compress PDF",
    busy: "Making your PDF smaller…", done: (n) => (n > 1 ? "Your PDFs are smaller" : "Your PDF is smaller"), dl: "Download PDF",
    options: [
      { key: "level", label: "Level", def: "balanced", choices: [["strong", "Strong (smallest)"], ["balanced", "Balanced"], ["light", "Light (sharpest)"]] },
      { key: "color", label: "Colour", def: "color", choices: [["color", "Keep colour"], ["gray", "Black and white"]] },
    ],
    libs: ["pdfjsLib", "jspdf"], run: compressPdfs, next: ["merge-pdf", "pdf-to-image", "resize-image-kb"],
  });
})();
