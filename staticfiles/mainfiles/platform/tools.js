// ============================================================
// Utility Tools engine (one file for all tool pages).
//
// Each tool page sets <body data-tool="merge-pdf"> and has an empty
// <div id="jd-tool"></div>. This file draws the whole tool:
//   pick / drop files -> reorder + options -> process -> download
//
// Everything runs in the browser. Files are never uploaded, and file
// names are never sent to analytics (only counts and option choices).
//
// Libraries come from the page's <script> tags (pinned + SRI):
//   window.jspdf, window.html2canvas, window.mammoth,
//   window.pdfjsLib, window.PDFLib, window.JSZip
// Deliberately has no imports and no Firebase dependency, so nothing
// else on the page can stop the tools from working.
// ============================================================
(function () {
  "use strict";

  const root = document.getElementById("jd-tool");
  const TOOL_KEY = document.body.getAttribute("data-tool");
  if (!root || !TOOL_KEY) return;

  const MAX_FILES = 50;
  const MAX_MB = 100;
  const A4_PX_W = 794;
  const A4_PX_H = 1123;
  const PAGE_PAD = 72;

  // ---------------- helpers ----------------
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const baseName = (n) => n.replace(/\.[^.]+$/, "") || "file";
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function fmtSize(b) {
    if (b < 1024) return b + " B";
    if (b < 1048576) return Math.round(b / 1024) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  }
  function userError(msg) {
    const e = new Error(msg);
    e.userMessage = msg;
    return e;
  }
  // Let the page repaint between heavy steps (skipped in background tabs,
  // where animation frames pause).
  const yieldUI = () =>
    document.hidden ? Promise.resolve() : new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  function track(name, params) {
    try {
      if (typeof window.jdTrack === "function") window.jdTrack(name, params);
      else if (typeof window.gtag === "function") window.gtag("event", name, params);
    } catch (_) {}
  }
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(userError(`One of the images couldn't be opened (${file.name}).`));
      };
      img.src = url;
    });
  }
  const canvasToBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));

  const isImage = (f) => /^image\/(png|jpeg|webp)$/i.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name);
  const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
  const isDocx = (f) => /\.docx$/i.test(f.name);

  // =========================================================
  // Converters
  // =========================================================
  const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
  const MARGINS = { none: 0, small: 24, big: 56 };

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

  async function mergeImages(files, opts, progress) {
    const vertical = opts.direction !== "horizontal";
    const gap = { none: 0, small: 16, big: 48 }[opts.spacing] ?? 0;
    const loaded = [];
    for (let i = 0; i < files.length; i++) {
      progress(`Loading image ${i + 1} of ${files.length}`, (i / files.length) * 0.7);
      loaded.push(await loadImage(files[i]));
    }
    let W = 0;
    let H = 0;
    for (const { img } of loaded) {
      if (vertical) {
        W = Math.max(W, img.naturalWidth);
        H += img.naturalHeight;
      } else {
        W += img.naturalWidth;
        H = Math.max(H, img.naturalHeight);
      }
    }
    if (vertical) H += gap * (loaded.length - 1);
    else W += gap * (loaded.length - 1);
    // Stay inside browser canvas limits (Safari/iOS are the strictest).
    const s = Math.min(1, 16000 / W, 16000 / H, Math.sqrt(16000000 / (W * H)));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.floor(W * s));
    c.height = Math.max(1, Math.floor(H * s));
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    progress("Joining images", 0.8);
    let offset = 0;
    for (const { img, url } of loaded) {
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      if (vertical) {
        ctx.drawImage(img, (c.width - w) / 2, offset, w, h);
        offset += h + gap * s;
      } else {
        ctx.drawImage(img, offset, (c.height - h) / 2, w, h);
        offset += w + gap * s;
      }
      URL.revokeObjectURL(url);
    }
    const blob = await canvasToBlob(c, "image/png");
    if (!blob) throw userError("The combined image is too big for your browser. Try fewer or smaller images.");
    return [{ name: "merged-image.png", blob }];
  }

  async function mergePdfs(files, opts, progress) {
    const { PDFDocument } = window.PDFLib;
    const out = await PDFDocument.create();
    const problems = [];
    for (let i = 0; i < files.length; i++) {
      progress(`Adding file ${i + 1} of ${files.length}`, i / files.length);
      try {
        const src = await PDFDocument.load(await files[i].arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      } catch (e) {
        console.error(e);
        problems.push({ name: files[i].name, error: "couldn't be read (it may be password-protected or damaged), so it was left out" });
      }
      await yieldUI();
    }
    if (out.getPageCount() === 0) throw userError("None of those PDFs could be read. They may be password-protected or damaged.");
    progress("Saving the merged PDF", 1);
    const bytes = await out.save();
    return [{ name: "merged.pdf", blob: new Blob([bytes], { type: "application/pdf" }) }, ...problems];
  }

  // ---- Word (.docx) -> PDF: mammoth -> HTML on A4 pages -> html2canvas -> jsPDF
  function renderHost() {
    let host = document.querySelector(".jd-render-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "jd-render-host";
      host.setAttribute("aria-hidden", "true");
      document.body.appendChild(host);
    }
    return host;
  }
  function waitForImages(el) {
    return Promise.all(
      Array.from(el.querySelectorAll("img")).map((im) =>
        im.complete ? Promise.resolve() : new Promise((r) => { im.onload = r; im.onerror = r; })
      )
    );
  }
  function newPage(host) {
    const page = document.createElement("div");
    page.className = "docx-page";
    const inner = document.createElement("div");
    inner.className = "docx-inner";
    page.appendChild(inner);
    host.appendChild(page);
    return { page, inner };
  }
  // Put the document's blocks onto A4 pages, breaking between blocks so
  // lines of text never get cut in half.
  function paginate(src, host) {
    const contentH = A4_PX_H - 2 * PAGE_PAD;
    const blocks = Array.from(src.childNodes).filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
    src.remove();
    const pages = [];
    let cur = newPage(host);
    pages.push(cur.page);
    for (let node of blocks) {
      if (node.nodeType === 3) {
        const p = document.createElement("p");
        p.textContent = node.textContent;
        node = p;
      }
      cur.inner.appendChild(node);
      if (cur.inner.offsetHeight > contentH && cur.inner.childNodes.length > 1) {
        cur.inner.removeChild(node);
        cur = newPage(host);
        pages.push(cur.page);
        cur.inner.appendChild(node);
      }
    }
    return pages;
  }
  // Find a white row near `end` so an oversized block is cut cleanly.
  function findBreak(ctx, width, start, end) {
    const minY = Math.max(start + 1, end - 260);
    const rows = end - minY;
    if (rows <= 0) return end;
    const data = ctx.getImageData(0, minY, width, rows).data;
    const white = (i) => data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240;
    for (const tolerance of [0, 0.02]) {
      for (let row = rows - 1; row >= 0; row--) {
        const base = row * width * 4;
        let dark = 0;
        let samples = 0;
        for (let x = 0; x < width; x += 3) {
          samples++;
          if (!white(base + x * 4)) dark++;
        }
        if (dark <= samples * tolerance) return minY + row + 1;
      }
    }
    return end;
  }
  function sliceCanvasIntoPdf(pdf, canvas, first) {
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const pagePxH = Math.floor(canvas.width * (ph / pw));
    const ctx = canvas.getContext("2d");
    let y = 0;
    while (y < canvas.height) {
      let end = Math.min(y + pagePxH, canvas.height);
      if (end < canvas.height) end = findBreak(ctx, canvas.width, y, end);
      const h = end - y;
      const part = document.createElement("canvas");
      part.width = canvas.width;
      part.height = h;
      const pctx = part.getContext("2d");
      pctx.fillStyle = "#ffffff";
      pctx.fillRect(0, 0, part.width, h);
      pctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(part.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, h * (pw / canvas.width), undefined, "FAST");
      y = end;
    }
    return first;
  }
  async function docxToPdf(file, progress) {
    let html;
    try {
      ({ value: html } = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }));
    } catch (e) {
      throw userError("isn't a valid .docx file, or it's damaged");
    }
    const host = renderHost();
    host.innerHTML = "";
    const src = document.createElement("div");
    src.className = "docx-inner";
    src.style.width = A4_PX_W - 2 * PAGE_PAD + "px";
    src.innerHTML = html && html.trim() ? html : "<p><em>This document has no readable content.</em></p>";
    host.appendChild(src);
    await waitForImages(src);
    const pages = paginate(src, host);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    let first = true;
    try {
      for (let i = 0; i < pages.length; i++) {
        progress(i, pages.length);
        await yieldUI();
        const canvas = await window.html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", logging: false, useCORS: true });
        if (canvas.height <= canvas.width * (ph / pw) + 4) {
          if (!first) pdf.addPage();
          first = false;
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, Math.min(ph, canvas.height * (pw / canvas.width)), undefined, "FAST");
        } else {
          first = sliceCanvasIntoPdf(pdf, canvas, first);
        }
      }
    } finally {
      host.innerHTML = "";
    }
    return pdf.output("blob");
  }
  async function wordToPdf(files, opts, progress) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const label = files.length > 1 ? `document ${i + 1} of ${files.length}` : "your document";
      progress(`Converting ${label}`, i / files.length);
      try {
        const blob = await docxToPdf(f, (p, total) =>
          progress(`Converting ${label}, page ${p + 1} of ${total}`, (i + p / total) / files.length)
        );
        results.push({ name: baseName(f.name) + ".pdf", blob });
      } catch (e) {
        console.error(e);
        results.push({ name: f.name, error: e.userMessage || "couldn't be converted. Make sure it's a valid .docx file" });
      }
    }
    return results;
  }

  // ---- PDF -> Word (.docx): pdf.js text -> lines -> paragraphs -> WordprocessingML
  async function extractPdfText(file) {
    let pdf;
    try {
      pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    } catch (e) {
      if (e && e.name === "PasswordException") throw userError("is password-protected, so its text can't be read");
      throw userError("couldn't be read. It may be damaged");
    }
    const pagesLines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const lines = [];
      let cur = null;
      const flush = () => {
        if (cur && cur.text.trim()) lines.push(cur);
        cur = null;
      };
      for (const it of tc.items) {
        if (typeof it.str !== "string") continue;
        const x = it.transform[4];
        const y = it.transform[5];
        const size = Math.hypot(it.transform[2], it.transform[3]) || it.height || 10;
        if (cur && Math.abs(y - cur.y) > Math.max(2, size * 0.6)) flush();
        if (!cur) cur = { text: "", y, size, xEnd: x };
        else if (it.str && !/\s$/.test(cur.text) && !/^\s/.test(it.str) && x - cur.xEnd > size * 0.15) cur.text += " ";
        cur.text += it.str;
        if (it.str.trim()) cur.size = Math.max(cur.size, size);
        cur.xEnd = x + (it.width || 0);
        if (it.hasEOL) flush();
      }
      flush();
      pagesLines.push(lines);
      await yieldUI();
    }
    pdf.destroy();
    const sizes = pagesLines.flat().map((l) => l.size).sort((a, b) => a - b);
    const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 10;
    let chars = 0;
    const pages = pagesLines.map((lines) => {
      const paras = [];
      let prev = null;
      for (const ln of lines) {
        const text = ln.text.replace(/\s+/g, " ").trim();
        if (!text) continue;
        chars += text.length;
        const heading = ln.size >= median * 1.25 && text.length < 120;
        const listItem = /^([•\u2022\u25CF\u25AA\-–*]|\d+[.)])\s/.test(text);
        const gap = prev ? prev.y - ln.y : Infinity;
        const join = prev && !heading && !prev.heading && !listItem && Math.abs(ln.size - prev.size) <= prev.size * 0.15 && gap > 0 && gap <= ln.size * 1.9;
        if (join) {
          const last = paras[paras.length - 1];
          last.text = /[-\u2010]$/.test(last.text) && /^[a-z]/.test(text) ? last.text.slice(0, -1) + text : last.text + " " + text;
        } else {
          paras.push({ text, heading });
        }
        prev = { y: ln.y, size: ln.size, heading };
      }
      return paras;
    });
    return { pages, chars };
  }
  function xmlEsc(s) {
    if (typeof s.toWellFormed === "function") s = s.toWellFormed();
    return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function buildDocx(pages) {
    const para = (p) =>
      p.heading
        ? `<w:p><w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:t xml:space="preserve">${xmlEsc(p.text)}</w:t></w:r></w:p>`
        : `<w:p><w:pPr><w:spacing w:after="160"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${xmlEsc(p.text)}</w:t></w:r></w:p>`;
    const body = pages.map((paras, i) => (i ? `<w:p><w:r><w:br w:type="page"/></w:r></w:p>` : "") + paras.map(para).join("")).join("");
    const doc =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}` +
      `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>` +
      `</w:body></w:document>`;
    const types =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
      `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
      `<Default Extension="xml" ContentType="application/xml"/>` +
      `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
    const rels =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
    const zip = new window.JSZip();
    zip.file("[Content_Types].xml", types);
    zip.folder("_rels").file(".rels", rels);
    zip.folder("word").file("document.xml", doc);
    return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }
  async function pdfToWord(files, opts, progress) {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      progress(files.length > 1 ? `Reading PDF ${i + 1} of ${files.length}` : "Reading your PDF", i / files.length);
      try {
        const { pages, chars } = await extractPdfText(f);
        if (!chars) throw userError("has no text we can pull out. It looks like a scanned PDF (a photo of a page)");
        results.push({ name: baseName(f.name) + ".docx", blob: await buildDocx(pages) });
      } catch (e) {
        console.error(e);
        results.push({ name: f.name, error: e.userMessage || "couldn't be converted" });
      }
    }
    return results;
  }

  // =========================================================
  // Tool definitions
  // =========================================================
  const IMG_ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
  const PDF_ACCEPT = "application/pdf,.pdf";
  const DOCX_ACCEPT = ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const META = {
    "image-to-pdf": { title: "Image to PDF", desc: "Turn JPG, PNG or WEBP images into a PDF.", icon: "fa-file-image", color: "jd-c-img" },
    "merge-pdf": { title: "Merge PDF", desc: "Join several PDFs into one, in any order.", icon: "fa-layer-group", color: "jd-c-mpdf" },
    "merge-images": { title: "Merge images", desc: "Join images into one picture.", icon: "fa-images", color: "jd-c-mimg" },
    "word-to-pdf": { title: "Word to PDF", desc: "Turn Word (.docx) files into PDFs.", icon: "fa-file-word", color: "jd-c-w2p" },
    "pdf-to-word": { title: "PDF to Word", desc: "Get editable text out of a PDF.", icon: "fa-file-pen", color: "jd-c-p2w" },
  };

  const TOOLS = {
    "image-to-pdf": {
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
    },
    "merge-pdf": {
      ga: "merge_pdf", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 2, ordered: true, fileIcon: "fa-file-pdf",
      wrongType: "only PDF files work here",
      pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
      fine: "Add two or more PDFs. You can change the order before merging.",
      orderHint: "Files are joined from first to last. Drag them, or use the arrows, to change the order.",
      needMore: "Add at least one more PDF to merge.",
      side: "Merge PDF", action: "Merge PDF",
      busy: "Merging your PDFs…", done: () => "Your PDFs are merged", dl: "Download merged PDF",
      libs: ["PDFLib"], run: mergePdfs, next: ["pdf-to-word", "image-to-pdf"],
    },
    "merge-images": {
      ga: "merge_images", kind: "image", accept: IMG_ACCEPT, isOk: isImage, min: 2, ordered: true, fileIcon: "fa-images",
      wrongType: "only JPG, PNG or WEBP images work here",
      pick: "Select images", drop: "or drop images anywhere on this page",
      fine: "Add two or more images. They're joined in the order you set.",
      orderHint: "Drag the images, or use the arrows, to set the order.",
      needMore: "Add at least one more image to merge.",
      side: "Merge settings", action: "Merge images",
      busy: "Joining your images…", done: () => "Your images are merged", dl: "Download image",
      options: [
        { key: "direction", label: "Join them", def: "vertical", choices: [["vertical", "Top to bottom"], ["horizontal", "Side by side"]] },
        { key: "spacing", label: "Space between", def: "none", choices: [["none", "None"], ["small", "Small"], ["big", "Big"]] },
      ],
      libs: [], run: mergeImages, next: ["image-to-pdf", "merge-pdf"],
    },
    "word-to-pdf": {
      ga: "word_to_pdf", kind: "docx", accept: DOCX_ACCEPT, isOk: isDocx, min: 1, ordered: false, fileIcon: "fa-file-word",
      wrongType: "only Word .docx files work here",
      oldDoc: "old .doc files can't be opened in a browser. Open the file in Word, choose Save As and pick Word Document (.docx)",
      pick: "Select Word files", drop: "or drop .docx files anywhere on this page",
      fine: "Works with .docx files. Each document becomes its own PDF.",
      side: "Word to PDF", sideNote: "Headings, lists, tables and pictures come through. The PDF pages are images, so the text can't be selected.",
      action: "Convert to PDF",
      busy: "Converting your documents…", done: (n) => (n > 1 ? "Your PDFs are ready" : "Your PDF is ready"), dl: "Download PDF",
      libs: ["mammoth", "html2canvas", "jspdf"], run: wordToPdf, next: ["merge-pdf", "pdf-to-word"],
    },
    "pdf-to-word": {
      ga: "pdf_to_word", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 1, ordered: false, fileIcon: "fa-file-pdf",
      wrongType: "only PDF files work here",
      pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
      fine: "Each PDF becomes an editable Word file (.docx).",
      side: "PDF to Word", sideNote: "We bring over the text, paragraphs and headings. Page design and pictures aren't copied, and scanned PDFs have no text to pull out.",
      action: "Convert to Word",
      busy: "Reading your PDFs…", done: (n) => (n > 1 ? "Your Word files are ready" : "Your Word file is ready"), dl: "Download Word file",
      libs: ["pdfjsLib", "JSZip"], run: pdfToWord, next: ["word-to-pdf", "merge-pdf"],
    },
  };

  const cfg = TOOLS[TOOL_KEY];
  if (!cfg) return;

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  // =========================================================
  // State + UI
  // =========================================================
  const state = { view: "empty", files: [], opts: {}, results: [], problems: [], notice: null, seq: 0, dragId: null };
  (cfg.options || []).forEach((o) => (state.opts[o.key] = o.def));

  // One hidden file input for the whole page, opened by our buttons.
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = cfg.accept;
  input.className = "jd-file-input";
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  document.body.appendChild(input);
  input.addEventListener("change", () => {
    addFiles(input.files);
    input.value = "";
  });

  function noticeHtml() {
    if (!state.notice) return "";
    return `<div class="jd-notice ${state.notice.kind}" role="alert">${esc(state.notice.text)}</div>`;
  }

  function toolCard(key, gaName) {
    const m = META[key];
    return `<a class="jd-tool-card ${m.color}" href="/tools/${key}/" data-ga-name="${gaName}">
        <div class="jd-tool-ico"><i class="fa-solid ${m.icon}" aria-hidden="true"></i></div>
        <h3>${m.title}</h3><p>${m.desc}</p></a>`;
  }

  function viewEmpty() {
    return `${noticeHtml()}
      <div class="jd-upload">
        <button type="button" class="jd-pick-btn" data-act="pick" data-ga-event="tool_select_files" data-ga-name="select_files">
          <i class="fa-solid fa-file-arrow-up" aria-hidden="true"></i><span>${cfg.pick}</span>
        </button>
        <p class="jd-drop-hint">${cfg.drop}</p>
        <p class="jd-tool-fine">${cfg.fine}</p>
        <p class="jd-privacy"><i class="fa-solid fa-lock" aria-hidden="true"></i> Your files stay on your device. Nothing is uploaded.</p>
      </div>`;
  }

  function fileCard(it, i, n) {
    const name = it.file.name;
    const thumb = it.thumb ? `<img src="${it.thumb}" alt="">` : `<i class="fa-solid ${cfg.fileIcon}" aria-hidden="true"></i>`;
    const meta = [fmtSize(it.file.size), it.meta].filter(Boolean).join(" · ");
    const move = cfg.ordered
      ? `<button type="button" data-act="left" data-id="${it.id}" aria-label="Move file ${i + 1} earlier" data-ga-name="move_file_earlier" data-ga-private ${i === 0 ? "disabled" : ""}>←</button>
         <button type="button" data-act="right" data-id="${it.id}" aria-label="Move file ${i + 1} later" data-ga-name="move_file_later" data-ga-private ${i === n - 1 ? "disabled" : ""}>→</button>`
      : "";
    return `<div class="jd-file" role="listitem" draggable="${cfg.ordered}" data-id="${it.id}">
        <span class="jd-fnum">${i + 1}</span>
        <div class="jd-factions">${move}
          <button type="button" data-act="remove" data-id="${it.id}" aria-label="Remove file ${i + 1}" data-ga-name="remove_file" data-ga-private>✕</button>
        </div>
        <div class="jd-thumb" data-thumb="${it.id}">${thumb}</div>
        <div class="jd-fname" title="${esc(name)}">${esc(name)}</div>
        <div class="jd-fmeta" data-meta="${it.id}">${esc(meta)}</div>
      </div>`;
  }

  function optionGroup(o) {
    const off = o.off && o.off(state.opts);
    const choices = o.choices
      .map(
        ([v, label]) =>
          `<label class="jd-opt" data-ga-event="tool_option" data-ga-name="opt_${o.key}_${v}"><input type="radio" name="opt-${o.key}" value="${v}" ${state.opts[o.key] === v ? "checked" : ""}><span>${label}</span></label>`
      )
      .join("");
    return `<fieldset class="jd-optgroup${off ? " disabled" : ""}" data-key="${o.key}" ${off ? "disabled" : ""}><legend>${o.label}</legend><div class="jd-opts">${choices}</div></fieldset>`;
  }

  function viewWork() {
    const n = state.files.length;
    const cards = state.files.map((it, i) => fileCard(it, i, n)).join("");
    const need = n < cfg.min && cfg.needMore ? `<p class="jd-need">${cfg.needMore}</p>` : "";
    const hint = cfg.ordered && n > 1 ? `<p class="jd-order-hint">${cfg.orderHint}</p>` : "";
    return `${noticeHtml()}
      <div class="jd-work">
        <div>
          ${hint}
          <div class="jd-files" role="list" aria-label="Your files">
            ${cards}
            <button type="button" class="jd-add-card" data-act="pick" data-ga-event="tool_select_files" data-ga-name="add_more_files">
              <i class="fa-solid fa-plus" aria-hidden="true"></i><span>Add more files</span>
            </button>
          </div>
        </div>
        <aside class="jd-side" aria-label="${esc(cfg.side)}">
          <h2>${cfg.side}</h2>
          <p class="jd-side-sub">${plural(n, "file", "files")} added</p>
          ${(cfg.options || []).map(optionGroup).join("")}
          ${cfg.sideNote ? `<p class="jd-side-note">${cfg.sideNote}</p>` : ""}
          <button type="button" class="jd-action" data-act="run" data-ga-event="tool_process_click" data-ga-name="${cfg.ga}_run" ${n < cfg.min ? "disabled" : ""}>
            <span>${cfg.action}</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
          ${need}
          <button type="button" class="jd-clear" data-act="clear" data-ga-name="remove_all_files">Remove all files</button>
        </aside>
      </div>`;
  }

  function viewBusy() {
    return `<div class="jd-busy" role="status">
        <div class="jd-spinner" aria-hidden="true"></div>
        <h2>${cfg.busy}</h2>
        <p id="jd-busy-text" aria-live="polite">Getting started</p>
        <div class="jd-bar" aria-hidden="true"><span id="jd-busy-bar"></span></div>
        <p class="jd-privacy">This all happens on your device, so bigger files can take a little while.</p>
      </div>`;
  }

  function problemsHtml() {
    if (!state.problems.length) return "";
    return `<div class="jd-errs" role="alert">${state.problems.map((p) => `<div><strong>${esc(p.name)}</strong> ${esc(p.error)}.</div>`).join("")}</div>`;
  }

  function viewDone() {
    const ok = state.results;
    const actions = `<div class="jd-done-actions">
        <button type="button" class="jd-link-btn" data-act="back" data-ga-name="back_to_files">← Back to my files</button>
        <button type="button" class="jd-link-btn" data-act="reset" data-ga-name="start_over">Start over</button>
      </div>`;
    const next = `<div class="jd-next" data-ga-section="try_another_tool"><h3>Try another tool</h3><div class="jd-tool-grid">${cfg.next
      .map((k) => toolCard(k, "next_tool_" + k.replace(/-/g, "_")))
      .join("")}</div></div>`;
    if (!ok.length) {
      return `<div class="jd-done">
          <div class="jd-done-ico" style="color:#b42318"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i></div>
          <h2 id="jd-done-title" tabindex="-1">That didn't work</h2>
          <p>None of the files could be converted.</p>${problemsHtml()}${actions}
        </div>`;
    }
    let files;
    if (ok.length === 1) {
      const r = ok[0];
      files = `<p class="jd-done-file">${esc(r.name)} · ${fmtSize(r.blob.size)}</p>
        <a class="jd-dl-main" href="${r.url}" download="${esc(r.name)}" data-ga-event="tool_download" data-ga-name="download_file" data-ga-private>
          <i class="fa-solid fa-download" aria-hidden="true"></i><span>${cfg.dl}</span></a>
        <p class="jd-res-hint">Your download should start on its own. If it doesn't, use the button above.</p>`;
    } else {
      const zip = window.JSZip
        ? `<button type="button" class="jd-dl-main" data-act="zip" data-ga-event="tool_download" data-ga-name="download_all_zip"><i class="fa-solid fa-file-zipper" aria-hidden="true"></i><span>Download all (.zip)</span></button>`
        : "";
      files = `${zip}<div class="jd-dl-list">${ok
        .map(
          (r) =>
            `<a class="jd-dl-item" href="${r.url}" download="${esc(r.name)}" data-ga-event="tool_download" data-ga-name="download_file" data-ga-private><i class="fa-solid fa-download" aria-hidden="true"></i><span>${esc(r.name)}</span><small>${fmtSize(r.blob.size)}</small></a>`
        )
        .join("")}</div>`;
    }
    return `<div class="jd-done">
        <div class="jd-done-ico"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></div>
        <h2 id="jd-done-title" tabindex="-1">${cfg.done(ok.length)}</h2>
        ${files}${problemsHtml()}${actions}${next}
      </div>`;
  }

  function render() {
    if (state.view === "empty") root.innerHTML = viewEmpty();
    else if (state.view === "work") root.innerHTML = viewWork();
    else if (state.view === "busy") root.innerHTML = viewBusy();
    else root.innerHTML = viewDone();
    root.setAttribute("data-view", state.view);
  }

  // ---------------- file handling ----------------
  async function loadPdfInfo(item) {
    if (!window.pdfjsLib) return;
    try {
      const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await item.file.arrayBuffer()) }).promise;
      item.meta = plural(pdf.numPages, "page", "pages");
      const page = await pdf.getPage(1);
      const v1 = page.getViewport({ scale: 1 });
      const scale = (150 * Math.min(2, window.devicePixelRatio || 1)) / Math.max(v1.width, v1.height);
      const vp = page.getViewport({ scale });
      const c = document.createElement("canvas");
      c.width = Math.ceil(vp.width);
      c.height = Math.ceil(vp.height);
      await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
      item.thumb = c.toDataURL("image/jpeg", 0.8);
      pdf.destroy();
    } catch (e) {
      item.meta = e && e.name === "PasswordException" ? "password-protected" : "couldn't preview";
    }
    const t = root.querySelector(`[data-thumb="${item.id}"]`);
    if (t && item.thumb) t.innerHTML = `<img src="${item.thumb}" alt="">`;
    const m = root.querySelector(`[data-meta="${item.id}"]`);
    if (m) m.textContent = [fmtSize(item.file.size), item.meta].filter(Boolean).join(" · ");
  }

  function addFiles(list) {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    let wrong = 0;
    let oldDoc = false;
    let big = 0;
    let over = 0;
    let added = 0;
    for (const f of incoming) {
      if (!cfg.isOk(f)) {
        wrong++;
        if (/\.doc$/i.test(f.name)) oldDoc = true;
        continue;
      }
      if (f.size > MAX_MB * 1048576) {
        big++;
        continue;
      }
      if (state.files.length >= MAX_FILES) {
        over++;
        continue;
      }
      const item = { id: "f" + ++state.seq, file: f, meta: "" };
      if (cfg.kind === "image") item.thumb = URL.createObjectURL(f);
      state.files.push(item);
      added++;
      if (cfg.kind === "pdf") loadPdfInfo(item);
    }
    const msgs = [];
    if (wrong) msgs.push(`${plural(wrong, "file was", "files were")} skipped: ${oldDoc && cfg.oldDoc ? cfg.oldDoc : cfg.wrongType}.`);
    if (big) msgs.push(`${plural(big, "file is", "files are")} over ${MAX_MB} MB and ${big === 1 ? "was" : "were"} skipped.`);
    if (over) msgs.push(`You can add up to ${MAX_FILES} files at a time, so ${over} ${over === 1 ? "was" : "were"} left out.`);
    state.notice = msgs.length ? { kind: "warn", text: msgs.join(" ") } : null;
    if (added) {
      state.view = "work";
      track("tool_files_added", { tool: cfg.ga, file_count: added, total_files: state.files.length });
    }
    if (wrong || big || over) {
      track("tool_files_rejected", { tool: cfg.ga, reason: wrong ? (oldDoc ? "old_doc_format" : "wrong_type") : big ? "too_large" : "too_many", file_count: wrong + big + over });
    }
    render();
  }

  function dropItem(it) {
    if (cfg.kind === "image" && it.thumb) URL.revokeObjectURL(it.thumb);
  }
  function removeFile(id) {
    const i = state.files.findIndex((f) => f.id === id);
    if (i < 0) return;
    dropItem(state.files[i]);
    state.files.splice(i, 1);
    state.notice = null;
    if (!state.files.length) state.view = "empty";
    render();
    const next = root.querySelector(".jd-file [data-act='remove']") || root.querySelector("[data-act='pick']");
    if (next) next.focus();
  }
  function moveFile(id, dir) {
    const i = state.files.findIndex((f) => f.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= state.files.length) return;
    [state.files[i], state.files[j]] = [state.files[j], state.files[i]];
    render();
    const act = dir < 0 ? "left" : "right";
    const btn = root.querySelector(`[data-act="${act}"][data-id="${id}"]`);
    const other = root.querySelector(`[data-act="${act === "left" ? "right" : "left"}"][data-id="${id}"]`);
    (btn && !btn.disabled ? btn : other)?.focus();
  }
  function moveTo(dragId, targetId, after) {
    const from = state.files.findIndex((f) => f.id === dragId);
    if (from < 0) return;
    const [item] = state.files.splice(from, 1);
    let to = state.files.findIndex((f) => f.id === targetId);
    if (to < 0) to = state.files.length;
    state.files.splice(after ? to + 1 : to, 0, item);
    track("tool_files_reordered", { tool: cfg.ga, method: "drag" });
    render();
  }
  function revokeResults() {
    state.results.forEach((r) => URL.revokeObjectURL(r.url));
    state.results = [];
    state.problems = [];
  }
  function resetAll() {
    state.files.forEach(dropItem);
    state.files = [];
    revokeResults();
    state.notice = null;
    state.view = "empty";
    render();
    const pick = root.querySelector("[data-act='pick']");
    if (pick) pick.focus();
  }

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function downloadZip(btn) {
    btn.disabled = true;
    const label = btn.querySelector("span");
    const old = label.textContent;
    label.textContent = "Zipping…";
    try {
      const zip = new window.JSZip();
      const used = new Set();
      state.results.forEach((r) => {
        let n = r.name;
        let k = 2;
        const ext = (r.name.match(/\.[^.]+$/) || [""])[0];
        while (used.has(n)) n = `${baseName(r.name)} (${k++})${ext}`;
        used.add(n);
        zip.file(n, r.blob);
      });
      saveBlob(await zip.generateAsync({ type: "blob" }), `jobsdoor360-${TOOL_KEY}.zip`);
    } finally {
      btn.disabled = false;
      label.textContent = old;
    }
  }

  function progress(msg, frac) {
    const t = document.getElementById("jd-busy-text");
    const b = document.getElementById("jd-busy-bar");
    if (t) t.textContent = msg;
    if (b && typeof frac === "number") b.style.width = Math.round(Math.max(0.03, Math.min(1, frac)) * 100) + "%";
  }

  async function run() {
    const missing = cfg.libs.filter((n) => !window[n]);
    if (missing.length) {
      state.notice = { kind: "err", text: "The converter didn't load. Check your internet connection and refresh the page." };
      track("tool_process_error", { tool: cfg.ga, error_type: "library_missing" });
      render();
      return;
    }
    if (state.files.length < cfg.min) return;
    revokeResults();
    state.notice = null;
    state.view = "busy";
    render();
    const started = Date.now();
    const count = state.files.length;
    track("tool_process_start", Object.assign({ tool: cfg.ga, file_count: count }, state.opts));
    try {
      const out = await cfg.run(state.files.map((f) => f.file), Object.assign({}, state.opts), progress);
      state.results = out.filter((r) => r.blob).map((r) => Object.assign({}, r, { url: URL.createObjectURL(r.blob) }));
      state.problems = out.filter((r) => r.error);
      state.view = "done";
      render();
      track(state.results.length ? "tool_process_success" : "tool_process_error", {
        tool: cfg.ga,
        file_count: count,
        output_count: state.results.length,
        problem_count: state.problems.length,
        duration_sec: Math.round((Date.now() - started) / 1000),
        error_type: state.results.length ? undefined : "all_files_failed",
      });
      const title = document.getElementById("jd-done-title");
      if (title) title.focus();
      if (state.results.length === 1) saveBlob(state.results[0].blob, state.results[0].name);
    } catch (e) {
      console.error(e);
      state.view = "work";
      state.notice = { kind: "err", text: e.userMessage || "Something went wrong. Please try again, or try a different file." };
      render();
      track("tool_process_error", { tool: cfg.ga, file_count: count, error_type: "failed" });
    }
  }

  // ---------------- events ----------------
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    const act = b.getAttribute("data-act");
    if (act === "pick") input.click();
    else if (act === "remove") removeFile(b.getAttribute("data-id"));
    else if (act === "left" || act === "right") moveFile(b.getAttribute("data-id"), act === "left" ? -1 : 1);
    else if (act === "clear" || act === "reset") resetAll();
    else if (act === "run") run();
    else if (act === "zip") downloadZip(b);
    else if (act === "back") {
      state.view = "work";
      render();
    }
  });

  root.addEventListener("change", (e) => {
    const t = e.target;
    if (!t.name || t.name.indexOf("opt-") !== 0) return;
    state.opts[t.name.slice(4)] = t.value;
    (cfg.options || []).forEach((o) => {
      if (!o.off) return;
      const fs = root.querySelector(`fieldset[data-key="${o.key}"]`);
      const off = o.off(state.opts);
      if (fs) {
        fs.disabled = off;
        fs.classList.toggle("disabled", off);
      }
    });
  });

  // Drag a card onto another card to reorder.
  function clearMarks() {
    root.querySelectorAll(".drop-before, .drop-after").forEach((el) => el.classList.remove("drop-before", "drop-after"));
  }
  function endDrag() {
    clearMarks();
    root.querySelectorAll(".jd-file.dragging").forEach((el) => el.classList.remove("dragging"));
    state.dragId = null;
  }
  root.addEventListener("dragstart", (e) => {
    const card = e.target.closest && e.target.closest(".jd-file");
    if (!card || !cfg.ordered) return;
    state.dragId = card.getAttribute("data-id");
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", state.dragId);
    } catch (_) {}
    card.classList.add("dragging");
  });
  root.addEventListener("dragover", (e) => {
    if (!state.dragId) return;
    const card = e.target.closest && e.target.closest(".jd-file");
    e.preventDefault();
    clearMarks();
    if (!card || card.getAttribute("data-id") === state.dragId) return;
    const r = card.getBoundingClientRect();
    card.classList.add(e.clientX > r.left + r.width / 2 ? "drop-after" : "drop-before");
  });
  root.addEventListener("drop", (e) => {
    if (!state.dragId) return;
    e.preventDefault();
    e.stopPropagation();
    const card = e.target.closest && e.target.closest(".jd-file");
    if (card && card.getAttribute("data-id") !== state.dragId) {
      moveTo(state.dragId, card.getAttribute("data-id"), card.classList.contains("drop-after"));
    }
    endDrag();
  });
  root.addEventListener("dragend", endDrag);

  // Drop files anywhere on the page.
  const overlay = document.createElement("div");
  overlay.className = "jd-dropzone-overlay";
  overlay.innerHTML = "<div>Drop your files to add them</div>";
  document.body.appendChild(overlay);
  let overlayTimer = null;
  const hasFiles = (e) => Array.from((e.dataTransfer && e.dataTransfer.types) || []).indexOf("Files") !== -1;
  window.addEventListener("dragover", (e) => {
    if (state.dragId || !hasFiles(e)) return;
    e.preventDefault();
    if (state.view === "busy") {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.dataTransfer.dropEffect = "copy";
    overlay.classList.add("on");
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(() => overlay.classList.remove("on"), 250);
  });
  window.addEventListener("drop", (e) => {
    if (state.dragId || !hasFiles(e)) return;
    e.preventDefault();
    overlay.classList.remove("on");
    if (state.view === "busy") return;
    addFiles(e.dataTransfer.files);
  });

  render();
})();
