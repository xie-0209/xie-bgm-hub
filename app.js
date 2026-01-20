// app.js - BGM-HUB 迷因音效板
// 1. 使用 Web Audio API 預先解碼，減少延遲
// 2. 支援 overlap / fade 播放模式
// 3. 支援 stopOnPlay 連動（未來要用再加在 DB）
// 4. 多分頁（群組）：上方活頁夾 Tab 切換
// 5. 每個群組有自己的排序（localStorage 獨立記錄）
// 6. 支援多指、全部靜音、防 iPhone 雙擊放大

document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("padGrid");
  const stopAllBtn = document.getElementById("stopAllBtn");
  const tabBarEl = document.getElementById("tabBar");

  const STORAGE_KEY_PREFIX = "BGMHubOrder:";
  const ACTIVE_GROUP_KEY = "BGMHubActiveGroup";

  // === 檢查 DB 是否存在 ===
  if (typeof AUDIO_DB === "undefined" || typeof AUDIO_GROUPS === "undefined") {
    console.error("AUDIO_DB 或 AUDIO_GROUPS 未定義，請先在 audiodb.js 定義。");
    return;
  }

  // === 音效引擎 ===
  let audioCtx = null;
  const audioBuffers = new Map(); // id -> AudioBuffer
  const activeSources = new Map(); // id -> [{ source, gainNode }]
  const playButtons = new Map(); // id -> 對應按鈕

  // 啟動 / 取得 AudioContext
  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  // 播放模式判斷：預設 fade，如有 meta.mode 則以 meta 為主
  function getPlayMode(meta) {
    if (meta.mode) return meta.mode;
    // 未來如果有需要某些 id overlap，可以在這裡加規則
    return "fade";
  }

  // 載入 / 解碼 AudioBuffer
  async function loadBuffer(meta) {
    if (audioBuffers.has(meta.id)) return;

    const ctx = getAudioContext();
    try {
      const resp = await fetch(meta.file);
      const arrBuf = await resp.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrBuf);
      audioBuffers.set(meta.id, audioBuf);
    } catch (err) {
      console.error("載入音檔失敗：", meta.file, err);
    }
  }

  async function ensureBufferLoaded(meta) {
    if (audioBuffers.has(meta.id)) return;
    await loadBuffer(meta);
  }

  // 播放前先壓掉需要淡出的其他目標（連動）
  function stopLinkedTargets(meta) {
    if (!audioCtx) return;
    if (!meta.stopOnPlay || !Array.isArray(meta.stopOnPlay)) return;

    const ctx = audioCtx;
    const now = ctx.currentTime;

    meta.stopOnPlay.forEach((targetId) => {
      const list = activeSources.get(targetId);
      if (!list || !list.length) return;

      list.forEach(({ source, gainNode }) => {
        try {
          const g = gainNode.gain;
          g.cancelScheduledValues(now);
          g.setValueAtTime(g.value, now);
          g.linearRampToValueAtTime(0, now + 0.2);
          source.stop(now + 0.25);
        } catch (_) {}
      });

      activeSources.delete(targetId);

      const btn = playButtons.get(targetId);
      if (btn) {
        btn.classList.remove("is-playing");
      }
    });
  }

  function playInstrument(meta, playBtn) {
    const ctx = getAudioContext();
    const buffer = audioBuffers.get(meta.id);
    if (!buffer) {
      console.warn("音檔尚未載入或 id 不存在：", meta.id);
      return;
    }

    const mode = getPlayMode(meta);

    // 播放前先處理連動 stopOnPlay
    stopLinkedTargets(meta);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1.0, ctx.currentTime);

    source.connect(gainNode).connect(ctx.destination);

    let list = activeSources.get(meta.id) || [];

    if (mode === "fade") {
      const now = ctx.currentTime;
      list.forEach(({ source: oldSrc, gainNode: oldGain }) => {
        try {
          const g = oldGain.gain;
          g.cancelScheduledValues(now);
          g.setValueAtTime(g.value, now);
          g.linearRampToValueAtTime(0, now + 0.25);
          oldSrc.stop(now + 0.3);
        } catch (_) {}
      });
      list = [];
    }

    const entry = { source, gainNode };
    list.push(entry);
    activeSources.set(meta.id, list);

    playBtn.classList.add("is-playing");

    source.onended = () => {
      const arr = activeSources.get(meta.id) || [];
      const idx = arr.indexOf(entry);
      if (idx !== -1) arr.splice(idx, 1);
      if (arr.length === 0) {
        activeSources.delete(meta.id);
        playBtn.classList.remove("is-playing");
      } else {
        activeSources.set(meta.id, arr);
      }
    };

    try {
      source.start();
    } catch (e) {
      console.warn("source start failed", e);
    }
  }

  function stopInstrument(meta, playBtn) {
    if (!audioCtx) {
      playBtn.classList.remove("is-playing");
      return;
    }
    const ctx = audioCtx;
    const list = activeSources.get(meta.id);
    if (!list || !list.length) {
      playBtn.classList.remove("is-playing");
      return;
    }

    const now = ctx.currentTime;
    list.forEach(({ source, gainNode }) => {
      try {
        const g = gainNode.gain;
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(0, now + 0.15);
        source.stop(now + 0.2);
      } catch (_) {}
    });

    activeSources.delete(meta.id);
    playBtn.classList.remove("is-playing");
  }

  function stopAllInstruments() {
    if (!audioCtx) {
      playButtons.forEach((btn) => btn.classList.remove("is-playing"));
      activeSources.clear();
      return;
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    activeSources.forEach((list) => {
      list.forEach(({ source, gainNode }) => {
        try {
          const g = gainNode.gain;
          g.cancelScheduledValues(now);
          g.setValueAtTime(g.value, now);
          g.linearRampToValueAtTime(0, now + 0.12);
          source.stop(now + 0.15);
        } catch (_) {}
      });
    });

    activeSources.clear();
    playButtons.forEach((btn) => btn.classList.remove("is-playing"));
  }

  if (stopAllBtn) {
    stopAllBtn.addEventListener("click", () => {
      stopAllInstruments();
    });
  }

  // =========================
  // 群組 / 分頁 & 排序邏輯
  // =========================

  function getStorageKeyForGroup(groupId) {
    return `${STORAGE_KEY_PREFIX}${groupId}`;
  }

  function loadOrder(groupId) {
    const key = getStorageKeyForGroup(groupId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return null;
      return arr;
    } catch (e) {
      console.warn("Load order failed", e);
      return null;
    }
  }

  function saveOrder(groupId, order) {
    const key = getStorageKeyForGroup(groupId);
    try {
      localStorage.setItem(key, JSON.stringify(order));
    } catch (e) {
      console.warn("Save order failed", e);
    }
  }

  // 取得某群組的排序後清單
  function getOrderedList(groupId) {
    const itemsOfGroup = AUDIO_DB.filter((item) => item.group === groupId);
    const map = new Map();
    itemsOfGroup.forEach((item) => map.set(item.id, item));

    const savedOrder = loadOrder(groupId);
    const result = [];

    if (savedOrder && savedOrder.length > 0) {
      savedOrder.forEach((id) => {
        if (map.has(id)) {
          result.push(map.get(id));
          map.delete(id);
        }
      });
    }

    // 沒出現在 savedOrder 的（新加的）補上
    map.forEach((item) => {
      result.push(item);
    });

    return result;
  }

  // 建立單一卡片
  function createPadItem(meta) {
    const padItem = document.createElement("div");
    padItem.className = "pad-item";
    padItem.dataset.id = meta.id;
    padItem.setAttribute("draggable", "true");

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "audio-pad";

    const mainLabel = document.createElement("div");
    mainLabel.className = "audio-pad-label-main";
    mainLabel.textContent = meta.name;

    playBtn.appendChild(mainLabel);

    playButtons.set(meta.id, playBtn);

    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "audio-pad-stop";
    stopBtn.textContent = "停止這一軌";

    const handlePlayPointerDown = async (e) => {
      e.preventDefault();

      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (err) {
          console.warn("AudioContext resume failed", err);
        }
      }

      await ensureBufferLoaded(meta);
      playInstrument(meta, playBtn);
    };

    playBtn.addEventListener("pointerdown", handlePlayPointerDown);
    playBtn.addEventListener("click", (e) => {
      e.preventDefault();
    });

    stopBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      stopInstrument(meta, playBtn);
    });

    padItem.appendChild(playBtn);
    padItem.appendChild(stopBtn);

    return padItem;
  }

  // 目前啟用的群組（分頁）
  let activeGroup = (() => {
    try {
      const saved = localStorage.getItem(ACTIVE_GROUP_KEY);
      if (saved && AUDIO_GROUPS.some((g) => g.id === saved)) {
        return saved;
      }
    } catch (_) {}
    // 預設第一個
    return AUDIO_GROUPS[0]?.id ?? "";
  })();

  function saveActiveGroup(groupId) {
    try {
      localStorage.setItem(ACTIVE_GROUP_KEY, groupId);
    } catch (_) {}
  }

  // 渲染 Tabs
  function renderTabs() {
    if (!tabBarEl) return;

    tabBarEl.innerHTML = "";

    AUDIO_GROUPS.forEach((g) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab";
      if (g.id === activeGroup) {
        btn.classList.add("is-active");
      }
      btn.dataset.group = g.id;
      btn.textContent = g.label;

      btn.addEventListener("click", () => {
        if (activeGroup === g.id) return;
        activeGroup = g.id;
        saveActiveGroup(activeGroup);
        updateTabActiveState();
        renderPads();
      });

      tabBarEl.appendChild(btn);
    });
  }

  function updateTabActiveState() {
    if (!tabBarEl) return;
    const tabs = tabBarEl.querySelectorAll(".tab");
    tabs.forEach((t) => {
      if (t.dataset.group === activeGroup) {
        t.classList.add("is-active");
      } else {
        t.classList.remove("is-active");
      }
    });
  }

  // 渲染目前群組的卡片
  function renderPads() {
    if (!gridEl) return;
    const list = getOrderedList(activeGroup);

    gridEl.innerHTML = "";
    playButtons.clear();

    list.forEach((meta) => {
      const padItem = createPadItem(meta);
      gridEl.appendChild(padItem);
    });

    initDragAndDrop();

    // 順便預載本群組音檔
    list.forEach((meta) => {
      loadBuffer(meta);
    });
  }

  // 拖曳排序：只影響目前群組
  function initDragAndDrop() {
    const items = Array.from(gridEl.querySelectorAll(".pad-item"));
    let dragSrcId = null;

    items.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        dragSrcId = item.dataset.id;
        item.classList.add("dragging");
        try {
          e.dataTransfer.setData("text/plain", dragSrcId);
        } catch (_) {}
        e.dataTransfer.effectAllowed = "move";
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        dragSrcId = null;
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        const targetId = item.dataset.id;
        if (!dragSrcId || !targetId || dragSrcId === targetId) return;

        const currentOrder = getOrderedList(activeGroup).map((it) => it.id);
        const fromIndex = currentOrder.indexOf(dragSrcId);
        const toIndex = currentOrder.indexOf(targetId);
        if (fromIndex === -1 || toIndex === -1) return;

        currentOrder.splice(toIndex, 0, currentOrder.splice(fromIndex, 1)[0]);
        saveOrder(activeGroup, currentOrder);
        renderPads();
      });
    });
  }

  // iOS 雙擊放大保護：只在 pad 區攔截
  (function preventIOSDoubleTapZoom() {
    if (!gridEl) return;
    let lastTouchEnd = 0;

    gridEl.addEventListener(
      "touchend",
      (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 350) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      { passive: false }
    );
  })();

  // ===== 啟動 =====
  renderTabs();
  renderPads();
});
