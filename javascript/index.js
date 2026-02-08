const AUTHORS_OF_DAY = [
  {
    name: "J.K. Rowling",
    img: "assets/author/author1.jpg",
    bio: "Creator of Harry Potter. Known for magical world-building, friendships, and adventure stories."
  },
  {
    name: "Paulo Coelho",
    img: "assets/author/author2.jpg",
    bio: "Brazilian novelist best known for The Alchemist, focusing on destiny, purpose, and self-discovery."
  },
  {
    name: "George R.R. Martin",
    img: "assets/author/author3.jpg",
    bio: "Epic fantasy writer famous for complex characters, political intrigue, and rich world-building."
  },
  {
    name: "Agatha Christie",
    img: "assets/author/author4.jpg",
    bio: "Queen of crime fiction, known for ingenious mystery plots and iconic detectives."
  },
  {
    name: "J.R.R. Tolkien",
    img: "assets/author/author5.jpg",
    bio: "Fantasy legend and creator of Middle-earth, blending mythology, language, and adventure."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("authorName");
  const bioEl = document.getElementById("authorBio");
  const imgEl = document.getElementById("authorImg");

  // Run only if Author of the Day section exists
  if (!nameEl || !bioEl || !imgEl) return;

  // Get a stable daily index (same author all day)
  const today = new Date();
  const daySeed =
    today.getFullYear() * 1000 +
    (today.getMonth() + 1) * 50 +
    today.getDate();

  const index = daySeed % AUTHORS_OF_DAY.length;
  const author = AUTHORS_OF_DAY[index];

  // Inject data
  nameEl.textContent = author.name;
  bioEl.textContent = author.bio;
  imgEl.src = author.img;
  imgEl.alt = author.name;
});
