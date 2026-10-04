// ============================================================
// Utility Tools: Merge images (/tools/merge-images/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// ============================================================
(function () {
  "use strict";
  const { userError, loadImage, canvasToBlob, isImage, IMG_ACCEPT } = window.JDTools;

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

  window.JDTools.register("merge-images", {
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
  });
})();
