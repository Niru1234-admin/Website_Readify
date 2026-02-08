document.addEventListener("DOMContentLoaded", () => {
  const books = Array.isArray(window.BOOKS_DATA) ? window.BOOKS_DATA : [];

  const booksContainer = document.getElementById("books_container");
  const categoryFilter = document.getElementById("categories");
  const authorFilter = document.getElementById("authors");
  const searchInput = document.getElementById("search");

  const bookModal = document.getElementById("book_modal");
  const closeModalBtn = document.querySelector(".close_modal");

  const modalImg = document.getElementById("modal_img");
  const modalTitle = document.getElementById("modal_title");
  const modalAuthor = document.getElementById("modal_author");
  const modalSummary = document.getElementById("modal_summary");
  const aboutList = document.getElementById("about_list");
  const modalDetails = document.getElementById("modal_details");
  const modalReviews = document.getElementById("modal_reviews");

  if (!booksContainer || !categoryFilter || !authorFilter || !searchInput || !bookModal) return;

  function toKey(value) {
    return (value ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]+/g, " ")    
      .replace(/\s+/g, " ")           
      .trim();
  }

  initializeFilters();
  renderBooks(books);
  setupEventListeners();

  function initializeFilters() {
    const uniqueCategories = [...new Set(books.map((b) => toKey(b.category)).filter(Boolean))].sort();
    const uniqueAuthors = [...new Set(books.map((b) => toKey(b.author)).filter(Boolean))].sort();

    rebuildSelect(
      categoryFilter,
      uniqueCategories.map((k) => ({
        value: k,
        label: formatLabel(k)
      }))
    );

    const authorLabelMap = new Map();
    books.forEach((b) => {
      const key = toKey(b.author);
      if (key && !authorLabelMap.has(key)) authorLabelMap.set(key, (b.author || "").trim());
    });

    rebuildSelect(
      authorFilter,
      uniqueAuthors.map((k) => ({
        value: k,
        label: authorLabelMap.get(k) || formatLabel(k)
      }))
    );
  }

  function rebuildSelect(selectEl, options) {
    selectEl.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All";
    selectEl.appendChild(allOption);

    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = opt.value;
      el.textContent = opt.label;
      selectEl.appendChild(el);
    });
  }

  function formatLabel(key) {
    if (!key) return "";
    return key
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function renderBooks(bookList) {
    booksContainer.innerHTML = "";

    if (!Array.isArray(bookList) || bookList.length === 0) {
      booksContainer.innerHTML = "<p class='no-results'>No books found.</p>";
      return;
    }

    bookList.forEach((book) => {
      const card = document.createElement("div");
      card.className = "book-card";

      card.innerHTML = `
        <img src="${book.image || ""}" alt="${book.title || "Book"}" class="book-image">
        <div class="book-content">
          <h3 class="book-title">${book.title || "Untitled"}</h3>
          <p class="book-description">${book.description || "No description available."}</p>
        </div>
      `;

      card.addEventListener("click", () => openBookModal(book));
      booksContainer.appendChild(card);
    });
  }

  function openBookModal(book) {
    if (!book) return;

    if (modalImg) {
      modalImg.src = book.image || "";
      modalImg.alt = book.title || "Book image";
    }

    if (modalTitle) modalTitle.textContent = book.title || "Untitled";
    if (modalAuthor) modalAuthor.textContent = `by ${book.author || "Unknown"}`;
    if (modalSummary) modalSummary.textContent = book.summary || "No summary available.";

    if (aboutList) {
      aboutList.innerHTML = "";
      (book.aboutAuthor || []).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        aboutList.appendChild(li);
      });
    }

    if (modalDetails) {
      modalDetails.innerHTML = `
        <tr>
          <td>${book.details?.genre ?? "N/A"}</td>
          <td>${book.details?.history ?? "N/A"}</td>
          <td>${book.details?.lessons ?? "N/A"}</td>
        </tr>
      `;
    }

    if (modalReviews) {
      const reviews = Array.isArray(book.reviews) ? book.reviews : [];

      modalReviews.innerHTML = reviews.length
        ? reviews
            .map(
              (r) => `
                <tr>
                  <td>${r.source || "Unknown"}</td>
                  <td>${r.score || "N/A"}</td>
                </tr>
              `
            )
            .join("")
        : `
            <tr>
              <td>Reader feedback</td>
              <td>N/A</td>
            </tr>
          `;
    }

    bookModal.style.display = "block";
    bookModal.setAttribute("aria-hidden", "false");
  }

  function closeBookModal() {
    bookModal.style.display = "none";
    bookModal.setAttribute("aria-hidden", "true");
  }

  function filterBooks() {
    const selectedCategory = categoryFilter.value || "all";
    const selectedAuthor = authorFilter.value || "all";
    const search = toKey(searchInput.value || "");

    const filtered = books.filter((book) => {
      const titleK = toKey(book.title);
      const authorK = toKey(book.author);
      const categoryK = toKey(book.category);

      if (selectedCategory !== "all" && categoryK !== selectedCategory) return false;
      if (selectedAuthor !== "all" && authorK !== selectedAuthor) return false;

      if (search && !titleK.includes(search) && !authorK.includes(search)) return false;

      return true;
    });

    renderBooks(filtered);
  }

  function setupEventListeners() {
    categoryFilter.addEventListener("change", filterBooks);
    authorFilter.addEventListener("change", filterBooks);
    searchInput.addEventListener("input", filterBooks);

    closeModalBtn?.addEventListener("click", closeBookModal);

    window.addEventListener("click", (event) => {
      if (event.target === bookModal) closeBookModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && bookModal.getAttribute("aria-hidden") === "false") {
        closeBookModal();
      }
    });
  }
});