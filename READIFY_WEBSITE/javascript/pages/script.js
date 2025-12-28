
document.addEventListener('DOMContentLoaded', () => {
   const userIcon = document.querySelector('.ri-user-line');
   const loginModal = document.getElementById('login-content');
   const loginClose = document.querySelector('.login-close');
   const loginOverlay = document.querySelector('.login-overlay');
   const loginForm = document.querySelector('.login-form');

   // Show modal on user icon click
   userIcon.addEventListener('click', () => {
      loginModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock scroll (using your existing class)
   });

   // Close modal on close icon click
   loginClose.addEventListener('click', closeModal);

   // Close modal on overlay click
   loginOverlay.addEventListener('click', closeModal);

   // Close on Escape key (optional for accessibility)
   document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && loginModal.classList.contains('active')) {
         closeModal();
      }
   });

   // Handle form submission (placeholder—add real logic here)
   loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Login submitted! (Add real authentication here)');
      closeModal();
   });

   function closeModal() {
      loginModal.classList.remove('active');
      document.body.style.overflow = "";
;

   }

});


const quoteSwiper = new Swiper(".quote-swiper", {
  loop: true,
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  speed: 800,
  allowTouchMove: false,
});

const bookSwiper = new Swiper(".book-swiper", {
  loop: true,
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  spaceBetween: 30,

  autoplay: {
    delay: 2800,
    disableOnInteraction: false,
  },

  speed: 900,
});


