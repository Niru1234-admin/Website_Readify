document.addEventListener("DOMContentLoaded", () => {
  // --- Stored "JSON" data (in JS array form) ---
  // You can add more books anytime.
  const BOOKS = [
    {
      id: "b1",
      title: "The Lost Key",
      author: "A. Writer",
      genre: "mystery",
      length: "short",
      cover: "../assets/images/book-1.png",
      description: "A fast mystery about a missing key and a hidden message."
    },
    {
      id: "b2",
      title: "Sky Cities",
      author: "Nova Reed",
      genre: "sci-fi",
      length: "medium",
      cover: "../assets/images/book-2.png",
      description: "A sci-fi journey through floating cities and secret tech."
    },
    {
      id: "b3",
      title: "Forest of Spells",
      author: "Luna Grey",
      genre: "fantasy",
      length: "long",
      cover: "../assets/images/book-3.png",
      description: "A fantasy adventure with magical forests and brave heroes."
    },
    {
      id: "b4",
      title: "Small Habits, Big Change",
      author: "K. Miles",
      genre: "self-help",
      length: "short",
      cover: "../assets/images/book-4.png",
      description: "Simple habits that make a big difference in daily life."
    },
    {
      id: "b5",
      title: "Everyday Stories",
      author: "M. Lane",
      genre: "fiction",
      length: "medium",
      cover: "../assets/images/book-1.png",
      description: "Warm fiction stories about family, friendship, and growth."
    },
    {
      id: "b6",
      title: "True Wonders",
      author: "N. Silva",
      genre: "nonfiction",
      length: "long",
      cover: "../assets/images/book-2.png",
      description: "Real-world discoveries explained in a fun, easy way."
    },
    {
      id: "b7",
      title: "Hearts & Letters",
      author: "R. Bloom",
      genre: "romance",
      length: "medium",
      cover: "../assets/images/book-3.png",
      description: "A romance story told through letters and unexpected moments."
    },
    {
      id: "b8",
      title: "The Quiet Clue",
      author: "S. Hart",
      genre: "mystery",
      length: "long",
      cover: "../assets/images/book-4.png",
      description: "A deeper mystery with twists, suspects, and a final reveal."
    }
  ];

  // --- Elements ---
  const genreSelect = document.getElementById("genreSelect");
  const lengthSelect = document.getElementById("lengthSelect");
  const pickAgainBtn = document.getElementById("pickAgainBtn");
  const saveBtn = document.getElementById("saveBtn");

  const card = document.getElementById("recommendationCard");
  const recCover = document.getElementById("recCover");
  const recTitle = document.getElementById("recTitle");
  const recMeta = document.getElementById("recMeta");
  const recDesc = document.getElementById("recDesc");
  const recHint = document.getElementById("recHint");

  const readingListEl = document.getElementById("readingList");
  const readingEmpty = document.getElementById("readingEmpty");

  // --- State ---
  let currentRecommendation = null;

  // --- localStorage helpers ---
  const STORAGE_KEY = "readifyReadingList";

  function getSavedList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setSavedList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // --- Recommendation logic ---
  function filterBooks() {
    const g = genreSelect.value;
    const l = lengthSelect.value;

    return BOOKS.filter(b => {
      const matchGenre = (g === "any") || (b.genre === g);
      const matchLength = (l === "any") || (b.length === l);
      return matchGenre && matchLength;
    });
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showRecommendation(book) {
    currentRecommendation = book;

    recCover.src = book.cover;
    recCover.alt = `${book.title} cover`;
    recTitle.textContent = book.title;
    recMeta.textContent = `By ${book.author} • Genre: ${book.genre} • Length: ${book.length}`;
    recDesc.textContent = book.description;

    saveBtn.disabled = false;
    recHint.textContent = "";

    // animate
    card.classList.remove("animate_card");
    void card.offsetWidth; // reset animation
    card.classList.add("animate_card");
  }

  function pickRecommendation() {
    const filtered = filterBooks();

    pickAgainBtn.classList.remove("animate_btn");
    void pickAgainBtn.offsetWidth;
    pickAgainBtn.classList.add("animate_btn");

    if (filtered.length === 0) {
      currentRecommendation = null;
      saveBtn.disabled = true;
      recTitle.textContent = "No match found 😅";
      recMeta.textContent = "Try changing Genre/Length.";
      recDesc.textContent = "Your current filters have no books in the stored list.";
      recCover.src = "../assets/images/book-1.png";
      recHint.textContent = "";
      return;
    }

    const picked = pickRandom(filtered);
    showRecommendation(picked);
  }

  // --- Reading list UI ---
  function renderReadingList() {
    const list = getSavedList();

    readingListEl.innerHTML = "";

    if (list.length === 0) {
      readingEmpty.style.display = "block";
      return;
    }

    readingEmpty.style.display = "none";

    list.forEach(item => {
      const li = document.createElement("li");
      li.className = "reading_item";

      li.innerHTML = `
        <img src="${item.cover}" alt="${item.title} cover">
        <div>
          <div class="reading_item_title">${item.title}</div>
          <div class="reading_item_meta">Genre: ${item.genre} • Length: ${item.length}</div>
        </div>
        <button class="remove_btn" type="button" title="Remove">✕</button>
      `;

      li.querySelector(".remove_btn").addEventListener("click", () => {
        const updated = getSavedList().filter(b => b.id !== item.id);
        setSavedList(updated);
        renderReadingList();
      });

      readingListEl.appendChild(li);
    });
  }

  function saveCurrent() {
    if (!currentRecommendation) return;

    const list = getSavedList();
    const exists = list.some(b => b.id === currentRecommendation.id);

    if (exists) {
      recHint.textContent = "Already saved ✅";
      return;
    }

    list.unshift(currentRecommendation);
    setSavedList(list);
    recHint.textContent = "Saved to your reading list ✅";
    renderReadingList();
  }

  // --- Events ---
  pickAgainBtn.addEventListener("click", pickRecommendation);
  saveBtn.addEventListener("click", saveCurrent);

  // Optional: auto-pick when filters change (nice UX)
  genreSelect.addEventListener("change", pickRecommendation);
  lengthSelect.addEventListener("change", pickRecommendation);

  // Initial render
  renderReadingList();
});
