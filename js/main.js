function setupSearchToggle() {
  const toggleBtn = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");

  if (!toggleBtn || !searchInput) return;

  toggleBtn.addEventListener("click", () => {
    searchInput.classList.toggle("hidden");
    if (!searchInput.classList.contains("hidden")) {
      searchInput.focus();
    }
  });

  document.addEventListener("click", (e) => {
    const clickedInside = toggleBtn.contains(e.target) || searchInput.contains(e.target);
    if (!clickedInside) {
      searchInput.classList.add("hidden");
    }
  });
}


function initCarousel() {
  const slidesContainer = document.getElementById("hero-slides");
  const carousel = document.getElementById("hero-carousel");
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));

  if (!slidesContainer || !carousel) return;

  let slides = Array.from(slidesContainer.children);
  const totalSlides = slides.length;

  let currentIndex = 0;
  let slideInterval;
  let width = 0;

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
    slidesContainer.style.transition = animate ? "transform 300ms ease" : "none";
    slidesContainer.style.transform = `translateX(-${currentIndex * width}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-gray-800", i === currentIndex % totalSlides);
      dot.classList.toggle("bg-gray-400", i !== currentIndex % totalSlides);
    });
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel(true);

    if (currentIndex === slides.length - 1) {
      setTimeout(() => {
        currentIndex = 0;
        updateCarousel(false);
      }, 300);
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel(true);
  }

  function startSlideShow() {
    clearInterval(slideInterval);
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
}

window.addEventListener("components-injected", () => {
  setupSearchToggle();

  const heroContainer = document.querySelector('[data-component="hero"]');
  if (heroContainer?.children.length > 0) {
    initCarousel();
  } else {
    const observer = new MutationObserver(() => {
      if (heroContainer?.children.length > 0) {
        initCarousel();
        observer.disconnect();
      }
    });

    observer.observe(heroContainer, { childList: true });
  }
});
