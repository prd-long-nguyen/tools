(function () {
  const EXISTING = document.getElementById("__pixel_overlay_root__");
  if (EXISTING) {
    EXISTING.remove();
  }
  const oldPanel = document.getElementById("__pixel_overlay_panel__");
  if (oldPanel) oldPanel.remove();

  const state = {
    opacity: 0.5,
    x: 0,
    y: 0,
    scale: 1,
    visible: true,
    locked: false,
    minimized: false,
  };

  const root = document.createElement("div");
  root.id = "__pixel_overlay_root__";
  root.style.cssText = `position:fixed;top:0;left:0;z-index:2147483000;pointer-events:auto;user-select:none;`;

  const img = document.createElement("img");
  img.id = "__pixel_overlay_img__";
  img.style.cssText = `position:absolute;top:0;left:0;opacity:${state.opacity};transform-origin:top left;max-width:none;pointer-events:auto;cursor:move;`;
  root.appendChild(img);
  document.body.appendChild(root);

  function applyTransform() {
    img.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    img.style.opacity = state.visible ? state.opacity : 0;
    img.style.pointerEvents = state.visible ? "auto" : "none";
  }

  const panel = document.createElement("div");
  panel.id = "__pixel_overlay_panel__";
  panel.style.cssText = `position:fixed;top:12px;right:12px;z-index:2147483001;background:#1e1e1eee;color:#fff;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:10px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.4);width:240px;cursor:move;`;

  panel.innerHTML = `
      <div id="__po_header__" style="font-weight:600;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
        <span>🖼️ Pixel Overlay</span>
        <button id="__po_minimize__" style="width:22px;height:22px;padding:0;line-height:1;">─</button>
      </div>
      <div id="__po_body__">
      <div style="margin-bottom:6px;">
        <input id="__po_url__" type="text" placeholder="Dán URL hoặc path ảnh..."
          style="width:100%;box-sizing:border-box;padding:4px 6px;border-radius:4px;border:1px solid #555;background:#2a2a2a;color:#fff;" />
      </div>
      <div style="display:flex;gap:4px;margin-bottom:8px;">
        <button id="__po_load__" style="flex:1;">Load ảnh</button>
        <button id="__po_file__" style="flex:1;">Chọn file</button>
      </div>
      <input id="__po_file_input__" type="file" accept="image/*" style="display:none;" />
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="width:60px;flex:none;">Độ mờ</span>
        <button id="__po_op_down__" style="width:24px;flex:none;box-sizing:border-box;">−</button>
        <input id="__po_op_range__" type="range" min="0" max="1" step="0.05" value="${state.opacity}" style="flex:1;min-width:0;width:0;" />
        <button id="__po_op_up__" style="width:24px;flex:none;box-sizing:border-box;">+</button>
        <span id="__po_op_label__" style="width:34px;flex:none;text-align:right;">${Math.round(state.opacity * 100)}%</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span style="width:60px;flex:none;">Zoom</span>
        <button id="__po_scale_down__" style="width:24px;flex:none;box-sizing:border-box;">−</button>
        <input id="__po_scale_range__" type="range" min="0.1" max="3" step="0.01" value="${state.scale}" style="flex:1;min-width:0;width:0;" />
        <button id="__po_scale_up__" style="width:24px;flex:none;box-sizing:border-box;">+</button>
        <span id="__po_scale_label__" style="width:34px;flex:none;text-align:right;">100%</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:6px;">
        <button id="__po_nudge_left__" style="width:24px;flex:none;">←</button>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button id="__po_nudge_up__" style="width:24px;">↑</button>
          <button id="__po_nudge_down__" style="width:24px;">↓</button>
        </div>
        <button id="__po_nudge_right__" style="width:24px;flex:none;">→</button>
        <span style="opacity:.7;font-size:11px;margin-left:6px;">di 1px<br/>(giữ Shift: 10px)</span>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:6px;">
        <button id="__po_toggle__" style="flex:1;">Ẩn (V)</button>
        <button id="__po_lock__" style="flex:1;">Khoá vị trí (L)</button>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:6px;">
        <button id="__po_center__" style="flex:1;">Căn giữa</button>
        <button id="__po_reset__" style="flex:1;">Reset</button>
        <button id="__po_close__" style="flex:1;">Đóng</button>
      </div>
      <div style="opacity:.7;font-size:11px;margin-top:4px;">
        Kéo ảnh để di chuyển (khi chưa khoá).<br/>
        Copy ảnh (VD: Copy as PNG trong Figma) rồi Ctrl+V vào trang để load ảnh.<br/>
        Phím tắt: [ / ] chỉnh mờ, V ẩn/hiện, L khoá, lăn chuột trên ảnh = zoom, M thu gọn.
      </div>
      </div>`;

  Array.from(panel.querySelectorAll("button")).forEach((b) => {
    b.style.cssText = `background:#3a3a3a;color:#fff;border:1px solid #555;border-radius:4px;padding:4px 6px;cursor:pointer;font-size:12px;`;
    b.addEventListener("mouseenter", () => (b.style.background = "#4a4a4a"));
    b.addEventListener("mouseleave", () => (b.style.background = "#3a3a3a"));
  });

  document.body.appendChild(panel);

  const $ = (id) => panel.querySelector(id);
  const panelBody = $("#__po_body__");
  const minimizeBtn = $("#__po_minimize__");

  function setMinimized(v) {
    state.minimized = v;
    panelBody.style.display = v ? "none" : "block";
    panel.style.width = v ? "auto" : "240px";
    minimizeBtn.textContent = v ? "▢" : "─";
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

  function loadImage(src) {
    if (!src) return;
    img.src = src;
    state.x = 0;
    state.y = 0;
    applyTransform();
  }

  $("#__po_load__").addEventListener("click", () =>
    loadImage(urlInput.value.trim()),
  );
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadImage(urlInput.value.trim());
  });
  $("#__po_file__").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result);
    reader.readAsDataURL(file);
  });

  document.addEventListener("paste", (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const imageItem = Array.from(items).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadImage(ev.target.result);
    reader.readAsDataURL(file);
  });

  function setOpacity(v) {
    state.opacity = Math.min(1, Math.max(0, v));
    opRange.value = state.opacity;
    opLabel.textContent = `${Math.round(state.opacity * 100)}%`;
    applyTransform();
  }
  opRange.addEventListener("input", () =>
    setOpacity(parseFloat(opRange.value)),
  );
  $("#__po_op_up__").addEventListener("click", () =>
    setOpacity(state.opacity + 0.05),
  );
  $("#__po_op_down__").addEventListener("click", () =>
    setOpacity(state.opacity - 0.05),
  );

  function setScale(v) {
    state.scale = Math.min(3, Math.max(0.1, v));
    scaleRange.value = state.scale;
    scaleLabel.textContent = `${Math.round(state.scale * 100)}%`;
    applyTransform();
  }
  scaleRange.addEventListener("input", () =>
    setScale(parseFloat(scaleRange.value)),
  );
  $("#__po_scale_up__").addEventListener("click", () =>
    setScale(state.scale + 0.05),
  );
  $("#__po_scale_down__").addEventListener("click", () =>
    setScale(state.scale - 0.05),
  );

  function nudge(dx, dy) {
    if (state.locked || !state.visible) return;
    state.x += dx;
    state.y += dy;
    applyTransform();
  }
  $("#__po_nudge_left__").addEventListener("click", (e) =>
    nudge(e.shiftKey ? -10 : -1, 0),
  );
  $("#__po_nudge_right__").addEventListener("click", (e) =>
    nudge(e.shiftKey ? 10 : 1, 0),
  );
  $("#__po_nudge_up__").addEventListener("click", (e) =>
    nudge(0, e.shiftKey ? -10 : -1),
  );
  $("#__po_nudge_down__").addEventListener("click", (e) =>
    nudge(0, e.shiftKey ? 10 : 1),
  );

  const toggleBtn = $("#__po_toggle__");
  function setVisible(v) {
    state.visible = v;
    applyTransform();
    toggleBtn.textContent = state.visible ? "Ẩn (V)" : "Hiện (V)";
  }
  toggleBtn.addEventListener("click", () => setVisible(!state.visible));
  $("#__po_lock__").addEventListener("click", (e) => {
    state.locked = !state.locked;
    e.target.style.background = state.locked ? "#5a3a3a" : "#3a3a3a";
  });
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
  $("#__po_close__").addEventListener("click", () => {
    root.remove();
    panel.remove();
    document.removeEventListener("keydown", keyHandler);
  });

  let dragging = false;
  let dragStart = { mx: 0, my: 0, x: 0, y: 0 };
  img.addEventListener("mousedown", (e) => {
    if (state.locked || !state.visible) return;
    dragging = true;
    dragStart = { mx: e.clientX, my: e.clientY, x: state.x, y: state.y };
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    state.x = dragStart.x + (e.clientX - dragStart.mx);
    state.y = dragStart.y + (e.clientY - dragStart.my);
    applyTransform();
  });
  window.addEventListener("mouseup", () => (dragging = false));

  let panelDragging = false;
  let panelStart = { mx: 0, my: 0, top: 0, left: 0 };
  panel.addEventListener("mousedown", (e) => {
    if (e.target.closest("button, input")) return;
    panelDragging = true;
    const rect = panel.getBoundingClientRect();
    panelStart = {
      mx: e.clientX,
      my: e.clientY,
      top: rect.top,
      left: rect.left,
    };
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!panelDragging) return;
    panel.style.top = `${panelStart.top + (e.clientY - panelStart.my)}px`;
    panel.style.left = `${panelStart.left + (e.clientX - panelStart.mx)}px`;
    panel.style.right = "auto";
    e.preventDefault();
  });
  window.addEventListener("mouseup", () => (panelDragging = false));

  function keyHandler(e) {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "[") setOpacity(state.opacity - 0.05);
    if (e.key === "]") setOpacity(state.opacity + 0.05);
    if (e.key.toLowerCase() === "v") {
      setVisible(!state.visible);
    }
    if (e.key.toLowerCase() === "l") {
      state.locked = !state.locked;
      $("#__po_lock__").style.background = state.locked ? "#5a3a3a" : "#3a3a3a";
    }
    if (e.key.toLowerCase() === "m") {
      setMinimized(!state.minimized);
    }
    const step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-step, 0);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(step, 0);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      nudge(0, -step);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nudge(0, step);
    }
  }
  document.addEventListener("keydown", keyHandler);

  img.addEventListener(
    "wheel",
    (e) => {
      if (state.locked || !state.visible) return;
      e.preventDefault();
      setScale(state.scale + (e.deltaY < 0 ? 0.02 : -0.02));
    },
    { passive: false },
  );

  console.log(
    "%cPixel Overlay loaded. Dán URL/path ảnh vào ô input hoặc chọn file.",
    "color:#4caf50;font-weight:bold;",
  );
})();
