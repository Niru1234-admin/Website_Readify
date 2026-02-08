document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".recommender_section");
  if (!root) return;

  const BOOKS = [
    {
      id: "b1",
      title: "The Alchemist",
      author: "Paulo Coelho",
      genre: "Fiction",
      length: "Short",
      cover: "assets/books/book1.jpg",
      description: "A philosophical story about following dreams and finding purpose."
    },
    {
      id: "b2",
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      genre: "Fiction",
      length: "Long",
      cover: "assets/books/book2.jpg",
      description: "A powerful novel about friendship, guilt, and redemption."
    },
    {
      id: "b3",
      title: "The Little Prince",
      author: "Antoine de Saint-Exupéry",
      genre: "Fiction",
      length: "Short",
      cover: "assets/books/book3.jpg",
      description: "A poetic tale exploring love, innocence, and human nature."
    },
    {
      id: "b4",
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Non-Fiction",
      length: "Medium",
      cover: "assets/books/book4.jpg",
      description: "A practical guide to building good habits through small changes."
    },
    {
      id: "b5",
      title: "Rich Dad Poor Dad",
      author: "Robert T. Kiyosaki",
      genre: "Non-Fiction",
      length: "Medium",
      cover: "assets/books/book5.jpg",
      description: "Lessons on money, mindset, and financial independence."
    },
    {
      id: "b6",
      title: "Man's Search for Meaning",
      author: "Viktor E. Frankl",
      genre: "Non-Fiction",
      length: "Short",
      cover: "assets/books/book6.jpg",
      description: "A deeply moving reflection on purpose, suffering, and resilience."
    },
    {
      id: "b7",
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      genre: "Fantasy",
      length: "Long",
      cover: "assets/books/book7.jpg",
      description: "The beginning of a magical journey at Hogwarts School of Witchcraft and Wizardry."
    },
    {
      id: "b8",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      length: "Long",
      cover: "assets/books/book8.jpg",
      description: "A classic fantasy adventure about courage, dragons, and unexpected journeys."
    },
    {
      id: "b9",
      title: "Alice in Wonderland",
      author: "Lewis Carroll",
      genre: "Fantasy",
      length: "Short",
      cover: "assets/books/book9.jpg",
      description: "A whimsical story full of imagination, logic, and curious characters."
    },
    {
      id: "b10",
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      length: "Long",
      cover: "assets/books/book10.jpg",
      description: "An epic science fiction story about power, survival, and destiny."
    },
    {
      id: "b11",
      title: "Ender's Game",
      author: "Orson Scott Card",
      genre: "Sci-Fi",
      length: "Medium",
      cover: "assets/books/book11.jpg",
      description: "A sci-fi novel focused on strategy, leadership, and moral dilemmas."
    },
    {
      id: "b12",
      title: "Neuromancer",
      author: "William Gibson",
      genre: "Sci-Fi",
      length: "Medium",
      cover: "assets/books/book12.jpg",
      description: "A cyberpunk classic exploring hackers, AI, and digital identity."
    }
  ];

  const genreSelect = root.querySelector("#genreSelect");
  const lengthSelect = root.querySelector("#lengthSelect");
  const pickAgainBtn = root.querySelector("#pickAgainBtn");
  const saveBtn = root.querySelector("#saveBtn");

  const card = root.querySelector("#recommendationCard");
  const recCover = root.querySelector("#recCover");
  const recTitle = root.querySelector("#recTitle");
  const recMeta = root.querySelector("#recMeta");
  const recDesc = root.querySelector("#recDesc");
  const recHint = root.querySelector("#recHint");

  const readingListEl = root.querySelector("#readingList");
  const readingEmpty = root.querySelector("#readingEmpty");

  if (
    !genreSelect || !lengthSelect || !pickAgainBtn || !saveBtn ||
    !card || !recCover || !recTitle || !recMeta || !recDesc ||
    !recHint || !readingListEl || !readingEmpty
  ) return;

  let currentRecommendation = null;
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

  function filterBooks() {
    const g = genreSelect.value;
    const l = lengthSelect.value;

    return BOOKS.filter(b =>
      (g === "any" || b.genre === g) &&
      (l === "any" || b.length === l)
    );
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

    card.classList.remove("animate_card");
    void card.offsetWidth;
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
      recTitle.textContent = "No match found";
      recMeta.textContent = "Try changing Genre / Length.";
      recDesc.textContent = "Your current filters have no books in the stored list.";
      recCover.src = "assets/books/book1.jpg";
      recHint.textContent = "";
      return;
    }

    showRecommendation(pickRandom(filtered));
  }

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
        <button class="remove_btn" type="button" title="Remove">✖</button>
      `;

      li.querySelector(".remove_btn").addEventListener("click", () => {
        setSavedList(getSavedList().filter(b => b.id !== item.id));
        renderReadingList();
      });

      readingListEl.appendChild(li);
    });
  }

  function saveCurrent() {
    if (!currentRecommendation) return;

    const list = getSavedList();
    if (list.some(b => b.id === currentRecommendation.id)) {
      recHint.textContent = "Already saved ✅";
      return;
    }

    list.unshift(currentRecommendation);
    setSavedList(list);
    recHint.textContent = "Saved to your reading list ✅";
    renderReadingList();
  }

  pickAgainBtn.addEventListener("click", pickRecommendation);
  saveBtn.addEventListener("click", saveCurrent);
  genreSelect.addEventListener("change", pickRecommendation);
  lengthSelect.addEventListener("change", pickRecommendation);

  renderReadingList();
});
