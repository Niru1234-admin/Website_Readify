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

/*Header*/

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  header.classList.toggle("active", window.scrollY > 20);
});
