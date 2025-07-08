import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCurrentUser } from "./auth/authGuard.js";

// Format Firestore Timestamp to readable string
function formatDateTime(timestamp) {
  const date = timestamp.toDate();
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return date.toLocaleString(undefined, options);
}

async function loadPopularEvents() {
  const eventsCol = collection(db, "events");
  const q = query(eventsCol, orderBy("start_time", "asc"), limit(6));
  const snapshot = await getDocs(q);

  const container = document.getElementById("popularEventsGrid");
  container.innerHTML = ""; // Clear if reloaded

  if (snapshot.empty) {
    container.innerHTML = `<p class="text-gray-500">No events found.</p>`;
    return;
  }

  snapshot.forEach((doc) => {
    const event = doc.data();
    const eventId = doc.id;

    const startTimeStr = formatDateTime(event.start_time);
    const descriptionShort =
      event.description?.length > 200
        ? event.description.substring(0, 197) + "..."
        : event.description || "";

    const card = document.createElement("div");
    card.className =
      "flex items-center overflow-hidden cursor-pointer hover:bg-[#23283a] transition";
    card.innerHTML = `
      <img src="${event.image_url}" alt="${event.name}" class="w-48 h-48 border-[0.5px] object-cover rounded-2xl" />
      <div class="p-4 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-100 mb-1">${event.name}</h2>
          <p class="text-base text-gray-400 mb-3">${descriptionShort}</p>
        </div>
        <div class="text-base text-gray-200 space-y-1">
          <p>${startTimeStr}</p>
          <p>${event.location}</p>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `post-event-details.html?id=${eventId}`;
    });
    container.appendChild(card);
  });
}

async function loadUserCalendars() {
  const user = getCurrentUser();
  const container = document.getElementById("userCalendarsGrid");
  if (!container) return;
  container.innerHTML = "";
  if (!user || !user.userId) {
    container.innerHTML = `<p class='text-gray-500'>Sign in to see your calendar events.</p>`;
    return;
  }
  const calendarCol = collection(db, "users", user.userId, "calendar");
  const snapshot = await getDocs(calendarCol);
  if (snapshot.empty) {
    container.innerHTML = `<p class='text-gray-500'>No events in your calendar yet.</p>`;
    return;
  }
  snapshot.forEach((doc) => {
    const event = doc.data();
    // Truncate description if too long
    let description = event.description || "No description.";
    if (description.length > 120) {
      description = description.substring(0, 117) + "...";
    }
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-2xl p-5 overflow-hidden w-full shadow flex flex-col";
    card.innerHTML = `
      <h2 class="text-2xl font-bold mb-4 text-[#3F434E]">${
        event.name || "Untitled Event"
      }</h2>
      <div class="flex items-center gap-6 flex-1">
        <img src="${
          event.image_url || "../../src/asset/images/fea-cal-1.png"
        }" alt="Card Image" class="w-40 h-40 object-cover rounded-2xl border border-gray-200" />
        <div class="flex flex-col justify-center flex-1 h-full">
          <p class="text-lg text-gray-600 mb-6 line-clamp-4">${description}</p>
          <button class="bg-transparent rounded-full text-gray-700 font-semibold hover:text-white py-2 px-6 border border-gray-400 hover:bg-gray-700 hover:border-transparent transition w-full max-w-[180px] self-start">
            Subscribe
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Load on page ready
document.addEventListener("DOMContentLoaded", () => {
  loadPopularEvents().catch((err) => {
    console.error("Failed to load events:", err);
  });
  // Load user calendars if the section exists
  if (document.getElementById("userCalendarsGrid")) {
    loadUserCalendars().catch((err) => {
      console.error("Failed to load user calendars:", err);
    });
  }
});

// --- City Calendars Dynamic Events ---
function renderCityEvents(events, city) {
  const grid = document.getElementById('cityEventsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!events.length) {
    grid.innerHTML = `<p class='text-gray-500'>No events found for ${city}.</p>`;
    return;
  }
  events.forEach(event => {
    let description = event.description || 'No description.';
    if (description.length > 120) description = description.substring(0, 117) + '...';
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-5 overflow-hidden w-full shadow flex flex-col';
    card.innerHTML = `
      <h2 class="text-2xl font-bold mb-4 text-[#3F434E]">${event.name || 'Untitled Event'}</h2>
      <div class="flex items-center gap-6 flex-1">
        <img src="${event.image_url || '../../src/asset/images/fea-cal-1.png'}" alt="Card Image" class="w-40 h-40 object-cover rounded-2xl border border-gray-200" />
        <div class="flex flex-col justify-center flex-1 h-full">
          <p class="text-lg text-gray-600 mb-6 line-clamp-4">${description}</p>
          <button class="bg-transparent rounded-full text-gray-700 font-semibold hover:text-white py-2 px-6 border border-gray-400 hover:bg-gray-700 hover:border-transparent transition w-full max-w-[180px] self-start">Subscribe</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function fetchCityEvents(city) {
  const { db } = await import('../config/firebase.js');
  const { collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const eventsCol = collection(db, 'events');
  const q = query(eventsCol, where('city', '==', city));
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map(doc => doc.data());
  renderCityEvents(events, city);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-city]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const city = card.getAttribute('data-city');
      fetchCityEvents(city);
    });
  });
});

async function fetchUnsplashCityImage(city) {
  // Unsplash API: demo endpoint (no API key needed for demo, but for production use your own key)
  const url = `https://source.unsplash.com/480x480/?${encodeURIComponent(city)},cityscape`;
  // This returns a direct image URL
  return url;
}

async function updateCityPreviews() {
  const cityCards = document.querySelectorAll('[data-city]');
  for (const card of cityCards) {
    const city = card.getAttribute('data-city');
    // Set city image from Unsplash
    const cityImg = card.querySelector('.city-bg');
    if (cityImg) cityImg.src = await fetchUnsplashCityImage(city);
    // Fetch next event for this city
    const eventsCol = collection(db, 'events');
    const q = query(eventsCol, where('city', '==', city), orderBy('start_time', 'asc'), limit(1));
    const snapshot = await getDocs(q);
    const previewDiv = card.querySelector('.event-preview');
    if (!previewDiv) continue;
    if (snapshot.empty) {
      previewDiv.innerHTML = '<span class="text-gray-200 text-xs">No events</span>';
    } else {
      const event = snapshot.docs[0].data();
      previewDiv.innerHTML = `
        <img src="${event.image_url || '../../src/asset/images/fea-cal-1.png'}" alt="Event" class="w-12 h-12 rounded-full border-2 border-white mx-auto" />
        <div class="text-xs text-white text-center mt-1 truncate max-w-[80px]">${event.name}</div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCityPreviews();
  // ... existing code ...
});
