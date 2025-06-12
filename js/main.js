const events = [
  {
    day: "Today Sunday",
    entries: [
      {
        time: "08:00 PM",
        title: "Jazzopoly Board Game Night",
        host: "Kevin McMillan",
        location: "Langara College B Building",
        attendees: "2259 Ava, Sarah, and 28 others",
      },
    ],
  },
  // Add other days similarly
];

const container = document.getElementById("events");

events.forEach((group) => {
  const dayBlock = document.createElement("div");
  dayBlock.innerHTML = `
    <p class="text-sm font-medium text-gray-600 mb-3">${group.day}</p>
    ${group.entries
      .map(
        (event) => `
      <div class="bg-white p-4 rounded shadow flex justify-between items-center mb-4">
        <div>
          <p class="text-sm text-gray-700">${event.time}</p>
          <p class="font-semibold">${event.title}</p>
          <p class="text-sm text-gray-500">by ${event.host}</p>
          <p class="text-sm text-gray-500">${event.location}</p>
          <p class="text-xs text-gray-400">${event.attendees}</p>
        </div>
        <div class="w-28 h-16 bg-gray-200 rounded"></div>
      </div>
    `
      )
      .join("")}
  `;
  container.appendChild(dayBlock);
});

import { seedFirestore } from "./seed/seed.js";

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
    const clickedInside =
      toggleBtn.contains(e.target) || searchInput.contains(e.target);
    if (!clickedInside) {
      searchInput.classList.add("hidden");
    }
  });
}

// Move seedBtn event listener setup to the components-injected event
function setupSeedButton() {
  const btn = document.getElementById("seedBtn");
  const status = document.getElementById("status");

  if (btn && status) {
    console.log("Seed button found, setting up event listener");
    btn.addEventListener("click", () => {
      console.log("Seed button clicked");
      alert("Seeding started!"); // Show the alert immediately
      seedFirestore(status);
    });
  } else {
    console.warn("Seed button or status element not found");
  }
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
    slidesContainer.style.transition = animate
      ? "transform 300ms ease"
      : "none";
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
  console.log("Components injected event fired");
  setupSearchToggle();
  setupSeedButton(); // Set up the seed button after components are injected

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

  //Initializing games page swiper
  if (document.querySelector(".swiper")) {
    new Swiper(".swiper", {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 20,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
        },
        1024: {
          slidesPerView: 1,
        },
      },
    });
  }
});
