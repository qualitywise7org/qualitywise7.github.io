// ============================================================
// Utility Tools: Word to PDF (/tools/word-to-pdf/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// ============================================================
(function () {
  "use strict";
  const { A4_PX_W, A4_PX_H, PAGE_PAD, baseName, userError, yieldUI, isDocx, DOCX_ACCEPT } = window.JDTools;

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

  window.JDTools.register("word-to-pdf", {
      ga: "word_to_pdf", kind: "docx", accept: DOCX_ACCEPT, isOk: isDocx, min: 1, ordered: false, fileIcon: "fa-file-word",
      wrongType: "only Word .docx files work here",
      oldDoc: "old .doc files can't be opened in a browser. Open the file in Word, choose Save As and pick Word Document (.docx)",
      pick: "Select Word files", drop: "or drop .docx files anywhere on this page",
      fine: "Works with .docx files. Each document becomes its own PDF.",
      side: "Word to PDF", sideNote: "Headings, lists, tables and pictures come through. The PDF pages are images, so the text can't be selected.",
      action: "Convert to PDF",
      busy: "Converting your documents…", done: (n) => (n > 1 ? "Your PDFs are ready" : "Your PDF is ready"), dl: "Download PDF",
      libs: ["mammoth", "html2canvas", "jspdf"], run: wordToPdf, next: ["merge-pdf", "pdf-to-word"],
  });
})();
