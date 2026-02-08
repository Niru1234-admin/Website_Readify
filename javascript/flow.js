document.addEventListener("DOMContentLoaded", () => {
  const completedForm = document.getElementById("completedForm");
  const bookSelect = document.getElementById("bookSelect");
  const soundToggleBtn = document.getElementById("soundToggleBtn");

  const hasSoundSection = Boolean(soundToggleBtn);
  const hasCompletedSection = Boolean(completedForm || bookSelect);

  if (!hasSoundSection && !hasCompletedSection) return;

  if (hasSoundSection) initSoundSection();
  if (hasCompletedSection) initCompletedSection();
});

function initSoundSection() {
  const SOUND_MAP = {
    rain: { audio: "assets/audio/rain.mp3", video: "assets/video/rain.mp4", label: "Rain" },
    ocean: { audio: "assets/audio/ocean.mp3", video: "assets/video/ocean.mp4", label: "Ocean" },
    forest: { audio: "assets/audio/forest.mp3", video: "assets/video/forest.mp4", label: "Forest" },
    night: { audio: "assets/audio/night.mp3", video: "assets/video/night.mp4", label: "Night" }
  };

  const soundBtns = document.querySelectorAll(".sound_btn");
  const nowPlaying = document.getElementById("nowPlaying");
  const volumeRange = document.getElementById("volumeRange");

  const toggleBtn = document.getElementById("soundToggleBtn");
  const toggleText = toggleBtn?.querySelector(".toggle_text");

  const videoEl = document.getElementById("soundVideo");
  const videoSrcEl = document.getElementById("soundVideoSrc");

  if (!toggleBtn) return;

  let selectedSoundKey = "rain";
  let isOn = false;

  const audioEl = new Audio();
  audioEl.loop = true;
  audioEl.volume = Number(volumeRange?.value ?? 0.6);

  function setVolumeFill(value) {
    if (!volumeRange) return;
    const min = Number(volumeRange.min || 0);
    const max = Number(volumeRange.max || 1);
    const val = Number(value);
    const percent = max > min ? ((val - min) / (max - min)) * 100 : 0;
    volumeRange.style.setProperty("--fill", `${percent}%`);
  }

  function setActiveButton(key) {
    soundBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.sound === key));
  }

  function updateNowPlaying() {
    if (!nowPlaying) return;
    const label = SOUND_MAP[selectedSoundKey]?.label ?? "Unknown";
    nowPlaying.textContent = `Selected: ${label} • ${isOn ? "ON" : "OFF"}`;
  }

  function setVideoFor(key) {
    const cfg = SOUND_MAP[key];
    if (!cfg || !videoEl || !videoSrcEl) return;

    videoSrcEl.src = cfg.video;
    videoEl.load();
    videoEl.play().catch(() => {});
  }

  async function startAudioFor(key) {
    const cfg = SOUND_MAP[key];
    if (!cfg) return;

    audioEl.src = cfg.audio;
    audioEl.currentTime = 0;

    try {
      await audioEl.play();
    } catch {}
  }

  function stopAudio() {
    audioEl.pause();
    audioEl.currentTime = 0;
  }

  function setToggleUI() {
    if (!toggleBtn || !toggleText) return;
    toggleBtn.classList.toggle("on", isOn);
    toggleBtn.setAttribute("aria-pressed", String(isOn));
    toggleText.textContent = isOn ? "ON" : "OFF";
  }

  async function turnOn() {
    isOn = true;
    setToggleUI();
    await startAudioFor(selectedSoundKey);
    updateNowPlaying();
  }

  function turnOff() {
    isOn = false;
    setToggleUI();
    stopAudio();
    updateNowPlaying();
  }

  soundBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.sound;
      if (!SOUND_MAP[key]) return;

      selectedSoundKey = key;
      setActiveButton(key);
      setVideoFor(key);

      if (isOn) {
        stopAudio();
        await startAudioFor(key);
      }

      updateNowPlaying();
    });
  });

  toggleBtn.addEventListener("click", async () => {
    if (!selectedSoundKey) selectedSoundKey = "rain";
    if (isOn) turnOff();
    else await turnOn();
  });

  volumeRange?.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    audioEl.volume = value;
    setVolumeFill(value);
  });

  setActiveButton(selectedSoundKey);
  setVideoFor(selectedSoundKey);
  setToggleUI();
  updateNowPlaying();
  setVolumeFill(volumeRange?.value ?? 0.6);
}

function initCompletedSection() {
  const completedForm = document.getElementById("completedForm");
  const bookSelect = document.getElementById("bookSelect");
  const bookTitleInput = document.getElementById("bookTitleInput");
  const completedList = document.getElementById("completedList");
  const completedCount = document.getElementById("completedCount");
  const completedBadge = document.getElementById("completedBadge");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const completedSearch = document.getElementById("completedSearch");
  const completedEmpty = document.getElementById("completedEmpty");

  const bookSelectBtn = document.getElementById("bookSelectBtn");
  const bookSelectText = document.getElementById("bookSelectText");
  const bookSelectThumb = document.getElementById("bookSelectThumb");
  const bookSelectMenu = document.getElementById("bookSelectMenu");
  const bookSelectSearch = document.getElementById("bookSelectSearch");
  const bookSelectList = document.getElementById("bookSelectList");
  const bookSelectEmpty = document.getElementById("bookSelectEmpty");

  if (!completedForm && !bookSelect) return;

  const STORAGE_KEY = "readify_completed_books";

  const ALL_BOOKS_RAW = Array.isArray(window.BOOKS_DATA) ? window.BOOKS_DATA : [];

  const ALL_BOOKS = (() => {
    const seen = new Set();
    const out = [];
    for (const b of ALL_BOOKS_RAW) {
      const key = `${(b.title || "").toLowerCase()}|${(b.author || "").toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(b);
    }
    return out;
  })();

  let completedBooks = [];
  let searchQuery = "";
  let selectedBook = null;
  let dropdownQuery = "";
  let activeIndex = -1;

  function loadCompleted() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      completedBooks = Array.isArray(parsed) ? parsed : [];
    } catch {
      completedBooks = [];
    }
  }

  function saveCompleted() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedBooks));
    } catch {}
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function updateCompletedStats() {
    const total = completedBooks.length;
    if (completedCount) completedCount.textContent = String(total);
    if (completedBadge) completedBadge.textContent = `${total} item${total === 1 ? "" : "s"}`;
  }

  function getFilteredCompleted() {
    if (!searchQuery) return completedBooks;
    return completedBooks.filter((item) => (item.title || "").toLowerCase().includes(searchQuery));
  }

  function renderCompleted() {
    if (!completedList) return;
    completedList.innerHTML = "";

    const filtered = getFilteredCompleted();

    if (completedEmpty) {
      completedEmpty.style.display = completedBooks.length === 0 ? "block" : "none";
    }

    if (searchQuery && filtered.length === 0) {
      completedList.innerHTML = `
        <li class="completed_item">
          <div>
            <div class="completed_item_title">No matches</div>
            <div class="completed_item_meta">Try a different name.</div>
          </div>
        </li>`;
      return;
    }

    filtered.forEach((item) => {
      const li = document.createElement("li");
      li.className = "completed_item";

      li.innerHTML = `
        <div>
          <div class="completed_item_title">${item.title}</div>
          <div class="completed_item_meta">Completed on ${formatDate(item.completedAt)}</div>
        </div>
        <button class="remove_btn" type="button" data-id="${item.id}">Remove</button>
      `;

      completedList.appendChild(li);
    });
  }

  function addCompletedFromBook(book) {
    if (!book || !book.title) return;

    const clean = book.title.trim();
    if (!clean) return;

    const exists = completedBooks.some((b) => (b.title || "").toLowerCase() === clean.toLowerCase());
    if (exists) return;

    const id = window.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());

    completedBooks.unshift({
      id,
      bookId: book.id ?? null,
      title: clean,
      completedAt: Date.now()
    });

    saveCompleted();
    updateCompletedStats();
    renderCompleted();
  }

  function removeCompleted(id) {
    completedBooks = completedBooks.filter((b) => b.id !== id);
    saveCompleted();
    updateCompletedStats();
    renderCompleted();
  }

  function clearAllCompleted() {
    completedBooks = [];
    saveCompleted();
    updateCompletedStats();
    renderCompleted();
  }

  function openDropdown() {
    if (!bookSelect) return;
    bookSelect.classList.add("open");
    bookSelectBtn?.setAttribute("aria-expanded", "true");
    bookSelectMenu?.setAttribute("aria-hidden", "false");
    activeIndex = 0;
    renderDropdownList();
    setTimeout(() => bookSelectSearch?.focus(), 0);
  }

  function closeDropdown() {
    if (!bookSelect) return;
    bookSelect.classList.remove("open");
    bookSelectBtn?.setAttribute("aria-expanded", "false");
    bookSelectMenu?.setAttribute("aria-hidden", "true");
  }

  function setSelectedBook(book) {
    selectedBook = book;

    if (bookTitleInput) bookTitleInput.value = book?.title ? book.title : "";
    if (bookSelectText) bookSelectText.textContent = book?.title ? book.title : "Choose a book...";

    if (bookSelectThumb) {
      bookSelectThumb.innerHTML = "";
      if (book?.image) {
        const img = document.createElement("img");
        img.src = book.image;
        img.alt = book?.title || "";
        bookSelectThumb.appendChild(img);
      }
    }
  }

  function getDropdownFilteredBooks() {
    const q = dropdownQuery.trim().toLowerCase();
    if (!q) return ALL_BOOKS;

    return ALL_BOOKS.filter((b) => {
      const t = (b.title || "").toLowerCase();
      const a = (b.author || "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }

  function renderDropdownList() {
    if (!bookSelectList) return;

    const list = getDropdownFilteredBooks();
    bookSelectList.innerHTML = "";

    if (bookSelectEmpty) {
      bookSelectEmpty.style.display = list.length === 0 ? "block" : "none";
    }

    list.forEach((b, idx) => {
      const li = document.createElement("li");
      li.className = "book_select_item";
      if (idx === activeIndex) li.classList.add("active");

      li.innerHTML = `
        <div class="book_select_item_thumb">
          ${b.image ? `<img src="${b.image}" alt="">` : ``}
        </div>
        <div>
          <div class="book_select_item_title">${b.title}</div>
          <div class="book_select_item_meta">${b.author || ""}</div>
        </div>
      `;

      li.addEventListener("click", () => {
        setSelectedBook(b);
        closeDropdown();
      });

      bookSelectList.appendChild(li);
    });
  }

  function moveActive(delta) {
    const list = getDropdownFilteredBooks();
    if (list.length === 0) return;

    activeIndex += delta;

    if (activeIndex < 0) activeIndex = list.length - 1;
    if (activeIndex >= list.length) activeIndex = 0;

    renderDropdownList();

    const items = bookSelectList?.querySelectorAll(".book_select_item");
    const el = items?.[activeIndex];
    el?.scrollIntoView({ block: "nearest" });
  }

  function pickActive() {
    const list = getDropdownFilteredBooks();
    if (list.length === 0) return;

    const pick = list[Math.max(0, activeIndex)];
    if (!pick) return;

    setSelectedBook(pick);
    closeDropdown();
  }

  completedForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    addCompletedFromBook(selectedBook);
  });

  completedList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove_btn");
    if (!btn) return;
    removeCompleted(btn.dataset.id);
  });

  clearAllBtn?.addEventListener("click", clearAllCompleted);

  completedSearch?.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderCompleted();
  });

  bookSelectBtn?.addEventListener("click", () => {
    if (bookSelect?.classList.contains("open")) closeDropdown();
    else openDropdown();
  });

  bookSelectSearch?.addEventListener("input", (e) => {
    dropdownQuery = e.target.value;
    activeIndex = 0;
    renderDropdownList();
  });

  bookSelectSearch?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      pickActive();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  });

  window.addEventListener("click", (e) => {
    if (!bookSelect) return;
    if (!bookSelect.contains(e.target)) closeDropdown();
  });

  loadCompleted();
  updateCompletedStats();
  renderCompleted();

  if (ALL_BOOKS.length > 0) setSelectedBook(ALL_BOOKS[0]);
}
