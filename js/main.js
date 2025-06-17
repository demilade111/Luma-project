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

function setupSeedButton() {
  const btn = document.getElementById("seedBtn");
  const status = document.getElementById("status");

  if (btn && status) {
    console.log("Seed button found, setting up event listener");
    btn.addEventListener("click", () => {
      console.log("Seed button clicked");
      alert("Seeding started!");
      seedFirestore(status);
    });
  } else {
    console.warn("Seed button or status element not found");
  }
}

window.addEventListener("components-injected", () => {
  console.log("Components injected event fired");
  setupSearchToggle();
  setupSeedButton();

  // Initialize games page swiper
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
