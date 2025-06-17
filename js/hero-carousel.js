// Wait for components to be injected before initializing carousel
window.addEventListener("components-injected", () => {
  console.log("Components injected, initializing hero carousel");
  initHeroCarousel();
});

function initHeroCarousel() {
  const carousel = document.getElementById("hero-carousel");
  if (!carousel) {
    console.warn("Hero carousel element not found");
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-carousel-item]"));
  const dots = Array.from(
    carousel.querySelectorAll("[data-carousel-slide-to]")
  );

  if (slides.length === 0) {
    console.warn("No carousel slides found");
    return;
  }

  console.log(`Found ${slides.length} slides and ${dots.length} dots`);

  let currentSlideIndex = 0;
  const interval = 2000; 
  let carouselInterval;

  function showSlide(index) {
    // Ensure index wraps around
    currentSlideIndex = (index + slides.length) % slides.length;

    console.log(`Showing slide ${currentSlideIndex}`);

    // For absolute positioned slides, toggle the hidden class
    slides.forEach((slide, i) => {
      if (i === currentSlideIndex) {
        slide.classList.remove("hidden");
      } else {
        slide.classList.add("hidden");
      }
    });

    // Update the dots
    dots.forEach((dot, i) => {
      if (i === currentSlideIndex) {
        dot.classList.add("bg-gray-800");
        dot.classList.remove("bg-gray-400");
        dot.setAttribute("aria-current", "true");
      } else {
        dot.classList.add("bg-gray-400");
        dot.classList.remove("bg-gray-800");
        dot.setAttribute("aria-current", "false");
      }
    });
  }

  function startAutoAdvance() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, interval);
  }

  // Set up dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      console.log(`Dot ${i} clicked`);
      showSlide(i);
      startAutoAdvance();
    });
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", () => {
    console.log("Mouse entered carousel - pausing");
    clearInterval(carouselInterval);
  });

  carousel.addEventListener("mouseleave", () => {
    console.log("Mouse left carousel - resuming");
    startAutoAdvance();
  });

  // Initialize the carousel
  console.log("Initializing hero carousel");
  showSlide(0);
  startAutoAdvance();
}
