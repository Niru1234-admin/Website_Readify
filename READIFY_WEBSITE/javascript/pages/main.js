window.addEventListener("load", () => {
    const preload = document.querySelector(".preload");

    // how long the loader stays visible (milliseconds)
    const LOADER_DURATION = 3000; // 3 seconds

    setTimeout(() => {
        preload.classList.add("loaded");
        document.body.classList.add("loaded");
    }, LOADER_DURATION);
});

document.addEventListener('DOMContentLoaded', () => {
   const hamburger = document.querySelector('.hamburger');
   const navMenu = document.querySelector('.nav_menu');
   const body = document.body;

   hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      body.classList.toggle('nav_active');  // Locks scroll if needed (from your CSS: body.nav_active {overflow: hidden;})
   });

   // Close menu when clicking a link (optional, for better UX)
   document.querySelectorAll('.menu_link').forEach(link => {
      link.addEventListener('click', () => {
         hamburger.classList.remove('active');
         navMenu.classList.remove('active');
         body.classList.remove('nav_active');
      });
   });

   // Close menu when clicking outside (optional)
   document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
         hamburger.classList.remove('active');
         navMenu.classList.remove('active');
         body.classList.remove('nav_active');
      }
   });
});

