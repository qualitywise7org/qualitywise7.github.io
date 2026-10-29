// ============================================================
// QR code content builder (pure, no DOM). Used by the page and the tests.
//   link       any URL or text
//   whatsapp   https://wa.me/<number>?text=<message>
//   upi        upi://pay?pa=<UPI ID>&pn=<name>&am=<amount>&cu=INR&tn=<note>
//   wifi       WIFI:T:<WPA|WEP|nopass>;S:<name>;P:<password>;H:<true|>;;
// Returns { ok: true, text } or { ok: false, error }.
// ============================================================
(function (root) {
  "use strict";

  const MAX_LEN = 1200; // keeps the code easy to scan on phones

  function digits(s) {
    return String(s || "").replace(/\D+/g, "");
  }

  function whatsappNumber(raw) {
    let n = digits(raw);
    if (n.length === 11 && n.startsWith("0")) n = n.slice(1); // 0 98765 43210
    if (n.length === 10) n = "91" + n; // Indian mobile without country code
    return n.length >= 11 && n.length <= 15 ? n : null;
  }

  const UPI_ID = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/;

  // Wi-Fi QR fields escape \ ; , : "
  const wifiEsc = (s) => String(s || "").replace(/([\\;,:"])/g, "\\$1");

  function buildPayload(mode, f = {}) {
    let text = "";
    if (mode === "link") {
      text = String(f.text || "").trim();
      if (!text) return { ok: false, error: "Type a link or some text." };
    } else if (mode === "whatsapp") {
      const n = whatsappNumber(f.number);
      if (!n) return { ok: false, error: "Enter a WhatsApp number with 10 digits, or with the country code." };
      const msg = String(f.message || "").trim();
      text = "https://wa.me/" + n + (msg ? "?text=" + encodeURIComponent(msg) : "");
    } else if (mode === "upi") {
      const id = String(f.upiId || "").trim();
      if (!UPI_ID.test(id)) return { ok: false, error: "Enter a valid UPI ID, like name@okbank." };
      const params = ["pa=" + encodeURIComponent(id)];
      const name = String(f.name || "").trim();
      if (name) params.push("pn=" + encodeURIComponent(name));
      if (f.amount !== undefined && String(f.amount).trim() !== "") {
        const amt = Number(f.amount);
        if (!Number.isFinite(amt) || amt <= 0 || amt > 100000) return { ok: false, error: "Enter an amount between 1 and 1,00,000, or leave it empty." };
        params.push("am=" + amt.toFixed(2));
      }
      params.push("cu=INR");
      const note = String(f.note || "").trim();
      if (note) params.push("tn=" + encodeURIComponent(note.slice(0, 50)));
      text = "upi://pay?" + params.join("&");
    } else if (mode === "wifi") {
      const ssid = String(f.ssid || "");
      if (!ssid.trim()) return { ok: false, error: "Enter the Wi-Fi name." };
      const type = ["WPA", "WEP", "nopass"].includes(f.security) ? f.security : "WPA";
      if (type !== "nopass" && !String(f.password || "")) return { ok: false, error: "Enter the Wi-Fi password, or choose No password." };
      text = "WIFI:T:" + type + ";S:" + wifiEsc(ssid) + ";" + (type !== "nopass" ? "P:" + wifiEsc(f.password) + ";" : "") + (f.hidden ? "H:true;" : "") + ";";
    } else {
      return { ok: false, error: "Unknown type." };
    }
    if (text.length > MAX_LEN) return { ok: false, error: "That's too long for a QR code that scans easily. Shorten it to under " + MAX_LEN + " characters." };
    return { ok: true, text };
  }

  const api = { buildPayload, whatsappNumber, MAX_LEN };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.JDQrPayload = api;
})(this);
