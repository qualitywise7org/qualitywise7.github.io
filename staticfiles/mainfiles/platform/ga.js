/* ============================================================
   JobsDoor360 click tracking (GA4, property G-1JQVXS3B5L).

   Sends one GA4 event for EVERY button / link click on the page,
   through the site's existing gtag. Load it with `defer` on any page.

   Event name
     data-ga-event="..." on the element, otherwise:
       nav_click     anything inside the top navbar
       footer_click  anything inside the footer
       cta_click     everything else
   Parameters
     button_name   data-ga-name, or a slug of the button text
     button_text   visible text (skipped when data-ga-private is set)
     section       nearest data-ga-section, else header/footer/main
     module        nearest data-ga-module (e.g. smart_career, tools)
     link_url      for links (internal = path, external = full URL)
     outbound      true for links to other sites
     page_path     current path
     + any other data-ga-* attribute, e.g. data-ga-price="149-299"
       becomes price: "149-299"

   Privacy: file names and blob: download URLs are never sent.
   Programmatic clicks (carousels, auto-downloads) are ignored.
   Other scripts can call window.jdTrack(eventName, params).
   ============================================================ */
(function () {
  "use strict";
  if (window.__jdGaInstalled) return;
  window.__jdGaInstalled = true;

  // Standard gtag shim (identical to Google's snippet) so events queue
  // correctly even if this file runs before the page's own gtag snippet.
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  var CLICKABLE =
    'a[href], button, [role="button"], input[type="submit"], input[type="button"], summary, [data-ga-event]';
  var RESERVED = { event: 1, name: 1, section: 1, module: 1, private: 1, ignore: 1 };

  function clean(s, max) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max || 100);
  }
  function slug(s) {
    return clean(s, 200).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
  }

  function send(name, params) {
    var p = {};
    params = params || {};
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k) && params[k] !== undefined && params[k] !== "") {
        p[k] = typeof params[k] === "string" ? clean(params[k]) : params[k];
      }
    }
    if (!p.page_path) p.page_path = location.pathname;
    try {
      window.gtag("event", name, p);
    } catch (e) {
      /* analytics must never break the page */
    }
  }
  window.jdTrack = send;

  function sectionOf(el) {
    var s = el.closest("[data-ga-section]");
    if (s) return s.getAttribute("data-ga-section");
    if (el.closest("nav, .navbar")) return "header";
    if (el.closest("footer")) return "footer";
    return "main";
  }

  function linkInfo(el, params) {
    var href = el.getAttribute("href") || "";
    if (!href || href === "#" || /^javascript:/i.test(href)) return;
    if (/^(blob|data):/i.test(href)) {
      params.link_url = "file_download";
      return;
    }
    try {
      var u = new URL(href, location.href);
      if (u.origin === location.origin) {
        params.link_url = u.pathname + u.search + u.hash;
      } else {
        params.link_url = u.protocol === "mailto:" || u.protocol === "tel:" ? u.protocol : u.href;
        if (/^https?:$/.test(u.protocol)) params.outbound = true;
      }
    } catch (x) {
      params.link_url = clean(href);
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      if (!e.isTrusted) return; // ignore clicks made by scripts
      var t = e.target;
      if (!t || !t.closest) return;
      // A click on a <label> also "clicks" its hidden input; count it once.
      if (t.tagName === "INPUT" && t.closest("label")) return;
      var el = t.closest(CLICKABLE);
      if (!el || el.closest("[data-ga-ignore]")) return;

      var section = sectionOf(el);
      var name =
        el.getAttribute("data-ga-event") ||
        (section === "header" ? "nav_click" : section === "footer" ? "footer_click" : "cta_click");
      var text = el.getAttribute("aria-label") || el.textContent || el.value || el.title || "";

      var params = {
        button_name: el.getAttribute("data-ga-name") || slug(text) || slug(el.id) || el.tagName.toLowerCase(),
        section: section,
      };
      if (!el.hasAttribute("data-ga-private")) params.button_text = clean(text);
      var mod = el.closest("[data-ga-module]");
      if (mod) params.module = mod.getAttribute("data-ga-module");
      if (el.tagName === "A") linkInfo(el, params);

      for (var i = 0; i < el.attributes.length; i++) {
        var a = el.attributes[i];
        if (a.name.indexOf("data-ga-") === 0) {
          var key = a.name.slice(8).replace(/-/g, "_");
          if (!RESERVED[key]) params[key] = a.value;
        }
      }
      params.transport_type = "beacon"; // still delivered when the click navigates away
      send(name, params);
    },
    true
  );
})();
