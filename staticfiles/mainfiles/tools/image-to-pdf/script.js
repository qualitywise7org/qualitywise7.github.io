// ============================================================
// Utility Tools: Image to PDF (/tools/image-to-pdf/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// ============================================================
(function () {
  "use strict";
  const { baseName, yieldUI, loadImage, isImage, PAGE_SIZES, MARGINS, IMG_ACCEPT } = window.JDTools;

  async function imagesToPdf(files, opts, progress) {
    const { jsPDF } = window.jspdf;
    const m = MARGINS[opts.margin] ?? 24;
    let pdf = null;
    for (let i = 0; i < files.length; i++) {
      progress(`Adding image ${i + 1} of ${files.length}`, i / files.length);
      const { img, url } = await loadImage(files[i]);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      let pw;
      let ph;
      if (opts.size === "fit") {
        const k = 842 / Math.max(w, h);
        pw = w * k + 2 * m;
        ph = h * k + 2 * m;
      } else {
        const [a, b] = PAGE_SIZES[opts.size] || PAGE_SIZES.a4;
        const landscape = opts.orientation === "landscape" || (opts.orientation !== "portrait" && w > h);
        pw = landscape ? b : a;
        ph = landscape ? a : b;
      }
      const orientation = pw > ph ? "landscape" : "portrait";
      if (!pdf) pdf = new jsPDF({ unit: "pt", format: [pw, ph], orientation });
      else pdf.addPage([pw, ph], orientation);

      const r = Math.min((pw - 2 * m) / w, (ph - 2 * m) / h);
      const dw = w * r;
      const dh = h * r;
      // Redraw through a canvas: normalises PNG/JPG/WEBP and keeps huge
      // photos to a sensible size.
      const scale = Math.min(1, 3000 / Math.max(w, h));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w * scale));
      c.height = Math.max(1, Math.round(h * scale));
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const png = /png/i.test(files[i].type) || /\.png$/i.test(files[i].name);
      pdf.addImage(c.toDataURL(png ? "image/png" : "image/jpeg", 0.92), png ? "PNG" : "JPEG", (pw - dw) / 2, (ph - dh) / 2, dw, dh, undefined, "FAST");
      await yieldUI();
    }
    progress("Saving your PDF", 1);
    const name = files.length === 1 ? baseName(files[0].name) + ".pdf" : "images.pdf";
    return [{ name, blob: pdf.output("blob") }];
  }

  window.JDTools.register("image-to-pdf", {
      ga: "image_to_pdf", kind: "image", accept: IMG_ACCEPT, isOk: isImage, min: 1, ordered: true, fileIcon: "fa-file-image",
      wrongType: "only JPG, PNG or WEBP images work here",
      pick: "Select images", drop: "or drop images anywhere on this page",
      fine: "Add as many images as you like. Each one becomes a page, in the order you set.",
      orderHint: "Drag the images, or use the arrows, to set the page order.",
      side: "PDF settings", action: "Convert to PDF",
      busy: "Making your PDF…", done: () => "Your PDF is ready", dl: "Download PDF",
      options: [
        { key: "size", label: "Page size", def: "a4", choices: [["a4", "A4"], ["letter", "US Letter"], ["fit", "Same as image"]] },
        { key: "orientation", label: "Orientation", def: "auto", choices: [["auto", "Auto"], ["portrait", "Portrait"], ["landscape", "Landscape"]], off: (o) => o.size === "fit" },
        { key: "margin", label: "Margin", def: "small", choices: [["none", "None"], ["small", "Small"], ["big", "Big"]] },
      ],
      libs: ["jspdf"], run: imagesToPdf, next: ["merge-pdf", "pdf-to-word"],
  });
})();
