// ============================================================
// Utility Tools: PDF to image (/tools/pdf-to-image/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// Each PDF page is drawn with pdf.js and saved as a JPG or PNG.
// ============================================================
(function () {
  "use strict";
  const { baseName, userError, yieldUI, canvasToBlob, isPdf, PDF_ACCEPT } = window.JDTools;

  const MAX_PAGES = 300; // keeps memory use reasonable in the browser
  const SCALE = { standard: 1.5, high: 3 }; // 1.5 ≈ 108 dpi, 3 ≈ 216 dpi
  const MAX_SIDE = 6000; // canvas limit that is safe on phones

  async function pdfToImages(files, opts, progress) {
    const type = opts.format === "png" ? "image/png" : "image/jpeg";
    const ext = opts.format === "png" ? "png" : "jpg";
    const results = [];
    let done = 0;
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      let pdf;
      try {
        pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      } catch (e) {
        results.push({ name: file.name, error: e && e.name === "PasswordException" ? "is password-protected" : "couldn't be read. It may be damaged" });
        continue;
      }
      const pages = pdf.numPages;
      const pad = String(pages).length;
      for (let p = 1; p <= pages; p++) {
        if (done >= MAX_PAGES) {
          results.push({ name: file.name, error: `has more pages than we can convert at once. The first ${MAX_PAGES} pages were saved` });
          f = files.length;
          break;
        }
        progress(`File ${f + 1} of ${files.length}: page ${p} of ${pages}`, (f + (p - 1) / pages) / files.length);
        const page = await pdf.getPage(p);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(SCALE[opts.quality] || SCALE.standard, MAX_SIDE / Math.max(base.width, base.height));
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff"; // JPG has no transparency; keep pages white
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const blob = await canvasToBlob(canvas, type, 0.92);
        canvas.width = canvas.height = 0; // free memory straight away
        page.cleanup();
        if (!blob) throw userError("A page is too big for your browser. Try Standard quality.");
        const suffix = pages > 1 ? `-page-${String(p).padStart(pad, "0")}` : "";
        results.push({ name: `${baseName(file.name)}${suffix}.${ext}`, blob });
        done++;
        await yieldUI();
      }
      pdf.destroy();
    }
    return results;
  }

  window.JDTools.register("pdf-to-image", {
    ga: "pdf_to_image", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 1, ordered: false, fileIcon: "fa-file-pdf",
    wrongType: "only PDF files work here",
    pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
    fine: "Every page becomes its own image. Add one or more PDFs.",
    side: "Image settings", sideNote: "High quality makes sharper, bigger files. Pick PNG for crisp text and diagrams, JPG for smaller files.",
    action: "Convert to images",
    busy: "Turning pages into images…", done: (n) => (n > 1 ? "Your images are ready" : "Your image is ready"), dl: "Download image",
    options: [
      { key: "format", label: "Format", def: "jpg", choices: [["jpg", "JPG"], ["png", "PNG"]] },
      { key: "quality", label: "Quality", def: "standard", choices: [["standard", "Standard"], ["high", "High"]] },
    ],
    libs: ["pdfjsLib"], run: pdfToImages, next: ["crop-image", "image-to-pdf"],
  });
})();
