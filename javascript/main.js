/*Preloader*/
// Shows loader briefly, then marks app as ready.
window.addEventListener("load", () => {
  const preload = document.querySelector(".preload");
  const LOADER_DURATION = 3000;

  setTimeout(() => {
    preload?.classList.add("loaded");
    document.body.classList.add("loaded");

    window.dispatchEvent(new Event("readify:loaded"));
  }, LOADER_DURATION);
});

/*HamBurger*/
// Handles mobile navigation open/close interactions.
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav_menu");
  const overlay = document.querySelector(".mobile_overlay");
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

  // Closes the mobile menu and overlay.
  function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    body.classList.remove("nav_active");
  }

  const currentPath = window.location.pathname.split("/").pop();

  // Marks the current page link as active in the menu.
  document.querySelectorAll(".menu_link").forEach(link => {
    const linkPath = link.getAttribute("href")?.split("/").pop();

    if (linkPath === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
});

/*Header*/

const header = document.querySelector(".header");

if (header) {
  // Adds sticky style once the page is scrolled.
  window.addEventListener("scroll", () => {
    header.classList.toggle("active", window.scrollY > 20);
  });
}

const quoteSwiperEl = document.querySelector(".quote-swiper");
if (quoteSwiperEl && typeof Swiper !== "undefined") {
  // Rotating quote slider.
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
}

/* Initialize Book Swiper */
const bookSwiperEl = document.querySelector(".book_swiper");
if (bookSwiperEl && typeof Swiper !== "undefined") {
  // Carousel for book cards.
  const bookSwiper = new Swiper(".book_swiper", {
    centeredSlides: true,
    slidesPerView: 3,
    grabCursor: true,
    spaceBetween: 20,
    loop: true,

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    breakpoints: {
      769: {
        spaceBetween: 40,
        slidesPerView: 3,
      },
    },
  });
}

/*Featured Swiper */
const featuredSwiperEl = document.querySelector(".featured_swiper");
if (featuredSwiperEl && typeof Swiper !== "undefined") {
  // Featured section slider with nav controls.
  const swiperFeatured = new Swiper(".featured_swiper", {
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
}

