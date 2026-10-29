// ============================================================
// Utility Tools: Resize image to KB (/tools/resize-image-kb/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
//
// Exam and job forms ask for a photo or signature under a size limit
// (often 20, 50 or 100 KB). For each image we optionally crop it to a
// photo / signature / square shape, then search for the largest size and
// best JPEG quality that still fits under the limit:
//   for each scale (100%, 85%, 72% ...):
//     binary-search JPEG quality between 0.45 and 0.92
//     accept the first scale where quality >= 0.7 fits
//   otherwise use the best result found, or report that it can't fit.
// The pure planning helpers are on window.JDResizeKB for the tests.
// ============================================================
(function () {
  "use strict";
  const { baseName, userError, yieldUI, loadImage, canvasToBlob, isImage, IMG_ACCEPT } = window.JDTools;

  // width : height. Photo 3.5 x 4.5 cm and signature 3.5 x 1.5 cm are the
  // usual shapes on Indian exam forms; check your form for the exact rule.
  const SHAPES = { keep: null, photo: [35, 45], signature: [35, 15], square: [1, 1] };
  const START_LONG_SIDE = 1600; // px; bigger images are scaled down first
  const MIN_LONG_SIDE = 80; // px; below this a photo is no longer usable
  const GOOD_QUALITY = 0.7;
  const Q_MIN = 0.45;
  const Q_MAX = 0.92;

  // Centre crop box of the given ratio inside w x h.
  function cropBox(w, h, ratio) {
    if (!ratio) return { x: 0, y: 0, w, h };
    const [rw, rh] = ratio;
    let cw = w;
    let ch = Math.round((w * rh) / rw);
    if (ch > h) {
      ch = h;
      cw = Math.round((h * rw) / rh);
    }
    return { x: Math.round((w - cw) / 2), y: Math.round((h - ch) / 2), w: cw, h: ch };
  }

  // Output sizes to try, largest first: start at <= START_LONG_SIDE, then
  // shrink by 15% each step down to MIN_LONG_SIDE.
  function scalePlan(w, h) {
    const long = Math.max(w, h);
    let s = Math.min(1, START_LONG_SIDE / long);
    const out = [];
    while (long * s >= MIN_LONG_SIDE) {
      out.push({ w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) });
      s *= 0.85;
    }
    if (!out.length) out.push({ w, h });
    return out;
  }

  async function encode(img, box, size, quality) {
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; // transparent PNG areas become white, as forms expect
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, size.w, size.h);
    const blob = await canvasToBlob(c, "image/jpeg", quality);
    c.width = c.height = 0;
    return blob;
  }

  // Best JPEG under `limit` bytes at this size, or null if even Q_MIN is too big.
  async function bestAtSize(img, box, size, limit) {
    let lo = Q_MIN;
    let hi = Q_MAX;
    let best = null;
    const first = await encode(img, box, size, Q_MIN);
    if (!first || first.size > limit) return null;
    best = { blob: first, quality: Q_MIN };
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      const blob = await encode(img, box, size, mid);
      if (blob && blob.size <= limit) {
        best = { blob, quality: mid };
        lo = mid;
      } else hi = mid;
    }
    return best;
  }

  async function resizeImages(files, opts, progress) {
    // 1 KB = 1000 bytes here: stricter than 1024, so the file passes on any
    // form whichever definition it uses.
    const limit = Number(opts.size) * 1000;
    const ratio = SHAPES[opts.shape] || null;
    const results = [];
    for (let i = 0; i < files.length; i++) {
      progress(`Image ${i + 1} of ${files.length}: finding the best size`, i / files.length);
      let loaded;
      try {
        loaded = await loadImage(files[i]);
      } catch (e) {
        results.push({ name: files[i].name, error: "couldn't be opened" });
        continue;
      }
      const { img, url } = loaded;
      const box = cropBox(img.naturalWidth, img.naturalHeight, ratio);
      let chosen = null;
      let fallback = null;
      for (const size of scalePlan(box.w, box.h)) {
        const best = await bestAtSize(img, box, size, limit);
        await yieldUI();
        if (!best) continue;
        if (!fallback) fallback = { ...best, size };
        if (best.quality >= GOOD_QUALITY) {
          chosen = { ...best, size };
          break;
        }
      }
      URL.revokeObjectURL(url);
      const pick = chosen || fallback;
      if (!pick) {
        results.push({ name: files[i].name, error: `can't be made smaller than ${opts.size} KB and still be readable. Try a bigger limit` });
        continue;
      }
      results.push({ name: `${baseName(files[i].name)}-${opts.size}kb-${pick.size.w}x${pick.size.h}.jpg`, blob: pick.blob });
    }
    if (!results.some((r) => r.blob) && !results.length) throw userError("Something went wrong. Please try again.");
    return results;
  }

  window.JDResizeKB = { cropBox, scalePlan, SHAPES };

  window.JDTools.register("resize-image-kb", {
    ga: "resize_image_kb", kind: "image", accept: IMG_ACCEPT, isOk: isImage, min: 1, ordered: false, fileIcon: "fa-compress",
    wrongType: "only JPG, PNG or WEBP images work here",
    pick: "Select photo or signature", drop: "or drop images anywhere on this page",
    fine: "Add your photo, signature or any image. We make it fit under the size you pick.",
    side: "Size settings",
    sideNote: "We keep the image as large and sharp as possible while staying under the limit, and save it as JPG. The new size is in the file name. Check your form's notification for its exact size and shape rules.",
    action: "Resize images",
    busy: "Resizing to fit the size limit…", done: (n) => (n > 1 ? "Your images are ready" : "Your image is ready"), dl: "Download image",
    options: [
      { key: "size", label: "Keep it under", def: "50", choices: [["20", "20 KB"], ["50", "50 KB"], ["100", "100 KB"], ["200", "200 KB"], ["500", "500 KB"]] },
      { key: "shape", label: "Shape", def: "keep", choices: [["keep", "Keep as it is"], ["photo", "Photo 3.5 x 4.5 cm"], ["signature", "Signature 3.5 x 1.5 cm"], ["square", "Square"]] },
    ],
    libs: [], run: resizeImages, next: ["crop-image", "image-to-pdf", "compress-pdf"],
  });
})();
