import { db } from "../config/firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Format Firestore Timestamp to readable string
function formatDateTime(timestamp) {
    const date = timestamp.toDate();
    const options = { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
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

        const startTimeStr = formatDateTime(event.start_time);
        const descriptionShort = event.description?.length > 200
            ? event.description.substring(0, 197) + "..."
            : event.description || "";

        const card = document.createElement("div");
        card.className = "flex items-center overflow-hidden";

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
        container.appendChild(card);
    });
}

// Load on page ready
document.addEventListener("DOMContentLoaded", () => {
    loadPopularEvents().catch((err) => {
        console.error("Failed to load events:", err);
    });
});
