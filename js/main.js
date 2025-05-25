const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarOverlay = document.getElementById("sidebar-overlay");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
  sidebarOverlay.classList.remove("hidden");
  setTimeout(() => sidebarOverlay.classList.add("opacity-00"), 10);
});

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  sidebarOverlay.classList.add("hidden");
  sidebarOverlay.classList.remove("opacity-100");
}

sidebarOverlay.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});

document.addEventListener("DOMContentLoaded", function () {
  const slidesContainer = document.getElementById("hero-slides");
  const carousel = document.getElementById("hero-carousel");
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));

  if (!slidesContainer || !carousel) return;

  let slides = Array.from(slidesContainer.children);
  const totalSlides = slides.length;

  let currentIndex = 0;
  let slideInterval;
  let width = 0;

  // Clone first slide and append
  const clone = slides[0].cloneNode(true);
  slidesContainer.appendChild(clone);

  function setupCarousel() {
    width = carousel.clientWidth;

    slides = Array.from(slidesContainer.children);
    slidesContainer.style.width = `${width * slides.length}px`;

    slides.forEach((slide) => {
      slide.style.width = `${width}px`;
    });

    updateCarousel();
  }

  function updateCarousel(animate = true) {
    if (!animate) {
      slidesContainer.style.transition = "none";
    } else {
      slidesContainer.style.transition = "transform 300ms ease";
    }

    slidesContainer.style.transform = `translateX(-${currentIndex * width}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-gray-800", i === currentIndex % totalSlides);
      dot.classList.toggle("bg-gray-400", i !== currentIndex % totalSlides);
    });
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel(true);

    // If we're on the cloned slide, reset immediately after animation ends
    if (currentIndex === slides.length - 1) {
      setTimeout(() => {
        currentIndex = 0;
        updateCarousel(false); // instant jump back to real first slide
      }, 300); // match transition duration
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel(true);
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(nextSlide, 2500);
  }

  function stopSlideShow() {
    clearInterval(slideInterval);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.slideTo);
      goToSlide(index);
      stopSlideShow();
      startSlideShow();
    });
  });

  window.addEventListener("resize", setupCarousel);
  carousel.addEventListener("mouseenter", stopSlideShow);
  carousel.addEventListener("mouseleave", startSlideShow);

  setupCarousel();
  startSlideShow();
});
