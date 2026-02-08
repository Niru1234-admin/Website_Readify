"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const trackerRoot = document.querySelector(".tracker_section");
  if (!trackerRoot) return;

  const bookNameEl = trackerRoot.querySelector("#bookName");

  const STORAGE_SINGLE_KEY = "readify_tracker_progress";
  const STORAGE_LIST_KEY = "readify_tracker_saved_list";

  const trackerForm = trackerRoot.querySelector("#trackerForm");
  const totalPagesEl = trackerRoot.querySelector("#totalPages");
  const pagesReadEl = trackerRoot.querySelector("#pagesRead");
  const speedEl = trackerRoot.querySelector("#speed");

  const percentText = trackerRoot.querySelector("#percentText");
  const remainingText = trackerRoot.querySelector("#remainingText");
  const finishDays = trackerRoot.querySelector("#finishDays");
  const finishDate = trackerRoot.querySelector("#finishDate");

  const progressFill = trackerRoot.querySelector("#progressFill");
  const progressLabel = trackerRoot.querySelector("#progressLabel");
  const trackerError = trackerRoot.querySelector("#trackerError");
  const trackerSuggestions = trackerRoot.querySelector("#trackerSuggestions");
  const lastSavedText = trackerRoot.querySelector("#lastSavedText");

  const saveBtn = trackerRoot.querySelector("#saveBtn");
  const clearBtn = trackerRoot.querySelector("#clearBtn");

  const savedListEl = trackerRoot.querySelector("#savedList");
  const savedEmptyEl = trackerRoot.querySelector("#savedEmpty");
  const clearSavedBtn = trackerRoot.querySelector("#clearSavedBtn");

  let lastComputed = null;
  let savedList = [];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function animateNumber(el, from, to, duration = 450) {
    if (!el) return;

    if (!Number.isFinite(from)) from = 0;

    const start = performance.now();

    function tick(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const val = from + (to - from) * t;
      el.textContent = String(Math.round(val));
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function setSuggestions(items) {
    if (!trackerSuggestions) return;
    trackerSuggestions.innerHTML = "";
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      trackerSuggestions.appendChild(li);
    });
  }

  function setError(msg) {
    if (!trackerError) return;
    trackerError.textContent = msg || "";
  }

  function compute() {
    const bookName = (bookNameEl?.value || "").trim();
    const total = Number(totalPagesEl?.value);
    const read = Number(pagesReadEl?.value);
    const speed = Number(speedEl?.value);

    if (!bookName) return { error: "Please enter a book name." };
    if (!Number.isFinite(total) || total <= 0) return { error: "Total pages must be a number greater than 0." };
    if (!Number.isFinite(read) || read < 0) return { error: "Pages read must be 0 or more." };
    if (read > total) return { error: "Pages read cannot be greater than total pages." };
    if (!Number.isFinite(speed) || speed <= 0) return { error: "Reading speed must be at least 1 page/day." };

    const percent = clamp((read / total) * 100, 0, 100);
    const remaining = Math.max(0, total - read);

    const daysLeft = remaining === 0 ? 0 : remaining / speed;
    const daysRoundedUp = remaining === 0 ? 0 : Math.ceil(daysLeft);
    const finishTs = Date.now() + daysRoundedUp * 24 * 60 * 60 * 1000;

    return { bookName, total, read, speed, percent, remaining, daysRoundedUp, finishTs };
  }

  function render(result) {
    const prev = Number(percentText?.textContent);
    animateNumber(percentText, prev, result.percent);

    if (remainingText) remainingText.textContent = String(result.remaining);
    if (progressFill) progressFill.style.width = `${result.percent.toFixed(1)}%`;

    if (finishDays) {
      finishDays.textContent = result.remaining === 0 ? "Completed" : `${result.daysRoundedUp} day(s)`;
    }

    if (finishDate) {
      finishDate.textContent = result.remaining === 0 ? formatDate(Date.now()) : formatDate(result.finishTs);
    }

    if (progressLabel) {
      progressLabel.textContent =
        result.remaining === 0 ? "You finished this book!" : `Keep going — ${result.remaining} page(s) left.`;
    }

    setSuggestions(
      result.remaining === 0
        ? ["Nice! Start a new book and track it here."]
        : [
            `If you read ${result.speed} pages/day, you’ll finish in about ${result.daysRoundedUp} day(s).`,
            "Try consistency: even 10 pages/day makes progress."
          ]
    );
  }

  function saveSingle(data) {
    const payload = { ...data, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_SINGLE_KEY, JSON.stringify(payload));
    updateLastSaved(payload.updatedAt);
  }

  function loadSingle() {
    try {
      const raw = localStorage.getItem(STORAGE_SINGLE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearSingle() {
    localStorage.removeItem(STORAGE_SINGLE_KEY);
    updateLastSaved(null);
  }

  function updateLastSaved(ts) {
    if (!lastSavedText) return;
    lastSavedText.textContent = ts ? `Last saved: ${formatDate(ts)} ${formatTime(ts)}` : "No saved progress yet.";
  }

  function loadSavedList() {
    try {
      savedList = JSON.parse(localStorage.getItem(STORAGE_LIST_KEY)) || [];
      if (!Array.isArray(savedList)) savedList = [];
    } catch {
      savedList = [];
    }
  }

  function saveSavedList() {
    localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(savedList));
  }

  function makeId() {
    try {
      if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch {}
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addToSavedList(result) {
    const item = {
      id: makeId(),
      bookName: result.bookName,
      total: result.total,
      read: result.read,
      speed: result.speed,
      percent: Number(result.percent.toFixed(1)),
      remaining: result.remaining,
      days: result.daysRoundedUp,
      finishTs: result.finishTs,
      savedAt: Date.now()
    };

    savedList.unshift(item);
    if (savedList.length > 20) savedList = savedList.slice(0, 20);

    saveSavedList();
    renderSavedList();
  }

  function removeSavedItem(id) {
    savedList = savedList.filter((x) => x.id !== id);
    saveSavedList();
    renderSavedList();
  }

  function clearSavedList() {
    savedList = [];
    saveSavedList();
    renderSavedList();
  }

  function renderSavedList() {
    if (!savedListEl) return;
    savedListEl.innerHTML = "";

    if (savedEmptyEl) {
      savedEmptyEl.style.display = savedList.length === 0 ? "block" : "none";
    }

    savedList.forEach((item) => {
      const li = document.createElement("li");
      li.className = "tracker_saved_item";

      li.innerHTML = `
        <div>
          <div class="tracker_saved_title">
            ${item.bookName} — ${item.percent}% completed
          </div>
          <div class="tracker_saved_meta">
            ${item.read}/${item.total} pages • ${item.speed} pages/day •
            Finish: ${item.remaining === 0 ? "Done" : formatDate(item.finishTs)} •
            Saved: ${formatDate(item.savedAt)} ${formatTime(item.savedAt)}
          </div>
        </div>

        <div class="tracker_saved_actions">
          <button class="tracker_icon_btn" type="button" data-action="load" data-id="${item.id}">Load</button>
          <button class="tracker_icon_btn danger" type="button" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      `;

      savedListEl.appendChild(li);
    });
  }

  function loadSavedItemIntoForm(id) {
    const item = savedList.find((x) => x.id === id);
    if (!item) return;

    if (bookNameEl) bookNameEl.value = item.bookName;
    if (totalPagesEl) totalPagesEl.value = item.total;
    if (pagesReadEl) pagesReadEl.value = item.read;
    if (speedEl) speedEl.value = item.speed;

    const result = compute();
    if (!result.error) {
      lastComputed = result;
      render(result);
    }
  }

  trackerForm?.addEventListener("submit", (e) => {
    if (!trackerForm.checkValidity()) {
      e.preventDefault();
      trackerForm.reportValidity();
      return;
    }

    e.preventDefault();
    setError("");

    const result = compute();
    if (result.error) {
      setError(result.error);
      return;
    }

    lastComputed = result;
    render(result);
  });

  saveBtn?.addEventListener("click", () => {
    if (!trackerForm?.checkValidity()) {
      trackerForm?.reportValidity();
      return;
    }

    setError("");

    const result = lastComputed || compute();
    if (result.error) {
      setError("Please fix inputs and click Calculate before saving.");
      return;
    }

    lastComputed = result;

    saveSingle(result);
    addToSavedList(result);

    setError("Saved");
    setTimeout(() => setError(""), 1200);
  });

  clearBtn?.addEventListener("click", () => {
    clearSingle();
    lastComputed = null;

    if (bookNameEl) bookNameEl.value = "";
    if (totalPagesEl) totalPagesEl.value = "";
    if (pagesReadEl) pagesReadEl.value = "";
    if (speedEl) speedEl.value = "";

    if (percentText) percentText.textContent = "--";
    if (remainingText) remainingText.textContent = "--";
    if (finishDays) finishDays.textContent = "--";
    if (finishDate) finishDate.textContent = "--";
    if (progressFill) progressFill.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "Fill the form and click Calculate.";
    setSuggestions(["Fill the form and click Calculate."]);

    setError("Cleared");
    setTimeout(() => setError(""), 1200);
  });

  savedListEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "remove") removeSavedItem(id);
    if (action === "load") loadSavedItemIntoForm(id);
  });

  clearSavedBtn?.addEventListener("click", () => {
    clearSavedList();
    setError("Saved list cleared");
    setTimeout(() => setError(""), 1200);
  });

  (function init() {
    loadSavedList();
    renderSavedList();

    const saved = loadSingle();
    if (saved) {
      if (bookNameEl) bookNameEl.value = saved.bookName ?? "";
      if (totalPagesEl) totalPagesEl.value = saved.total ?? "";
      if (pagesReadEl) pagesReadEl.value = saved.read ?? "";
      if (speedEl) speedEl.value = saved.speed ?? "";

      updateLastSaved(saved.updatedAt ?? null);

      const safe = compute();
      if (!safe.error) {
        lastComputed = safe;
        render(safe);
      }
    } else {
      updateLastSaved(null);
    }
  })();
});
