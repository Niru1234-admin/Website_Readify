const books = [
    {
        id: 1,
        title: "The Brave Little Lion",
        author: "Emily Carter",
        category: "fiction",
        image: "../assets/images/book-1.png",
        description: "A heartwarming story about courage and friendship.",
        summary:
        "This story follows a young lion who learns that bravery is not about strength, but about kindness and perseverance.",
        aboutAuthor: [
        "Children's book author",
        "Writes moral-based stories",
        "10+ years of experience"
        ],
        details: {
        genre: "Fiction",
        history: "Modern children's literature",
        lessons: "Courage, kindness, self-belief"
        }
    },

    {
        id: 2,
        title: "Mysteries of the Night",
        author: "Daniel Moore",
        category: "mystery",
        image: "../assets/images/book-2.png",
        description: "A thrilling mystery that keeps readers guessing.",
        summary:
        "A detective uncovers secrets hidden in a quiet town after a series of strange events.",
        aboutAuthor: [
        "Mystery novelist",
        "Award-winning writer",
        "Loves plot twists"
        ],
        details: {
        genre: "Mystery",
        history: "Contemporary fiction",
        lessons: "Logic, observation, patience"
        }
    },

    {
        id: 3,
        title: "Learning the Solar System",
        author: "Sarah Johnson",
        category: "non-fiction",
        image: "../assets/images/book-3.png",
        description: "An easy guide to understanding space and planets.",
        summary:
        "This book introduces children to planets, stars, and galaxies using simple explanations and visuals.",
        aboutAuthor: [
        "Science educator",
        "Astronomy enthusiast",
        "Writes educational books"
        ],
        details: {
        genre: "Non-Fiction",
        history: "Educational science",
        lessons: "Curiosity, learning, exploration"
        }
    },

    {
        id: 4,
        title: "The Hidden Kingdom",
        author: "Author 1",
        category: "fantasy",
        image: "../assets/images/book-4.png",
        description: "A magical world full of adventure and mystery.",
        summary:
        "A young hero discovers a hidden kingdom and must protect it from dark forces.",
        aboutAuthor: [
        "Fantasy storyteller",
        "World-building expert",
        "Inspired by myths"
        ],
        details: {
        genre: "Fantasy",
        history: "Classic fantasy themes",
        lessons: "Responsibility, bravery, teamwork"
        }
    },

        {
        id: 5,
        title: "Think Smart",
        author: "Author 2",
        category: "non-fiction",
        image: "../assets/images/book-4.png",
        description: "Improve thinking and decision-making skills.",
        summary:
        "This book teaches simple techniques to improve focus, logic, and everyday decision-making.",
        aboutAuthor: [
        "Life coach",
        "Motivational writer",
        "Public speaker"
        ],
        details: {
        genre: "Non-Fiction",
        history: "Self-improvement",
        lessons: "Critical thinking, discipline"
        }
    }
    ];

//DOM Elements    
const booksContainer = document.getElementById("books_container");
const categoryFilter = document.getElementById("categories");
const authorFilter = document.getElementById("authors");
const searchInput = document.getElementById("search");

const bookModal = document.getElementById("book_modal");
const closeModalBtn = document.querySelector(".close_modal");

const modalImg = document.getElementById("modal_img");
const modalTitle = document.getElementById("modal_title");
const modalSummary = document.getElementById("modal_summary");
const aboutList = document.getElementById("about_list");
const modalDetails = document.getElementById("modal_details");


// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
  renderBooks(books);
  setupEventListeners();
});


// ======================
// RENDER BOOKS
// ======================
function renderBooks(bookList) {
  if (!booksContainer) return;

  booksContainer.innerHTML = "";

  if (bookList.length === 0) {
    booksContainer.innerHTML = "<p class='no-results'>No books found.</p>";
    return;
  }

  bookList.forEach(book => {
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


// ======================
// OPEN MODAL
// ======================
function openBookModal(book) {
  if (!bookModal) return;

  modalImg.src = book.image;
  modalTitle.textContent = book.title;
  modalSummary.textContent = book.summary;

  // About Author
  aboutList.innerHTML = "";
  book.aboutAuthor.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    aboutList.appendChild(li);
  });

  // Details Table
  modalDetails.innerHTML = `
    <tr>
      <td>${book.details.genre}</td>
      <td>${book.details.history}</td>
      <td>${book.details.lessons}</td>
    </tr>
  `;

  bookModal.style.display = "block";
  bookModal.setAttribute("aria-hidden", "false");
}


// ======================
// FILTER LOGIC
// ======================
function filterBooks() {
  const category = categoryFilter.value;
  const author = authorFilter.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  let filteredBooks = books;

  // Category filter
  if (category !== "all") {
    filteredBooks = filteredBooks.filter(
      book => book.category === category
    );
  }

  // Author filter
  if (author !== "all") {
    filteredBooks = filteredBooks.filter(
      book => book.author.toLowerCase() === author
    );
  }

  // Search filter
  if (search) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search)
    );
  }

  renderBooks(filteredBooks);
}


// ======================
// EVENTS
// ======================
function setupEventListeners() {
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterBooks);
  }

  if (authorFilter) {
    authorFilter.addEventListener("change", filterBooks);
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterBooks);
  }

  // Close modal (button)
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      bookModal.style.display = "none";
      bookModal.setAttribute("aria-hidden", "true");
    });
  }

  // Close modal (outside click)
  window.addEventListener("click", e => {
    if (e.target === bookModal) {
      bookModal.style.display = "none";
    }
  });
}