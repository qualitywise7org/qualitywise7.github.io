// ============================================================
// Utility Tools: PDF to Word (/tools/pdf-to-word/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// ============================================================
(function () {
  "use strict";
  const { baseName, userError, yieldUI, isPdf, PDF_ACCEPT } = window.JDTools;

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

  window.JDTools.register("pdf-to-word", {
      ga: "pdf_to_word", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 1, ordered: false, fileIcon: "fa-file-pdf",
      wrongType: "only PDF files work here",
      pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
      fine: "Each PDF becomes an editable Word file (.docx).",
      side: "PDF to Word", sideNote: "We bring over the text, paragraphs and headings. Page design and pictures aren't copied, and scanned PDFs have no text to pull out.",
      action: "Convert to Word",
      busy: "Reading your PDFs…", done: (n) => (n > 1 ? "Your Word files are ready" : "Your Word file is ready"), dl: "Download Word file",
      libs: ["pdfjsLib", "JSZip"], run: pdfToWord, next: ["word-to-pdf", "merge-pdf"],
  });
})();
