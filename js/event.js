import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  addDoc,
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
  console.log("Loading popular events...");
  const eventsCol = collection(db, "events");
  const q = query(eventsCol, orderBy("start_time", "asc"), limit(6));
  const snapshot = await getDocs(q);

  const container = document.getElementById("popularEventsGrid");
  console.log("Popular events container:", container);
  if (!container) {
    console.error("Popular events container not found!");
    return;
  }
  container.innerHTML = ""; // Clear if reloaded

  if (snapshot.empty) {
    console.log("No events found in database");
    container.innerHTML = `<p class="text-gray-500">No events found.</p>`;
    return;
  }

  snapshot.forEach((doc) => {
    const event = doc.data();
    const eventId = doc.id;

    const startTimeStr = formatDateTime(event.start_time);
    const descriptionShort =
      event.description?.length > 80
        ? event.description.substring(0, 77) + "..."
        : event.description || "";

    const card = document.createElement("div");
    card.className =
      "flex items-center overflow-hidden cursor-pointer transition-all duration-300 rounded-2xl p-4";
    card.innerHTML = `
      <img src="${event.image_url}" alt="${event.name}" class="w-48 h-48 object-cover rounded-2xl flex-shrink-0 border border-[#3a3e4a]" />
      <div class="p-6 flex flex-col justify-between flex-1 min-h-[192px]">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-200 mb-3 leading-tight">${event.name}</h2>
          <p class="text-base text-gray-400 leading-relaxed mb-6 line-clamp-3">${descriptionShort}</p>
        </div>
        <div class="text-base text-gray-200 space-y-2">
          <p class="flex items-center text-gray-400">
            <i class="fa-regular fa-calendar mr-2 text-gray-200"></i>
            ${startTimeStr}
          </p>
          <p class="flex items-center text-gray-400">
            <i class="fa-solid fa-location-dot mr-2 text-gray-200"></i>
            ${event.location}
          </p>
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
          <button class="bg-transparent rounded-full text-gray-700 font-semibold hover:text-white py-2 px-6 border border-gray-400 hover:bg-gray-700 hover:border-transparent transition w-full max-w-[180px] self-start">Subscribe</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Check if current user is subscribed to a creator
async function checkSubscriptionStatus(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) return false;

  try {
    const subscriptionsRef = collection(
      db,
      "users",
      currentUser.userId,
      "creatorSubscriptions"
    );
    const q = query(
      subscriptionsRef,
      where("subscribedToUserId", "==", userId)
    );
    const existingSub = await getDocs(q);
    return !existingSub.empty;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

// Update button state based on subscription status
function updateButtonState(button, isSubscribed) {
  if (isSubscribed) {
    button.textContent = "Subscribed";
    button.classList.add(
      "bg-gradient-to-r",
      "from-[#F59275]",
      "to-[#F1647A]",
      "border-transparent"
    );
    button.classList.remove(
      "hover:bg-[#f1647a]",
      "hover:border-[#f1647a]",
      "bg-[#23243a]",
      "border-gray-400"
    );
    button.disabled = true;
  } else {
    button.textContent = "Subscribe";
    button.classList.remove(
      "bg-gradient-to-r",
      "from-[#F59275]",
      "to-[#F1647A]",
      "border-transparent"
    );
    button.classList.add(
      "bg-[#23243a]",
      "border-gray-400",
      "hover:bg-[#f1647a]",
      "hover:border-[#f1647a]"
    );
    button.disabled = false;
  }
}

// --- Featured Calendars: Show users who have created at least one event ---
async function loadFeaturedCalendars() {
  console.log("Loading featured calendars...");
  const container = document.getElementById("userCalendarsGrid");
  console.log("Featured calendars container:", container);
  if (!container) {
    console.error("Featured calendars container not found!");
    return;
  }
  container.innerHTML = "";

  // 1. Get all events, collect unique host_user_id and their profile info from event doc
  const eventsCol = collection(db, "events");
  const eventsSnap = await getDocs(eventsCol);
  const userMap = new Map();

  eventsSnap.forEach((doc) => {
    const event = doc.data();
    if (!event.host_user_id) return;

    // Only add if not already present (first event wins)
    if (!userMap.has(event.host_user_id)) {
      // Use the user object stored in the event, or fallback to individual fields
      const userInfo = event.user || {};
      const username = userInfo.username || event.username || "Anonymous User";

      // Generate avatar URL if no profile image
      const profileImg =
        userInfo.profileImg ||
        event.profileImg ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          username
        )}&background=random&size=128&color=fff`;

      // Create a better bio if none exists
      const bio =
        userInfo.bio ||
        event.bio ||
        `${username} is an active event creator in our community. Join their events to connect with fellow enthusiasts and discover amazing experiences!`;

      userMap.set(event.host_user_id, {
        username: username,
        profileImg: profileImg,
        bio: bio,
        email: userInfo.email || event.email || "",
        userId: event.host_user_id,
      });
    }
  });

  if (userMap.size === 0) {
    container.innerHTML = `<p class='text-gray-500 text-center'>No event creators found yet. Create your first event to appear here!</p>`;
    return;
  }

  // 2. Render a card for each unique user
  for (const [userId, user] of userMap) {
    const card = document.createElement("div");
    card.className =
      "flex flex-col md:flex-row items-center bg-[#23243a] rounded-2xl shadow-lg p-6 mb-6 w-full max-w-2xl mx-auto transition hover:scale-[1.025] hover:shadow-2xl duration-200 min-h-[180px] border border-[#3a3e4a] cursor-pointer";
    card.innerHTML = `
      <img src="${
        user.profileImg
      }" alt="Avatar" class="w-28 h-28 md:w-32 md:h-32 object-cover rounded-2xl mb-4 md:mb-0 md:mr-8 bg-gray-300 flex-shrink-0 border border-gray-700" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username
    )}&background=random&size=128&color=fff'" />
      <div class="flex flex-col flex-1 min-w-0">
        <h2 class="text-2xl font-bold text-white mb-1 event-name truncate">${
          user.username
        }</h2>
        <p class="text-gray-300 text-base mb-2 break-words line-clamp-3">${
          user.bio
        }</p>
        <div class="flex items-center gap-4 mb-3 flex-wrap">
          <span class="flex items-center text-gray-400 text-sm"><i class="fa-solid fa-user-group mr-2"></i> Event Creator</span>
        </div>
        <button class="subscribe-btn bg-[#23243a] border border-gray-400 rounded-full px-6 py-2 text-white font-semibold hover:bg-[#f1647a] hover:border-[#f1647a] transition w-fit mt-auto" data-user-id="${userId}" data-username="${
      user.username
    }">Subscribe</button>
      </div>
    `;

    // Add click handler for the entire card to navigate to user events
    card.addEventListener("click", (e) => {
      // Don't navigate if clicking on the subscribe button
      if (
        e.target.classList.contains("subscribe-btn") ||
        e.target.closest(".subscribe-btn")
      ) {
        return;
      }
      window.location.href = `user-events.html?id=${userId}`;
    });

    // Add click handler for subscribe button
    const subscribeBtn = card.querySelector(".subscribe-btn");
    subscribeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleSubscribe(userId, user.username);
    });

    // Check subscription status and update button state
    const isSubscribed = await checkSubscriptionStatus(userId);
    updateButtonState(subscribeBtn, isSubscribed);

    container.appendChild(card);
  }
}

// Handle subscribe functionality for event creators (Featured Calendars)
async function handleSubscribe(userId, username) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    alert("Please sign in to subscribe to event creators.");
    return;
  }

  // Prevent subscribing to yourself
  if (currentUser.userId === userId) {
    alert("You cannot subscribe to yourself!");
    return;
  }

  try {
    // Check if user is already subscribed to this creator
    const subscriptionsRef = collection(
      db,
      "users",
      currentUser.userId,
      "creatorSubscriptions"
    );
    const q = query(
      subscriptionsRef,
      where("subscribedToUserId", "==", userId)
    );
    const existingSub = await getDocs(q);

    if (!existingSub.empty) {
      alert(`You are already subscribed to ${username}!`);
      return;
    }

    // Add subscription to user's creator subscriptions collection
    await addDoc(subscriptionsRef, {
      subscribedToUserId: userId,
      subscribedToUsername: username,
      subscribedAt: new Date(),
    });

    // Also add subscriber to the creator's subscribers collection for easy querying
    const creatorSubscribersRef = collection(
      db,
      "users",
      userId,
      "subscribers"
    );
    await addDoc(creatorSubscribersRef, {
      subscriberUserId: currentUser.userId,
      subscriberUsername: currentUser.username || currentUser.email,
      subscribedAt: new Date(),
    });

    alert(`Successfully subscribed to ${username}!`);

    // Update the button to show subscribed state
    const subscribeBtn = document.querySelector(`[data-user-id="${userId}"]`);
    if (subscribeBtn) {
      updateButtonState(subscribeBtn, true);
    }
  } catch (error) {
    console.error("Error subscribing to creator:", error);
    alert("Failed to subscribe. Please try again.");
  }
}

// --- City Calendars Dynamic Events ---
function renderCityEvents(events, city) {
  const grid = document.getElementById("cityEventsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  if (!events.length) {
    grid.innerHTML = `<p class='text-gray-500'>No events found for ${city}.</p>`;
    return;
  }
  events.forEach((event) => {
    let description = event.description || "No description.";
    if (description.length > 120)
      description = description.substring(0, 117) + "...";
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
          <button class="subscribe-event-btn bg-transparent rounded-full text-gray-700 font-semibold hover:text-white py-2 px-6 border border-gray-400 hover:bg-gray-700 hover:border-transparent transition w-full max-w-[180px] self-start" data-event-id="${
            event.id || "unknown"
          }" data-event-name="${
      event.name || "Untitled Event"
    }">Subscribe</button>
        </div>
      </div>
    `;

    // Add click handler for subscribe button
    const subscribeBtn = card.querySelector(".subscribe-event-btn");
    subscribeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleSubscribe(event.id || "unknown", event.name || "Untitled Event");
    });

    grid.appendChild(card);
  });
}

async function fetchCityEvents(city) {
  const { db } = await import("../config/firebase.js");
  const { collection, getDocs, query, where } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
  );
  const eventsCol = collection(db, "events");
  const q = query(eventsCol, where("city", "==", city));
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map((doc) => doc.data());
  renderCityEvents(events, city);
}

async function fetchUnsplashCityImage(city) {
  // Unsplash API: demo endpoint (no API key needed for demo, but for production use your own key)
  const url = `https://source.unsplash.com/480x480/?${encodeURIComponent(
    city
  )},cityscape`;
  // This returns a direct image URL
  return url;
}

async function updateCityPreviews() {
  const cityCards = document.querySelectorAll("[data-city]");
  for (const card of cityCards) {
    const city = card.getAttribute("data-city");
    // Set city image from Unsplash
    const cityImg = card.querySelector(".city-bg");
    if (cityImg) cityImg.src = await fetchUnsplashCityImage(city);
    // Fetch next event for this city
    const eventsCol = collection(db, "events");
    const q = query(
      eventsCol,
      where("city", "==", city),
      orderBy("start_time", "asc"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    const previewDiv = card.querySelector(".event-preview");
    if (!previewDiv) continue;
    if (snapshot.empty) {
      previewDiv.innerHTML =
        '<span class="text-gray-200 text-xs">No events</span>';
    } else {
      const event = snapshot.docs[0].data();
      previewDiv.innerHTML = `
        <img src="${
          event.image_url || "../../src/asset/images/fea-cal-1.png"
        }" alt="Event" class="w-12 h-12 rounded-full border-2 border-white mx-auto" />
        <div class="text-xs text-white text-center mt-1 truncate max-w-[80px]">${
          event.name
        }</div>
      `;
    }
  }
}

// Main initialization function
async function initializeEventPage() {
  console.log("Initializing event page...");
  try {
    // Load popular events
    console.log("Starting to load popular events...");
    await loadPopularEvents();

    // Load featured calendars (users who have created events)
    console.log("Starting to load featured calendars...");
    if (document.getElementById("userCalendarsGrid")) {
      await loadFeaturedCalendars();
    } else {
      console.log("userCalendarsGrid container not found");
    }

    // Set up city event listeners
    document.querySelectorAll("[data-city]").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const city = card.getAttribute("data-city");
        fetchCityEvents(city);
      });
    });

    // Update city previews
    await updateCityPreviews();

    console.log("Event page initialization complete");
  } catch (error) {
    console.error("Error initializing event page:", error);
  }
}

// Single DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", initializeEventPage);
