// ============================================================
// Utility Tools: Merge PDF (/tools/merge-pdf/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// ============================================================
(function () {
  "use strict";
  const { userError, yieldUI, isPdf, PDF_ACCEPT } = window.JDTools;

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

  window.JDTools.register("merge-pdf", {
      ga: "merge_pdf", kind: "pdf", accept: PDF_ACCEPT, isOk: isPdf, min: 2, ordered: true, fileIcon: "fa-file-pdf",
      wrongType: "only PDF files work here",
      pick: "Select PDF files", drop: "or drop PDFs anywhere on this page",
      fine: "Add two or more PDFs. You can change the order before merging.",
      orderHint: "Files are joined from first to last. Drag them, or use the arrows, to change the order.",
      needMore: "Add at least one more PDF to merge.",
      side: "Merge PDF", action: "Merge PDF",
      busy: "Merging your PDFs…", done: () => "Your PDFs are merged", dl: "Download merged PDF",
      libs: ["PDFLib"], run: mergePdfs, next: ["pdf-to-word", "image-to-pdf"],
  });
})();
