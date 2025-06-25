window.addEventListener("components-injected", () => {
  initHeroCarousel();
});

function initHeroCarousel() {
  const carousel = document.getElementById("hero-carousel");
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-carousel-item]"));
  const dots = Array.from(
    carousel.querySelectorAll("[data-carousel-slide-to]")
  );

  if (slides.length === 0) {
    return;
  }

  let currentSlideIndex = 0;
  const interval = 2000;
  let carouselInterval;

  function showSlide(index) {
    currentSlideIndex = (index + slides.length) % slides.length;

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
      showSlide(i);
      startAutoAdvance();
    });
  });

  // Pause on hover
  carousel.addEventListener("mouseenter", () => {
    clearInterval(carouselInterval);
  });

  carousel.addEventListener("mouseleave", () => {
    startAutoAdvance();
  });

  showSlide(0);
  startAutoAdvance();
}
