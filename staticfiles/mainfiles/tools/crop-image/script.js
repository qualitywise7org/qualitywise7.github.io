// ============================================================
// Utility Tools: Crop image (/tools/crop-image/) only.
// The converter and the settings for this one tool. Shared helpers
// come from /staticfiles/mainfiles/tools/common.js, and the page UI
// from /staticfiles/mainfiles/tools/script.js.
// Crops each image to the chosen shape, keeping the middle, the top/left
// or the bottom/right. "Passport photo" also resizes to 35 x 45 mm at 300 dpi.
// ============================================================
(function () {
  "use strict";
  const { baseName, userError, yieldUI, loadImage, canvasToBlob, isImage, IMG_ACCEPT } = window.JDTools;

  // width : height
  const RATIOS = { square: [1, 1], passport: [35, 45], "4x5": [4, 5], "3x4": [3, 4], "4x3": [4, 3], "16x9": [16, 9] };
  const PASSPORT_PX = [413, 531]; // 35 x 45 mm at 300 dpi

  // Biggest box of the given ratio that fits inside w x h, placed by `keep`.
  function cropBox(w, h, [rw, rh], keep) {
    let cw = w;
    let ch = Math.round((w * rh) / rw);
    if (ch > h) {
      ch = h;
      cw = Math.round((h * rw) / rh);
    }
    const free = (total, used) => (keep === "start" ? 0 : keep === "end" ? total - used : Math.round((total - used) / 2));
    return { x: free(w, cw), y: free(h, ch), w: cw, h: ch };
  }

  async function cropImages(files, opts, progress) {
    const ratio = RATIOS[opts.shape] || RATIOS.square;
    const png = opts.format === "png";
    const results = [];
    for (let i = 0; i < files.length; i++) {
      progress(`Cropping image ${i + 1} of ${files.length}`, i / files.length);
      let loaded;
      try {
        loaded = await loadImage(files[i]);
      } catch (e) {
        results.push({ name: files[i].name, error: "couldn't be opened" });
        continue;
      }
      const { img, url } = loaded;
      const box = cropBox(img.naturalWidth, img.naturalHeight, ratio, opts.keep);
      const [outW, outH] = opts.shape === "passport" ? PASSPORT_PX : [box.w, box.h];
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!png) {
        ctx.fillStyle = "#ffffff"; // transparent areas turn white in a JPG
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, outW, outH);
      URL.revokeObjectURL(url);
      const blob = await canvasToBlob(canvas, png ? "image/png" : "image/jpeg", 0.92);
      canvas.width = canvas.height = 0;
      if (!blob) throw userError("That image is too big for your browser to crop.");
      results.push({ name: `${baseName(files[i].name)}-cropped.${png ? "png" : "jpg"}`, blob });
      await yieldUI();
    }
    return results;
  }

  window.JDTools.register("crop-image", {
    ga: "crop_image", kind: "image", accept: IMG_ACCEPT, isOk: isImage, min: 1, ordered: false, fileIcon: "fa-crop-simple",
    wrongType: "only JPG, PNG or WEBP images work here",
    pick: "Select images", drop: "or drop images anywhere on this page",
    fine: "Add one or more images. Each one is cropped to the shape you choose.",
    side: "Crop settings", sideNote: "We cut the largest area of that shape from your image. Passport photo also resizes to 35 x 45 mm (413 x 531 px).",
    action: "Crop images",
    busy: "Cropping your images…", done: (n) => (n > 1 ? "Your images are cropped" : "Your image is cropped"), dl: "Download image",
    options: [
      { key: "shape", label: "Shape", def: "square", choices: [["square", "Square 1:1"], ["passport", "Passport photo"], ["4x5", "Portrait 4:5"], ["3x4", "Portrait 3:4"], ["4x3", "Landscape 4:3"], ["16x9", "Wide 16:9"]] },
      { key: "keep", label: "Keep the", def: "center", choices: [["center", "Middle"], ["start", "Top / left"], ["end", "Bottom / right"]] },
      { key: "format", label: "Save as", def: "jpg", choices: [["jpg", "JPG"], ["png", "PNG"]] },
    ],
    libs: [], run: cropImages, next: ["merge-images", "image-to-pdf"],
  });
})();
