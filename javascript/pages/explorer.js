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

  if (!booksContainer || !categoryFilter || !authorFilter || !searchInput || !bookModal) return;

  renderBooks(books);
  setupEventListeners();

  function renderBooks(bookList) {
    booksContainer.innerHTML = "";

    if (!bookList || bookList.length === 0) {
      booksContainer.innerHTML = "<p class='no-results'>No books found.</p>";
      return;
    }

    bookList.forEach((book) => {
      const card = document.createElement("div");
      card.className = "book-card";

      card.innerHTML = `
        <img src="${book.image}" alt="${book.title}" class="book-image">
        <div class="book-content">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-description">${book.description}</p>
        </div>
      `;

      card.addEventListener("click", () => openBookModal(book));
      booksContainer.appendChild(card);
    });
  }

  function openBookModal(book) {
    modalImg.src = book.image;
    modalTitle.textContent = book.title;
    if (modalAuthor) modalAuthor.textContent = `by ${book.author || "Unknown"}`;
    modalSummary.textContent = book.summary || "";

    aboutList.innerHTML = "";
    (book.aboutAuthor || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      aboutList.appendChild(li);
    });

    modalDetails.innerHTML = `
      <tr>
        <td>${book.details?.genre ?? ""}</td>
        <td>${book.details?.history ?? ""}</td>
        <td>${book.details?.lessons ?? ""}</td>
      </tr>
    `;

    bookModal.style.display = "block";
    bookModal.setAttribute("aria-hidden", "false");
  }

  function filterBooks() {
    const category = categoryFilter.value;
    const author = authorFilter.value.toLowerCase();
    const search = searchInput.value.toLowerCase();

    let filteredBooks = books;

    if (category !== "all") {
      filteredBooks = filteredBooks.filter((b) => b.category === category);
    }

    if (author !== "all") {
      filteredBooks = filteredBooks.filter((b) => (b.author || "").toLowerCase() === author);
    }

    if (search) {
      filteredBooks = filteredBooks.filter((b) => {
        const t = (b.title || "").toLowerCase();
        const a = (b.author || "").toLowerCase();
        return t.includes(search) || a.includes(search);
      });
    }

    renderBooks(filteredBooks);
  }

  function setupEventListeners() {
    categoryFilter.addEventListener("change", filterBooks);
    authorFilter.addEventListener("change", filterBooks);
    searchInput.addEventListener("input", filterBooks);

    closeModalBtn?.addEventListener("click", () => {
      bookModal.style.display = "none";
      bookModal.setAttribute("aria-hidden", "true");
    });

    window.addEventListener("click", (e) => {
      if (e.target === bookModal) {
        bookModal.style.display = "none";
        bookModal.setAttribute("aria-hidden", "true");
      }
    });
  }
});
