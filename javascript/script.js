
// Controls login modal open/close behavior and form submission.
document.addEventListener('DOMContentLoaded', () => {
   const userIcon = document.querySelector('.ri-user-line');
   const loginModal = document.getElementById('login_content');
   const loginClose = document.querySelector('.login_close');
   const loginOverlay = document.querySelector('.login_overlay');
   const loginForm = document.querySelector('.login_form');

   if (!userIcon || !loginModal || !loginClose || !loginOverlay || !loginForm) {
      return;
   }

   userIcon.addEventListener('click', () => {
      loginModal.classList.add('active');
      document.body.style.overflow = 'hidden';
   });

   loginClose.addEventListener('click', closeModal);

   loginOverlay.addEventListener('click', closeModal);

   document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && loginModal.classList.contains('active')) {
         closeModal();
      }
   });

   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Login submitted! (Add real authentication here)');
      closeModal();
   });

   // Hides the login dialog and restores page scrolling.
   function closeModal() {
      loginModal.classList.remove('active');
      document.body.style.overflow = '';
   }
});

// Smooth scroll 
(() => {
  "use strict";

  // Normalized event binding helper for single elements and collections.
  const addEvent = (elem, type, callback) => {
    if (!elem || !type || !callback) return;
    if (typeof addEventOnElem === "function") {
      addEventOnElem(elem, type, callback);
      return;
    }
    if (Array.isArray(elem)) {
      elem.forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    if (typeof NodeList !== "undefined" && elem instanceof NodeList) {
      elem.forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    if (typeof HTMLCollection !== "undefined" && elem instanceof HTMLCollection) {
      Array.from(elem).forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    elem.addEventListener(type, callback);
  };

  // Adds smooth scrolling for on-page anchor links.
  const initSmoothScroll = () => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors || anchors.length === 0) return;

    const header = document.querySelector(".header");
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav_menu");
    const overlay = document.querySelector(".mobile_overlay");

    // Closes mobile nav when a section link is used.
    const closeNav = () => {
      if (!hamburger || !navMenu || !overlay) return;
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("nav_active");
    };

    // Scroll to target while accounting for fixed header height.
    const onAnchorClick = (e) => {
      const link = e.currentTarget;
      const href = link?.getAttribute("href");
      if (!href || href === "#") return;

      const targetId = href.slice(1);
      if (!targetId) return;

      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const buffer = 12;
      const top =
        targetEl.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        buffer;

      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      closeNav();
    };

    addEvent(anchors, "click", onAnchorClick);
  };

  // Start once DOM is ready.
  if (document.readyState === "loading") {
    addEvent(document, "DOMContentLoaded", initSmoothScroll);
  } else {
    initSmoothScroll();
  }
})();


// Reveal-on-scroll animations
(() => {
  "use strict";

  const selector = [
    "[data-reveal]",
    ".section",
    ".author_card",
    ".feature_item",
    ".book-card",
    ".tracker_card",
    ".feedback_card",
    ".faq_item"
  ].join(", ");

  // Exclude overlays/modals from reveal animation rules.
  const excludedSelector = [
    ".header",
    ".nav_menu",
    ".mobile_overlay",
    ".login",
    ".login_modal",
    ".login_overlay",
    "#gameModal",
    "#gameModalOverlay",
    "#book_modal"
  ].join(", ");

  // Shared event helper used for reveal listeners.
  const addEvent = (elem, type, callback) => {
    if (!elem || !type || !callback) return;
    if (typeof addEventOnElem === "function") {
      addEventOnElem(elem, type, callback);
      return;
    }
    if (Array.isArray(elem)) {
      elem.forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    if (typeof NodeList !== "undefined" && elem instanceof NodeList) {
      elem.forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    if (typeof HTMLCollection !== "undefined" && elem instanceof HTMLCollection) {
      Array.from(elem).forEach((el) => el?.addEventListener(type, callback));
      return;
    }
    elem.addEventListener(type, callback);
  };

  // Skip animation for elements inside excluded containers.
  const shouldSkip = (el) => el?.closest(excludedSelector);

  // Adds .active to elements once they enter the viewport.
  const reveal = () => {
    const items = document.querySelectorAll(selector);
    if (!items || items.length === 0) return;

    const trigger = window.innerHeight * 0.85;
    items.forEach((el) => {
      if (!el || el.classList.contains("active")) return;
      if (shouldSkip(el)) return;

      const rect = el.getBoundingClientRect();
      if (rect.top <= trigger) el.classList.add("active");
    });
  };

  // Throttle scroll work with requestAnimationFrame.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      reveal();
      ticking = false;
    });
  };

  // Initial reveal pass and scroll listener binding.
  const initReveal = () => {
    reveal();
    addEvent(window, "scroll", onScroll);
  };

  // Start once DOM is ready.
  if (document.readyState === "loading") {
    addEvent(document, "DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
})();
