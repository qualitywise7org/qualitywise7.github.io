// QR code page (/tools/qr-code/). Content: payload.js (window.JDQrPayload).
// Drawing: qrcode-generator 1.4.4 (window.qrcode), loaded from jsDelivr with SRI.
// Everything happens in the browser; nothing is sent anywhere.
(function () {
  "use strict";
  const { buildPayload } = window.JDQrPayload;
  const $ = (id) => document.getElementById(id);
  const SIZES = { s: 6, m: 10, l: 16 }; // pixels per QR module
  let mode = "link";
  let current = null; // { text, qr }
  let tracked = false;

  function fields() {
    const v = (id) => ($(id) ? $(id).value : "");
    return {
      text: v("qr-text"),
      number: v("qr-wa-number"),
      message: v("qr-wa-msg"),
      upiId: v("qr-upi-id"),
      name: v("qr-upi-name"),
      amount: v("qr-upi-amount"),
      note: v("qr-upi-note"),
      ssid: v("qr-wifi-ssid"),
      password: v("qr-wifi-pass"),
      security: v("qr-wifi-sec"),
      hidden: $("qr-wifi-hidden") && $("qr-wifi-hidden").checked,
    };
  }

  function draw() {
    const box = $("qr-box");
    const msg = $("qr-msg");
    const dl = [$("qr-png"), $("qr-svg")];
    if (!window.qrcode) {
      msg.innerHTML = `<div class="jd-verdict no" role="alert">The QR code library didn't load. Check your internet connection and refresh the page.</div>`;
      return;
    }
    const p = buildPayload(mode, fields());
    if (!p.ok) {
      current = null;
      box.innerHTML = `<div class="jd-empty-state"><i class="fa-solid fa-qrcode" aria-hidden="true"></i>${p.error}</div>`;
      msg.innerHTML = "";
      dl.forEach((b) => (b.disabled = true));
      return;
    }
    const qr = window.qrcode(0, $("qr-ecc").value || "M");
    window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["UTF-8"];
    qr.addData(p.text, "Byte");
    qr.make();
    current = { text: p.text, qr };
    const cell = SIZES[$("qr-size").value] || SIZES.m;
    const n = qr.getModuleCount();
    const margin = 4;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = (n + margin * 2) * cell;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = $("qr-color").value || "#000000";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "QR code for " + (mode === "link" ? p.text : mode));
    box.innerHTML = "";
    box.appendChild(canvas);
    msg.innerHTML = mode === "upi" ? `<p class="jd-note-sm">Test it once with a small amount before printing it.</p>` : "";
    dl.forEach((b) => (b.disabled = false));
    if (!tracked && typeof window.jdTrack === "function") {
      tracked = true;
      window.jdTrack("tool_process_success", { tool: "qr_code", qr_type: mode });
    }
  }

  function save(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  $("qr-png").addEventListener("click", () => {
    const c = $("qr-box").querySelector("canvas");
    if (!c) return;
    c.toBlob((b) => b && save(b, `jobsdoor360-qr-${mode}.png`), "image/png");
    if (typeof window.jdTrack === "function") window.jdTrack("tool_download", { tool: "qr_code", format: "png" });
  });
  $("qr-svg").addEventListener("click", () => {
    if (!current) return;
    const { qr } = current;
    const n = qr.getModuleCount();
    const m = 4;
    let path = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + m} ${r + m}h1v1h-1z`;
    const color = $("qr-color").value || "#000000";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="${color}"/></svg>`;
    save(new Blob([svg], { type: "image/svg+xml" }), `jobsdoor360-qr-${mode}.svg`);
    if (typeof window.jdTrack === "function") window.jdTrack("tool_download", { tool: "qr_code", format: "svg" });
  });

  document.querySelectorAll("[data-qr-mode]").forEach((b) =>
    b.addEventListener("click", () => {
      mode = b.getAttribute("data-qr-mode");
      document.querySelectorAll("[data-qr-mode]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      document.querySelectorAll("[data-qr-panel]").forEach((p) => (p.hidden = p.getAttribute("data-qr-panel") !== mode));
      draw();
    })
  );
  document.querySelectorAll("#qr-form input, #qr-form select, #qr-form textarea").forEach((el) => el.addEventListener("input", draw));
  $("qr-form").addEventListener("submit", (e) => e.preventDefault());
  draw();
})();
