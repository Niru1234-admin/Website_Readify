/*Preloader*/
window.addEventListener("load", () => {
    const preload = document.querySelector(".preload");

    // how long the loader stays visible (milliseconds)
    const LOADER_DURATION = 3000; // 3 seconds

    setTimeout(() => {
        preload.classList.add("loaded");
        document.body.classList.add("loaded");
    }, LOADER_DURATION);
});

/*HamBurger*/
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav_menu");
  const overlay = document.querySelector(".mobile-overlay");
  const body = document.body;

  if (!hamburger || !navMenu || !overlay) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    body.classList.toggle("nav_active");
  });

  overlay.addEventListener("click", closeMenu);

  document.querySelectorAll(".menu_link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.classList.remove("nav_active");
  }
});

/*Header*/

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  header.classList.toggle("active", window.scrollY > 20);
});

new Swiper('.quote-swiper', {
  loop: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  autoHeight: true,   
  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },
});

/* Initialize Book Swiper */
new Swiper(".book_swiper", {
  centeredSlides: "auto",
  slidesPerView: "auto",
  grabCursor: true,
  spaceBetween: -25,
  loop: true,

  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },

  breakpoints: {
    1220: {
      spaceBetween: -32,
    },
  },
});

/*Featured Swiper */
let swiperFeatured = new Swiper(".featured_swiper", {
  loop: true,
  spaceBetween: 20,
  grabCursor: true,
  slidesPerView: "auto",
  centeredSlides: "auto",
  speed: 600,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    1150: {
      slidesPerView: 3,
      centeredSlides: false,
    },
  },
});
