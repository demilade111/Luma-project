document.addEventListener("DOMContentLoaded", () => {
  const slidesWrapper = document.getElementById("hero-slides");
  const carousel = document.getElementById("hero-carousel");
  const dots = document.querySelectorAll(".carousel-dot");

  if (!slidesWrapper || !carousel || dots.length === 0) return;

  let currentIndex = 0;
  let width = 0;
  let intervalId;

  // Clone the first slide and append for seamless looping
  const firstSlideClone = slidesWrapper.children[0].cloneNode(true);
  slidesWrapper.appendChild(firstSlideClone);

  function updateSlideSizes() {
    width = carousel.clientWidth;

    Array.from(slidesWrapper.children).forEach((slide) => {
      slide.style.width = `${width}px`;
      slide.style.flexShrink = "0";
    });

    slidesWrapper.style.width = `${width * slidesWrapper.children.length}px`;
    updateCarousel(false);
  }

  function updateCarousel(animate = true) {
    slidesWrapper.style.transition = animate ? "transform 500ms ease" : "none";
    slidesWrapper.style.transform = `translateX(-${currentIndex * width}px)`;

    const activeDot = currentIndex % dots.length;

    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-gray-800", i === activeDot);
      dot.classList.toggle("bg-gray-400", i !== activeDot);
    });
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel(true);


    if (currentIndex === slidesWrapper.children.length - 1) {
      setTimeout(() => {
        currentIndex = 0;
        updateCarousel(false);
      }, 500); 
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel(true);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(nextSlide, 3500);
  }

  function stopAutoplay() {
    clearInterval(intervalId);
  }


  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.dataset.slideTo, 10);
      if (!isNaN(index)) {
        goToSlide(index);
        startAutoplay();
      }
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  window.addEventListener("resize", updateSlideSizes);

  // Initial setup
  updateSlideSizes();
  startAutoplay();
});
