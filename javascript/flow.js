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

// Initializes ambient sound controls and background video switching.
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

  // Paints custom slider fill to match current volume value.
  function setVolumeFill(value) {
    if (!volumeRange) return;
    const min = Number(volumeRange.min || 0);
    const max = Number(volumeRange.max || 1);
    const val = Number(value);
    const percent = max > min ? ((val - min) / (max - min)) * 100 : 0;
    volumeRange.style.setProperty("--fill", `${percent}%`);
  }

  // Marks selected sound button as active.
  function setActiveButton(key) {
    soundBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.sound === key));
  }

  // Updates selected sound label and ON/OFF state text.
  function updateNowPlaying() {
    if (!nowPlaying) return;
    const label = SOUND_MAP[selectedSoundKey]?.label ?? "Unknown";
    nowPlaying.textContent = `Selected: ${label} • ${isOn ? "ON" : "OFF"}`;
  }

  // Swaps the ambient background video.
  function setVideoFor(key) {
    const cfg = SOUND_MAP[key];
    if (!cfg || !videoEl || !videoSrcEl) return;

    videoSrcEl.src = cfg.video;
    videoEl.load();
    videoEl.play().catch(() => {});
  }

  // Starts playback for the selected ambient audio track.
  async function startAudioFor(key) {
    const cfg = SOUND_MAP[key];
    if (!cfg) return;

    audioEl.src = cfg.audio;
    audioEl.currentTime = 0;

    try {
      await audioEl.play();
    } catch {}
  }

  // Stops the current ambient audio track.
  function stopAudio() {
    audioEl.pause();
    audioEl.currentTime = 0;
  }

  // Syncs toggle button visuals with ON/OFF state.
  function setToggleUI() {
    if (!toggleBtn || !toggleText) return;
    toggleBtn.classList.toggle("on", isOn);
    toggleBtn.setAttribute("aria-pressed", String(isOn));
    toggleText.textContent = isOn ? "ON" : "OFF";
  }

  // Turns ambient playback on.
  async function turnOn() {
    isOn = true;
    setToggleUI();
    await startAudioFor(selectedSoundKey);
    updateNowPlaying();
  }

  // Turns ambient playback off.
  function turnOff() {
    isOn = false;
    setToggleUI();
    stopAudio();
    updateNowPlaying();
  }

  // Handles selecting a different sound theme.
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

  // Handles master ON/OFF toggle button.
  toggleBtn.addEventListener("click", async () => {
    if (!selectedSoundKey) selectedSoundKey = "rain";
    if (isOn) turnOff();
    else await turnOn();
  });

  // Updates volume in real time as slider changes.
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

// Initializes completed-book tracking and dropdown selection UI.
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

  // Loads completed books from localStorage.
  function loadCompleted() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      completedBooks = Array.isArray(parsed) ? parsed : [];
    } catch {
      completedBooks = [];
    }
  }

  // Saves completed books to localStorage.
  function saveCompleted() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedBooks));
    } catch {}
  }

  // Formats a date for list display.
  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  // Updates completed counters and badge text.
  function updateCompletedStats() {
    const total = completedBooks.length;
    if (completedCount) completedCount.textContent = String(total);
    if (completedBadge) completedBadge.textContent = `${total} item${total === 1 ? "" : "s"}`;
  }

  // Applies current search filter to completed items.
  function getFilteredCompleted() {
    if (!searchQuery) return completedBooks;
    return completedBooks.filter((item) => (item.title || "").toLowerCase().includes(searchQuery));
  }

  // Renders completed list state.
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

  // Adds selected book to completed list if it is not a duplicate.
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

  // Removes one completed item by id.
  function removeCompleted(id) {
    completedBooks = completedBooks.filter((b) => b.id !== id);
    saveCompleted();
    updateCompletedStats();
    renderCompleted();
  }

  // Clears all completed items.
  function clearAllCompleted() {
    completedBooks = [];
    saveCompleted();
    updateCompletedStats();
    renderCompleted();
  }

  // Opens the custom book dropdown.
  function openDropdown() {
    if (!bookSelect) return;
    bookSelect.classList.add("open");
    bookSelectBtn?.setAttribute("aria-expanded", "true");
    bookSelectMenu?.setAttribute("aria-hidden", "false");
    activeIndex = 0;
    renderDropdownList();
    setTimeout(() => bookSelectSearch?.focus(), 0);
  }

  // Closes the custom book dropdown.
  function closeDropdown() {
    if (!bookSelect) return;
    bookSelect.classList.remove("open");
    bookSelectBtn?.setAttribute("aria-expanded", "false");
    bookSelectMenu?.setAttribute("aria-hidden", "true");
  }

  // Applies chosen dropdown book to form fields.
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

  // Filters dropdown options using query text.
  function getDropdownFilteredBooks() {
    const q = dropdownQuery.trim().toLowerCase();
    if (!q) return ALL_BOOKS;

    return ALL_BOOKS.filter((b) => {
      const t = (b.title || "").toLowerCase();
      const a = (b.author || "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }

  // Renders selectable entries in the dropdown.
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

  // Moves active dropdown row for keyboard navigation.
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

  // Selects the current active dropdown row.
  function pickActive() {
    const list = getDropdownFilteredBooks();
    if (list.length === 0) return;

    const pick = list[Math.max(0, activeIndex)];
    if (!pick) return;

    setSelectedBook(pick);
    closeDropdown();
  }

  // Submits selected book as completed.
  completedForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    addCompletedFromBook(selectedBook);
  });

  // Handles remove actions from completed list.
  completedList?.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove_btn");
    if (!btn) return;
    removeCompleted(btn.dataset.id);
  });

  // Clears all completed entries from the list.
  clearAllBtn?.addEventListener("click", clearAllCompleted);

  // Filters completed list as the user types.
  completedSearch?.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderCompleted();
  });

  // Toggles dropdown open/close from trigger button.
  bookSelectBtn?.addEventListener("click", () => {
    if (bookSelect?.classList.contains("open")) closeDropdown();
    else openDropdown();
  });

  // Filters dropdown options while typing.
  bookSelectSearch?.addEventListener("input", (e) => {
    dropdownQuery = e.target.value;
    activeIndex = 0;
    renderDropdownList();
  });

  // Enables keyboard controls in dropdown search.
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

  // Closes dropdown when clicking outside the selector.
  window.addEventListener("click", (e) => {
    if (!bookSelect) return;
    if (!bookSelect.contains(e.target)) closeDropdown();
  });

  // Initial render with any persisted data.
  loadCompleted();
  updateCompletedStats();
  renderCompleted();

  if (ALL_BOOKS.length > 0) setSelectedBook(ALL_BOOKS[0]);
}
