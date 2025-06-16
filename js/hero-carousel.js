document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("hero-carousel");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-item]"));
  const dots = Array.from(
    carousel.querySelectorAll("[data-carousel-slide-to]")
  );

  let currentSlideIndex = 0;
  const autoAdvanceInterval = 5000; // 5 seconds
  let carouselInterval; // Declare it here to be accessible by start/stop functions

  // Function to show a specific slide
  function showSlide(index) {
    // Ensure index wraps around for continuous loop
    currentSlideIndex = (index + slides.length) % slides.length;

    // Hide all slides and reset dot styles
    slides.forEach((slide) => slide.classList.add("hidden"));
    dots.forEach((dot) => {
      dot.classList.replace("bg-gray-800", "bg-gray-400");
      dot.setAttribute("aria-current", "false");
    });

    // Show the selected slide and update dot style
    slides[currentSlideIndex].classList.remove("hidden");
    dots[currentSlideIndex].classList.replace("bg-gray-400", "bg-gray-800");
    dots[currentSlideIndex].setAttribute("aria-current", "true");
  }

  // Function to start the auto-advance
  function startAutoAdvance() {
    clearInterval(carouselInterval); // Clear any existing interval first
    carouselInterval = setInterval(() => {
      showSlide(currentSlideIndex + 1);
    }, autoAdvanceInterval);
  }

  // Event listeners for dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoAdvance(); // Restart timer after manual navigation
    });
  });

  // Pause carousel on hover
  carousel.addEventListener("mouseenter", () => {
    clearInterval(carouselInterval);
  });

  carousel.addEventListener("mouseleave", () => {
    startAutoAdvance();
  });

  // Initialize the first slide and start auto-advance
  showSlide(currentSlideIndex);
  startAutoAdvance();
});
