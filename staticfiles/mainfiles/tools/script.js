// ============================================================
// Utility Tools page UI (shared by all five tool pages).
//
// Each tool page sets <body data-tool="merge-pdf"> and has an empty
// <div id="jd-tool"></div>. This file draws the whole tool:
//   pick / drop files -> reorder + options -> process -> download
// using the settings + converter that the page's own
// /staticfiles/mainfiles/tools/<tool>/script.js registered in
// /staticfiles/mainfiles/tools/common.js (both load before this file).
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
  if (!window.JDTools) return;
  const { MAX_FILES, MAX_MB, esc, baseName, plural, fmtSize, track, META } = window.JDTools;

  const cfg = window.JDTools.defs[TOOL_KEY];
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
