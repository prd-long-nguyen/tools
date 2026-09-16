(function () {
  const HOST_ID = "__pixel_overlay_host__";
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    if (typeof existing.__poAbort === "function") existing.__poAbort();
    existing.remove();
  }
  ["__pixel_overlay_root__", "__pixel_overlay_panel__", "__pixel_overlay_style__"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const state = {
    opacity: 0.5,
    x: 0,
    y: 0,
    scale: 1,
    visible: true,
    locked: false,
    minimized: false,
    hasImage: false,
  };

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("data-pixel-overlay", "1");
  host.style.cssText = [
    "all:initial",
    "position:fixed",
    "inset:0",
    "width:auto",
    "height:auto",
    "margin:0",
    "padding:0",
    "border:none",
    "background:transparent",
    "overflow:visible",
    "display:block",
    "z-index:2147483647",
    "pointer-events:none",
    "transform:none",
    "filter:none",
    "clip-path:none",
    "contain:none",
    "isolation:auto",
    "font-size:16px",
    "line-height:1.4",
    "color:#f4f4f8",
    "color-scheme:dark",
  ]
    .map((rule) => `${rule} !important`)
    .join(";");

  const ac = new AbortController();
  host.__poAbort = () => ac.abort();

  const shadow = host.attachShadow({ mode: "open" });

  const root = document.createElement("div");
  root.id = "__pixel_overlay_root__";

  const img = document.createElement("img");
  img.id = "__pixel_overlay_img__";
  img.alt = "Pixel overlay";
  root.appendChild(img);

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      display: block !important;
      overflow: visible !important;
      color-scheme: dark;
    }
    *, *::before, *::after { box-sizing: border-box; }
    #__pixel_overlay_root__ {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
    }
    #__pixel_overlay_img__ {
      all: initial;
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      opacity: ${state.opacity};
      transform-origin: top left;
      max-width: none;
      max-height: none;
      width: auto;
      height: auto;
      border: 0;
      pointer-events: auto;
      cursor: grab;
      user-select: none;
    }
    #__pixel_overlay_panel__ {
      --po-bg: rgba(16, 18, 27, 0.78);
      --po-bg-soft: rgba(255, 255, 255, 0.04);
      --po-bg-hover: rgba(255, 255, 255, 0.08);
      --po-line: rgba(255, 255, 255, 0.1);
      --po-text: #f4f4f8;
      --po-muted: #9aa0b4;
      --po-accent: #8b7cff;
      --po-accent-soft: rgba(139, 124, 255, 0.18);
      --po-warn: #fbbf24;
      --po-danger: #fb7185;
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 1;
      pointer-events: auto;
      width: 292px;
      color: var(--po-text);
      font: 12.5px/1.4 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--po-bg);
      border: 1px solid var(--po-line);
      border-radius: 18px;
      box-shadow:
        0 18px 50px rgba(0, 0, 0, 0.38),
        0 0 0 1px rgba(255, 255, 255, 0.04) inset;
      backdrop-filter: blur(22px) saturate(1.4);
      -webkit-backdrop-filter: blur(22px) saturate(1.4);
      cursor: move;
      overflow: hidden;
    }
    #__pixel_overlay_panel__ * { box-sizing: border-box; }
    #__pixel_overlay_panel__ button,
    #__pixel_overlay_panel__ input {
      appearance: none;
      -webkit-appearance: none;
      font: inherit;
      color: inherit;
      letter-spacing: inherit;
      margin: 0;
    }
    #__pixel_overlay_panel__ .po-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 12px 10px;
      cursor: move;
    }
    #__pixel_overlay_panel__ .po-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    #__pixel_overlay_panel__ .po-logo {
      width: 30px;
      height: 30px;
      flex: none;
      display: grid;
      place-items: center;
      border-radius: 9px;
      background: linear-gradient(160deg, #66e1e6, #25c9d0 55%, #0bb4ba);
      box-shadow: 0 8px 18px rgba(37, 201, 208, 0.35);
      color: #fff;
    }
    #__pixel_overlay_panel__ .po-logo svg { width: 15px; height: 15px; }
    #__pixel_overlay_panel__ .po-title {
      font-weight: 650;
      letter-spacing: -0.02em;
      font-size: 13px;
    }
    #__pixel_overlay_panel__ .po-subtitle {
      color: var(--po-muted);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 170px;
    }
    #__pixel_overlay_panel__ .po-header-actions {
      display: flex;
      gap: 4px;
      flex: none;
    }
    #__pixel_overlay_panel__ .po-icon-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--po-text);
      cursor: pointer;
    }
    #__pixel_overlay_panel__ .po-icon-btn:hover, #__pixel_overlay_panel__ .po-icon-btn.po-close:hover {
      background: var(--po-bg-hover);
    }
    #__pixel_overlay_panel__ .po-icon-btn svg { width: 14px; height: 14px; }
    #__pixel_overlay_panel__ #__po_body__ {
      padding: 0 12px 12px;
    }
    #__pixel_overlay_panel__ .po-drop {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px dashed rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      background: var(--po-bg-soft);
      transition: border-color .15s, background .15s;
    }
    #__pixel_overlay_panel__ .po-drop.is-dragover {
      border-color: var(--po-accent);
      background: var(--po-accent-soft);
    }
    #__pixel_overlay_panel__ .po-url-row {
      display: flex;
      align-items: stretch;
      gap: 6px;
      min-width: 0;
    }
    #__pixel_overlay_panel__ .po-drop input[type="text"] {
      flex: 1;
      min-width: 0;
      width: auto;
      height: 32px;
      padding: 0 10px;
      border: 1px solid var(--po-line);
      border-radius: 8px;
      background: rgba(8, 10, 18, 0.45);
      color: var(--po-text);
      outline: none;
      box-shadow: none;
      transition: background .15s ease, border-color .15s ease;
    }
    #__pixel_overlay_panel__ .po-drop input[type="text"]::placeholder { color: #6b728c; }
    #__pixel_overlay_panel__ .po-drop input[type="text"]:hover {
      border-color: rgba(255, 255, 255, 0.14);
    }
    #__pixel_overlay_panel__ .po-drop input[type="text"]:focus,
    #__pixel_overlay_panel__ .po-drop input[type="text"]:focus-visible,
    #__pixel_overlay_panel__ .po-drop input[type="text"]:active,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-focused {
      border-color: rgba(37, 201, 208, 0.45);
      color: #bde6e8;
      outline: none;
      box-shadow: none;
    }
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error:hover,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error:focus,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error:focus-visible,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error:active,
    #__pixel_overlay_panel__ .po-drop input[type="text"].is-error.is-focused {
      border-color: rgba(251, 113, 133, 0.7);
      background: rgba(251, 113, 133, 0.08);
      box-shadow: none;
    }
    #__pixel_overlay_panel__ .po-url-error {
      display: none;
      margin: 0;
      color: var(--po-danger);
      font-size: 10.5px;
      line-height: 1.35;
    }
    #__pixel_overlay_panel__ .po-url-error.is-on { display: block; }
    #__pixel_overlay_panel__ .po-url-row .po-btn {
      flex: none;
      width: 32px;
      padding: 0;
    }
    #__pixel_overlay_panel__ .po-drop > .po-btn {
      flex: none;
      width: 100%;
    }
    #__pixel_overlay_panel__ .po-drop-hint {
      color: var(--po-muted);
      font-size: 10.5px;
      line-height: 1.35;
    }
    #__pixel_overlay_panel__ .po-btn {
      flex: 1;
      min-width: 0;
      height: 32px;
      padding: 0 10px;
      border: 1px solid var(--po-line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--po-text);
      font: inherit;
      font-weight: 550;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
    }
    #__pixel_overlay_panel__ .po-btn svg { width: 13px; height: 13px; }
    #__pixel_overlay_panel__ .po-btn:hover { background: var(--po-bg-hover); }
    #__pixel_overlay_panel__ .po-btn.is-on {
      background: rgba(37, 201, 208, 0.18);
      border-color: rgba(37, 201, 208, 0.45);
      color: #bde6e8;
    }
    #__pixel_overlay_panel__ .po-btn.is-warn {
      background: rgba(251, 191, 36, 0.14);
      border-color: rgba(251, 191, 36, 0.4);
      color: #fde68a;
    }
    #__pixel_overlay_panel__ .po-btn.is-off {
      opacity: 0.72;
    }
    #__pixel_overlay_panel__ .po-section {
      margin-top: 10px;
      padding: 10px;
      border-radius: 12px;
      background: var(--po-bg-soft);
    }
    #__pixel_overlay_panel__ .po-control {
      display: grid;
      grid-template-columns: 58px 26px 1fr 26px 40px;
      align-items: center;
      gap: 6px;
    }
    #__pixel_overlay_panel__ .po-control + .po-control { margin-top: 8px; }
    #__pixel_overlay_panel__ .po-label {
      color: var(--po-muted);
      font-size: 11px;
      font-weight: 550;
    }
    #__pixel_overlay_panel__ .po-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 11px;
      color: #d4d4de;
    }
    #__pixel_overlay_panel__ .po-step {
      width: 26px;
      height: 26px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--po-text);
      cursor: pointer;
      font: inherit;
      display: grid;
      place-items: center;
      transition: background .15s ease, color .15s ease, border-color .15s ease, transform .12s ease;
    }
    #__pixel_overlay_panel__ .po-step:hover,
    #__pixel_overlay_panel__ .po-step:focus-visible {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.14);
      color: #fff;
      outline: none;
    }
    #__pixel_overlay_panel__ .po-step:active {
      background: rgba(37, 201, 208, 0.2);
      border-color: rgba(37, 201, 208, 0.35);
      color: #bde6e8;
      transform: scale(0.94);
    }
    #__pixel_overlay_panel__ input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      min-width: 0;
      background: linear-gradient(90deg, var(--po-accent), #22d3ee);
      border-radius: 999px;
      outline: none;
      accent-color: #25c9d0;
    }
    #__pixel_overlay_panel__ input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border: 2px solid #fff;
      border-radius: 50%;
      background: #25c9d0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      cursor: pointer;
    }
    #__pixel_overlay_panel__ input[type="range"]::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border: 2px solid #fff;
      border-radius: 50%;
      background: #25c9d0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      cursor: pointer;
    }
    #__pixel_overlay_panel__ input[type="range"]::-moz-range-track {
      height: 4px;
      background: linear-gradient(90deg, #25c9d0, #0bb4ba);
      border-radius: 999px;
    }
    #__pixel_overlay_panel__ .po-align {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
    }
    #__pixel_overlay_panel__ .po-dpad {
      display: grid;
      grid-template-columns: 32px 32px 32px;
      grid-template-rows: 32px 32px 32px;
      gap: 4px;
    }
    #__pixel_overlay_panel__ .po-dpad .po-nudge {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.07);
      color: var(--po-text);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: background .15s ease, color .15s ease, border-color .15s ease, transform .12s ease;
    }
    #__pixel_overlay_panel__ .po-dpad .po-nudge:hover,
    #__pixel_overlay_panel__ .po-dpad .po-nudge:focus-visible {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.14);
      color: #fff;
      outline: none;
    }
    #__pixel_overlay_panel__ .po-dpad .po-nudge:active {
      background: rgba(37, 201, 208, 0.2);
      border-color: rgba(37, 201, 208, 0.35);
      color: #bde6e8;
      transform: scale(0.94);
    }
    #__pixel_overlay_panel__ .po-dpad .po-nudge svg { width: 13px; height: 13px; }
    #__pixel_overlay_panel__ #__po_nudge_up__ { grid-column: 2; grid-row: 1; }
    #__pixel_overlay_panel__ #__po_nudge_left__ { grid-column: 1; grid-row: 2; }
    #__pixel_overlay_panel__ #__po_nudge_right__ { grid-column: 3; grid-row: 2; }
    #__pixel_overlay_panel__ #__po_nudge_down__ { grid-column: 2; grid-row: 3; }
    #__pixel_overlay_panel__ .po-meta {
      flex: 1;
      min-width: 0;
    }
    #__pixel_overlay_panel__ .po-pos {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #__pixel_overlay_panel__ .po-pos-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 8px;
      border-radius: 8px;
      background: rgba(8, 10, 18, 0.35);
      color: var(--po-muted);
      font-size: 11px;
    }
    #__pixel_overlay_panel__ .po-pos-item b {
      color: var(--po-text);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    #__pixel_overlay_panel__ .po-hint {
      margin-top: 6px;
      color: var(--po-muted);
      font-size: 10.5px;
    }
    #__pixel_overlay_panel__ .po-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 10px;
    }
    #__pixel_overlay_panel__ .po-keys {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
    }
    #__pixel_overlay_panel__ kbd {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--po-line);
      color: var(--po-muted);
      font: 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    #__pixel_overlay_panel__.is-minimized {
      width: auto;
      border-radius: 13px;
      border-color: rgba(37, 201, 208, 0.38);
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.32),
        0 0 0 1px rgba(37, 201, 208, 0.16) inset;
      cursor: pointer;
    }
    #__pixel_overlay_panel__.is-minimized .po-header { padding: 4px; gap: 0; }
    #__pixel_overlay_panel__.is-minimized .po-brand { gap: 0; }
    #__pixel_overlay_panel__.is-minimized .po-title,
    #__pixel_overlay_panel__.is-minimized .po-subtitle,
    #__pixel_overlay_panel__.is-minimized .po-header-actions { display: none; }
  `;
  shadow.appendChild(style);
  shadow.appendChild(root);

  const panel = document.createElement("div");
  panel.id = "__pixel_overlay_panel__";
  panel.innerHTML = `
    <div class="po-header" id="__po_header__">
      <div class="po-brand">
        <div class="po-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="11" height="11" rx="2"/>
            <rect x="10" y="10" width="11" height="11" rx="2" opacity=".75"/>
          </svg>
        </div>
        <div>
          <div class="po-title">Pixel Overlay</div>
          <div class="po-subtitle" id="__po_status__">No image</div>
        </div>
      </div>
      <div class="po-header-actions">
        <button type="button" class="po-icon-btn" id="__po_minimize__" title="Minimize (M)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"/>
          </svg>
        </button>
        <button type="button" class="po-icon-btn po-close" id="__po_close__" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="__po_body__">
      <div class="po-drop" id="__po_drop__">
        <div class="po-url-row">
          <input id="__po_url__" type="text" placeholder="Paste image URL…" aria-describedby="__po_url_error__" />
          <button type="button" class="po-btn" id="__po_load__" title="Load" aria-label="Load">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v10M7 10l5-5 5 5"/>
              <path d="M5 19h14"/>
            </svg>
          </button>
        </div>
        <p class="po-url-error" id="__po_url_error__" role="alert"></p>
        <button type="button" class="po-btn" id="__po_file__">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
            <path d="M14 3v5h5"/>
          </svg>
          Choose file
        </button>
        <div class="po-drop-hint">Drop a file here, or Ctrl+V to paste</div>
      </div>
      <input id="__po_file_input__" type="file" accept="image/*" style="display:none;" />

      <div class="po-section">
        <div class="po-control">
          <span class="po-label">Opacity</span>
          <button type="button" class="po-step" id="__po_op_down__">−</button>
          <input id="__po_op_range__" type="range" min="0" max="1" step="0.05" value="${state.opacity}" />
          <button type="button" class="po-step" id="__po_op_up__">+</button>
          <span class="po-value" id="__po_op_label__">${Math.round(state.opacity * 100)}%</span>
        </div>
        <div class="po-control">
          <span class="po-label">Zoom</span>
          <button type="button" class="po-step" id="__po_scale_down__">−</button>
          <input id="__po_scale_range__" type="range" min="0.1" max="3" step="0.01" value="${state.scale}" />
          <button type="button" class="po-step" id="__po_scale_up__">+</button>
          <span class="po-value" id="__po_scale_label__">100%</span>
        </div>
      </div>

      <div class="po-align">
        <div class="po-dpad">
          <button type="button" class="po-nudge" id="__po_nudge_up__" title="Up 1px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14l6-6 6 6"/></svg>
          </button>
          <button type="button" class="po-nudge" id="__po_nudge_left__" title="Left 1px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6l-6 6 6 6"/></svg>
          </button>
          <button type="button" class="po-nudge" id="__po_nudge_right__" title="Right 1px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6l6 6-6 6"/></svg>
          </button>
          <button type="button" class="po-nudge" id="__po_nudge_down__" title="Down 1px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10l6 6 6-6"/></svg>
          </button>
        </div>
        <div class="po-meta">
          <div class="po-pos">
            <div class="po-pos-item">X <b id="__po_x__">0</b></div>
            <div class="po-pos-item">Y <b id="__po_y__">0</b></div>
          </div>
          <div class="po-hint">Hold Shift: move 10px</div>
        </div>
      </div>

      <div class="po-actions">
        <button type="button" class="po-btn" id="__po_toggle__">Hide · V</button>
        <button type="button" class="po-btn" id="__po_lock__">Lock · L</button>
        <button type="button" class="po-btn" id="__po_center__">Center</button>
        <button type="button" class="po-btn" id="__po_reset__">Reset</button>
      </div>

      <div class="po-keys">
        <kbd>[ ] opacity</kbd>
        <kbd>V hide</kbd>
        <kbd>L lock</kbd>
        <kbd>M minimize</kbd>
        <kbd>Scroll zoom</kbd>
      </div>
    </div>
  `;
  shadow.appendChild(panel);
  (document.documentElement || document.body).appendChild(host);

  const $ = (id) => panel.querySelector(id);
  const panelBody = $("#__po_body__");
  const minimizeBtn = $("#__po_minimize__");
  const statusEl = $("#__po_status__");
  const dropEl = $("#__po_drop__");
  const posX = $("#__po_x__");
  const posY = $("#__po_y__");

  function applyTransform() {
    img.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    img.style.opacity = state.visible ? state.opacity : 0;
    img.style.pointerEvents = state.visible ? "auto" : "none";
    img.style.cursor = state.locked || !state.visible ? "default" : "grab";
    posX.textContent = Math.round(state.x);
    posY.textContent = Math.round(state.y);
  }

  function setMinimized(v) {
    state.minimized = v;
    panelBody.style.display = v ? "none" : "block";
    panel.classList.toggle("is-minimized", v);
    panel.title = v ? "Expand (M)" : "";
    minimizeBtn.innerHTML = v
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>`;
    minimizeBtn.title = v ? "Expand (M)" : "Minimize (M)";
  }
  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setMinimized(!state.minimized);
  });

  const urlInput = $("#__po_url__");
  const fileInput = $("#__po_file_input__");
  const opRange = $("#__po_op_range__");
  const opLabel = $("#__po_op_label__");
  const scaleRange = $("#__po_scale_range__");
  const scaleLabel = $("#__po_scale_label__");
  const toggleBtn = $("#__po_toggle__");
  const lockBtn = $("#__po_lock__");

  const urlError = $("#__po_url_error__");
  let loadGen = 0;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function showUrlError(message) {
    urlInput.classList.add("is-error");
    urlInput.setAttribute("aria-invalid", "true");
    urlError.textContent = message;
    urlError.classList.add("is-on");
  }

  function clearUrlError() {
    urlInput.classList.remove("is-error");
    urlInput.removeAttribute("aria-invalid");
    urlError.textContent = "";
    urlError.classList.remove("is-on");
  }

  function isImageSrc(src) {
    if (/^data:image\//i.test(src) || src.startsWith("blob:")) return true;
    try {
      const parsed = new URL(src);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function loadFromUrl() {
    const src = urlInput.value.trim();
    if (!src) {
      showUrlError("Enter an image URL");
      urlInput.focus();
      return;
    }
    if (!isImageSrc(src)) {
      showUrlError("Enter a valid image URL");
      urlInput.focus();
      return;
    }
    loadImage(src, src, true);
  }

  function loadImage(src, label, fromUrl) {
    if (!src) return;
    clearUrlError();
    const gen = ++loadGen;
    img.onload = () => {
      if (gen !== loadGen) return;
      state.hasImage = true;
      setStatus(label || "Image loaded");
      applyTransform();
    };
    img.onerror = () => {
      if (gen !== loadGen) return;
      state.hasImage = false;
      img.removeAttribute("src");
      applyTransform();
      if (fromUrl) showUrlError("Couldn't load this image");
      setStatus("Failed to load");
    };
    state.x = 0;
    state.y = 0;
    if (fromUrl) setStatus("Loading…");
    img.src = src;
    applyTransform();
  }

  $("#__po_load__").addEventListener("click", loadFromUrl);
  urlInput.addEventListener("focus", () => urlInput.classList.add("is-focused"));
  urlInput.addEventListener("blur", () => urlInput.classList.remove("is-focused"));
  urlInput.addEventListener("input", clearUrlError);
  urlInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    loadFromUrl();
  });

  function blurUrlIfOutside(e) {
    const path = (e.composedPath && e.composedPath()) || [];
    if (path.includes(urlInput)) return;
    urlInput.blur();
    urlInput.classList.remove("is-focused");
  }
  document.addEventListener("pointerdown", blurUrlIfOutside, { capture: true, signal: ac.signal });
  shadow.addEventListener("pointerdown", blurUrlIfOutside, { capture: true, signal: ac.signal });

  const fileBtn = $("#__po_file__");
  function blurFileTrigger() {
    fileBtn.blur();
    fileInput.blur();
  }
  fileBtn.addEventListener("click", () => {
    fileInput.click();
    queueMicrotask(blurFileTrigger);
  });
  fileInput.addEventListener("change", () => {
    blurFileTrigger();
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result, file.name);
    reader.readAsDataURL(file);
  });
  fileInput.addEventListener("cancel", blurFileTrigger);

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadImage(ev.target.result, file.name || "Pasted image");
    reader.readAsDataURL(file);
  }

  ["dragenter", "dragover"].forEach((type) => {
    dropEl.addEventListener(type, (e) => {
      e.preventDefault();
      dropEl.classList.add("is-dragover");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    dropEl.addEventListener(type, (e) => {
      e.preventDefault();
      dropEl.classList.remove("is-dragover");
    });
  });
  dropEl.addEventListener("drop", (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    loadFile(file);
  });

  function pasteHandler(e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    loadFile(imageItem.getAsFile());
  }
  document.addEventListener("paste", pasteHandler, { signal: ac.signal });

  function setOpacity(v) {
    state.opacity = Math.min(1, Math.max(0, v));
    opRange.value = state.opacity;
    opLabel.textContent = `${Math.round(state.opacity * 100)}%`;
    applyTransform();
  }
  opRange.addEventListener("input", () => setOpacity(parseFloat(opRange.value)));
  $("#__po_op_up__").addEventListener("click", () => setOpacity(state.opacity + 0.05));
  $("#__po_op_down__").addEventListener("click", () => setOpacity(state.opacity - 0.05));

  function setScale(v) {
    state.scale = Math.min(3, Math.max(0.1, v));
    scaleRange.value = state.scale;
    scaleLabel.textContent = `${Math.round(state.scale * 100)}%`;
    applyTransform();
  }
  scaleRange.addEventListener("input", () => setScale(parseFloat(scaleRange.value)));
  $("#__po_scale_up__").addEventListener("click", () => setScale(state.scale + 0.05));
  $("#__po_scale_down__").addEventListener("click", () => setScale(state.scale - 0.05));

  function nudge(dx, dy) {
    if (state.locked || !state.visible) return;
    state.x += dx;
    state.y += dy;
    applyTransform();
  }
  $("#__po_nudge_left__").addEventListener("click", (e) => nudge(e.shiftKey ? -10 : -1, 0));
  $("#__po_nudge_right__").addEventListener("click", (e) => nudge(e.shiftKey ? 10 : 1, 0));
  $("#__po_nudge_up__").addEventListener("click", (e) => nudge(0, e.shiftKey ? -10 : -1));
  $("#__po_nudge_down__").addEventListener("click", (e) => nudge(0, e.shiftKey ? 10 : 1));

  function setVisible(v) {
    state.visible = v;
    applyTransform();
    toggleBtn.textContent = state.visible ? "Hide · V" : "Show · V";
    toggleBtn.classList.toggle("is-off", !state.visible);
  }
  toggleBtn.addEventListener("click", () => setVisible(!state.visible));

  function setLocked(v) {
    state.locked = v;
    lockBtn.textContent = state.locked ? "Locked · L" : "Lock · L";
    lockBtn.classList.toggle("is-warn", state.locked);
    applyTransform();
  }
  lockBtn.addEventListener("click", () => setLocked(!state.locked));

  $("#__po_center__").addEventListener("click", () => {
    const rect = img.getBoundingClientRect();
    state.x = Math.round((window.innerWidth - rect.width) / 2);
    state.y = Math.round((window.innerHeight - rect.height) / 2);
    applyTransform();
  });
  $("#__po_reset__").addEventListener("click", () => {
    state.x = 0;
    state.y = 0;
    state.scale = 1;
    scaleRange.value = 1;
    scaleLabel.textContent = "100%";
    applyTransform();
  });

  function teardown() {
    ac.abort();
    host.remove();
  }
  $("#__po_close__").addEventListener("click", teardown);

  let dragging = false;
  let dragStart = { mx: 0, my: 0, x: 0, y: 0 };
  img.addEventListener("mousedown", (e) => {
    if (state.locked || !state.visible) return;
    dragging = true;
    img.style.cursor = "grabbing";
    dragStart = { mx: e.clientX, my: e.clientY, x: state.x, y: state.y };
    e.preventDefault();
  });
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!dragging) return;
      state.x = dragStart.x + (e.clientX - dragStart.mx);
      state.y = dragStart.y + (e.clientY - dragStart.my);
      applyTransform();
      img.style.cursor = "grabbing";
    },
    { signal: ac.signal },
  );
  window.addEventListener(
    "mouseup",
    () => {
      dragging = false;
      applyTransform();
    },
    { signal: ac.signal },
  );

  let panelDragging = false;
  let panelDragMoved = false;
  let panelStart = { mx: 0, my: 0, top: 0, left: 0 };
  panel.addEventListener("mousedown", (e) => {
    if (e.target.closest("button, input")) return;
    urlInput.blur();
    urlInput.classList.remove("is-focused");
    panelDragging = true;
    panelDragMoved = false;
    const rect = panel.getBoundingClientRect();
    panelStart = {
      mx: e.clientX,
      my: e.clientY,
      top: rect.top,
      left: rect.left,
    };
    e.preventDefault();
  });
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!panelDragging) return;
      if (Math.abs(e.clientX - panelStart.mx) > 3 || Math.abs(e.clientY - panelStart.my) > 3) {
        panelDragMoved = true;
      }
      panel.style.top = `${panelStart.top + (e.clientY - panelStart.my)}px`;
      panel.style.left = `${panelStart.left + (e.clientX - panelStart.mx)}px`;
      panel.style.right = "auto";
      e.preventDefault();
    },
    { signal: ac.signal },
  );
  window.addEventListener("mouseup", () => (panelDragging = false), { signal: ac.signal });
  panel.addEventListener("click", (e) => {
    if (e.detail !== 0) {
      const btn = e.target.closest("button");
      if (btn) btn.blur();
    }
    if (!state.minimized || panelDragMoved) return;
    setMinimized(false);
  });

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag !== "INPUT") return false;
    const type = (el.type || "text").toLowerCase();
    return type !== "range" && type !== "button" && type !== "checkbox" && type !== "radio" && type !== "file";
  }

  function blurHotkeyFocus() {
    const active = shadow.activeElement;
    if (!active || active === urlInput || isTypingTarget(active)) return;
    active.blur();
  }

  function keyHandler(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const origin = e.composedPath && e.composedPath()[0];
    const target = origin || e.target;
    if (
      isTypingTarget(target) ||
      isTypingTarget(shadow.activeElement) ||
      isTypingTarget(document.activeElement)
    ) {
      return;
    }

    const use = (fn) => {
      e.preventDefault();
      blurHotkeyFocus();
      fn();
    };

    if (e.key === "[") return use(() => setOpacity(state.opacity - 0.05));
    if (e.key === "]") return use(() => setOpacity(state.opacity + 0.05));
    if (e.key.toLowerCase() === "v") return use(() => setVisible(!state.visible));
    if (e.key.toLowerCase() === "l") return use(() => setLocked(!state.locked));
    if (e.key.toLowerCase() === "m") return use(() => setMinimized(!state.minimized));
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") return use(() => nudge(-step, 0));
    if (e.key === "ArrowRight") return use(() => nudge(step, 0));
    if (e.key === "ArrowUp") return use(() => nudge(0, -step));
    if (e.key === "ArrowDown") return use(() => nudge(0, step));
  }
  document.addEventListener("keydown", keyHandler, { signal: ac.signal });

  img.addEventListener(
    "wheel",
    (e) => {
      if (state.locked || !state.visible) return;
      e.preventDefault();
      setScale(state.scale + (e.deltaY < 0 ? 0.02 : -0.02));
    },
    { passive: false },
  );

  applyTransform();
  console.log(
    "%cPixel Overlay %cready",
    "background:#25c9d0;color:#fff;padding:2px 8px;border-radius:99px 0 0 99px;font-weight:700;",
    "background:#1f1f2b;color:#bde6e8;padding:2px 8px;border-radius:0 99px 99px 0;",
  );
})();
