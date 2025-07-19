import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCurrentUser } from "./auth/authGuard.js";

// Get user ID from URL parameters
function getUserIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");

  return userId;
}

// Format Firestore Timestamp to readable string
function formatDateTime(timestamp) {
  const date = timestamp.toDate();
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleString(undefined, options);
}

// Load user information
async function loadUserInfo(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      const getEmail = (email) => {
        if (!email) return "";
        const [localPart, domain] = email.split("@");
        return `${localPart}`;
      };

      const userInfo = {
        id: userId,
        username: userData.username || getEmail(userData.email),
        email: userData.email || "",
        bio:
          userData.bio ||
          `${
            userData.username || getEmail(userData.email)
          } is an active event creator in our community. Join their events to connect with fellow enthusiasts and discover amazing experiences!`,
        profileImg:
          userData.profileImg ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.username || getEmail(userData.email)
          )}&background=random&size=128&color=fff`,
      };

      console.log("Processed user info from Firestore:", userInfo);
      return userInfo;
    } else {
      console.log(
        "User document not found in Firestore, trying to get info from events..."
      );

      // Fallback: Get user info from their events
      const eventsCol = collection(db, "events");
      const q = query(eventsCol, where("host_user_id", "==", userId), limit(1));
      const eventsSnapshot = await getDocs(q);

      if (!eventsSnapshot.empty) {
        const eventData = eventsSnapshot.docs[0].data();
        const userInfo = eventData.user || {};

        console.log("User info from event:", userInfo);

        const fallbackUserInfo = {
          id: userId,
          username: userInfo.username || eventData.username || "Anonymous User",
          email: userInfo.email || eventData.email || "",
          bio:
            userInfo.bio ||
            eventData.bio ||
            `${
              userInfo.username || eventData.username || "Anonymous User"
            } is an active event creator in our community. Join their events to connect with fellow enthusiasts and discover amazing experiences!`,
          profileImg:
            userInfo.profileImg ||
            eventData.profileImg ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userInfo.username || eventData.username || "Anonymous User"
            )}&background=random&size=128&color=fff`,
        };

        console.log(
          "Processed user info from event fallback:",
          fallbackUserInfo
        );
        return fallbackUserInfo;
      } else {
        console.error("No events found for user, cannot get user info");
        return null;
      }
    }
  } catch (error) {
    console.error("Error loading user info:", error);
    return null;
  }
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
    button.textContent = "Unsubscribe";
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
    button.disabled = false; // Allow clicking to unsubscribe
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

// Load user's events
async function loadUserEvents(userId) {
  console.log("Loading events for user ID:", userId);
  try {
    const eventsCol = collection(db, "events");

    // First, let's get all events to debug
    const allEventsSnapshot = await getDocs(eventsCol);
    console.log("All events in database:");
    allEventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      console.log(
        `Event: ${eventData.name}, host_user_id: ${
          eventData.host_user_id
        }, matches query: ${eventData.host_user_id === userId}`
      );
    });

    const q = query(eventsCol, where("host_user_id", "==", userId));
    const snapshot = await getDocs(q);

    const events = [];
    snapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort events by start_time in JavaScript
    events.sort((a, b) => {
      if (!a.start_time || !b.start_time) return 0;
      return a.start_time.toDate() - b.start_time.toDate();
    });

    console.log(`Found ${events.length} events for user:`, events);
    return events;
  } catch (error) {
    console.error("Error loading user events:", error);
    return [];
  }
}

// Update the page content with user info and events
function updatePageContent(user, events) {
  console.log("Updating page content for user:", user);
  console.log("Events to display:", events);

  // Update hero section
  const heroTitle = document.querySelector("h1");
  if (heroTitle) {
    heroTitle.textContent = user.username;
    console.log("Updated hero title to:", user.username);
  } else {
    console.error("Hero title element not found");
  }

  // Dynamic bio based on event count
  let dynamicBio = user.bio;
  if (events.length === 0) {
    dynamicBio = `${user.username} is a new event creator in our community. They haven't created any events yet, but stay tuned for exciting upcoming events!`;
  } else if (events.length === 1) {
    dynamicBio = `${user.username} has created 1 amazing event in our community. Join their events to connect with fellow enthusiasts and discover amazing experiences!`;
  } else {
    dynamicBio = `${user.username} has created ${events.length} fantastic events in our community. Join their events to connect with fellow enthusiasts and discover amazing experiences!`;
  }

  const heroDescription = document.querySelector("p");
  if (heroDescription) {
    heroDescription.textContent = dynamicBio;
    console.log("Updated hero description to:", dynamicBio);
  } else {
    console.error("Hero description element not found");
  }

  // Update hero image
  const heroImage = document.getElementById("heroImage");
  const profileImage = document.getElementById("profileImage");
  if (heroImage && user.profileImg) {
    profileImage.src = user.profileImg;
    console.log("Updated hero image to:", user.profileImg);
  } else {
    console.log("Hero image not found or no profile image available");
  }

  // Update events section title
  const eventsSectionTitle = document.querySelector("h2");
  if (eventsSectionTitle) {
    if (events.length === 0) {
      eventsSectionTitle.textContent = "No Events Yet";
    } else if (events.length === 1) {
      eventsSectionTitle.textContent = "Event";
    } else {
      eventsSectionTitle.textContent = `Events (${events.length})`;
    }
  }

  // Update event section
  const eventsContainer = document.getElementById("user-events-container");
  if (!eventsContainer) return;

  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    eventsContainer.innerHTML = `
      <div class="col-span-1 sm:col-span-2 text-center py-8">
        <p class="text-gray-400 text-lg">No events created yet.</p>
        <p class="text-gray-500 text-sm mt-2">This user hasn't created any events yet.</p>
      </div>
    `;
    return;
  }

  // Update profile Bio
  const profileBio = document.getElementById("profile-bio");
  if (profileBio) {
    profileBio.textContent = `Discover ${user.username}'s events happening around you with the interactive map.`;
  }

  events.forEach((event, index) => {
    const eventTypes = [
      "Featured Event",
      "Popular Event",
      "New Listing",
      "Editor's Pick",
      "Local Highlight",
    ];
    const eventType = eventTypes[index % eventTypes.length];

    const startTimeStr = event.start_time
      ? formatDateTime(event.start_time)
      : "TBD";

    const nameShort =
      event.name?.length > 30
        ? event.name.substring(0, 27) + "..."
        : event.name || "";

    const eventDiv = document.createElement("div");
    eventDiv.className = "flex flex-col gap-1";

    eventDiv.innerHTML = `
  <div class="relative">
    <span class="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-white shadow -ml-[15px] sm:-ml-[26.5px]"></span>
    <h4 class="text-sm text-gray-500 ml-2">${eventType}</h4>
  </div>
  <div class="bg-[#262C3D] shadow-md shadow-[#262C3D] rounded-xl p-4 text-white min-h-[150px] sm:min-h-[170px] flex flex-col justify-between hover:bg-[#2F364A] transition-colors">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <!-- Right Side (Details Section) -->
      <div class="flex flex-col justify-between">
        <div>
          <div class="text-xs text-gray-300 mb-2">Date: ${startTimeStr}</div>
          <div class="text-base font-bold luma-gradient mb-2">${nameShort}</div>
          <div class="text-xs text-gray-300 mb-2">Author: ${user.username}</div>
          <div class="text-xs font-medium text-gray-300 mb-4">Location: ${
            event.location
          }</div>
        </div>
        <div class="mt-auto flex justify-start">
          <a href="post-event-details.html?id=${
            event.id
          }" class="inline-block px-4 py-2 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded transition">
            View Event
          </a>
        </div>
      </div>
      
      <!-- Left Side (Image) -->
      <div class="flex items-center justify-center">
        <img src="${
          event.image_url || "../../src/asset/images/event-thumb.jpg"
        }" alt="Event" class="rounded-xl shadow-md w-full h-32 object-cover" />
      </div>
    </div>
  </div>
`;

    eventsContainer.appendChild(eventDiv);
  });
}

// Handle subscribe functionality
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
      // Already subscribed, so unsubscribe
      for (const docSnap of existingSub.docs) {
        await deleteDoc(docSnap.ref);
      }

      // Also remove from creator's subscribers collection
      const creatorSubscribersRef = collection(
        db,
        "users",
        userId,
        "subscribers"
      );
      const subscriberQuery = query(
        creatorSubscribersRef,
        where("subscriberUserId", "==", currentUser.userId)
      );
      const existingSubscribers = await getDocs(subscriberQuery);

      for (const docSnap of existingSubscribers.docs) {
        await deleteDoc(docSnap.ref);
      }

      alert(`Successfully unsubscribed from ${username}!`);

      // Update the button to show unsubscribed state
      const subscribeBtn = document.querySelector(".subscribe-btn");
      if (subscribeBtn) {
        updateButtonState(subscribeBtn, false);
      }
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
    const subscribeBtn = document.querySelector(".subscribe-btn");
    if (subscribeBtn) {
      updateButtonState(subscribeBtn, true);
    }
  } catch (error) {
    console.error("Error subscribing to creator:", error);
    alert("Failed to subscribe. Please try again.");
  }
}

// Initialize the page
async function initUserEventsPage() {
  console.log("Initializing user events page...");
  const userId = getUserIdFromUrl();
  console.log("User ID from URL:", userId);

  if (!userId) {
    console.error("No user ID provided");
    return;
  }

  try {
    console.log("Loading user info and events...");
    // Load user info and events in parallel
    const [user, events] = await Promise.all([
      loadUserInfo(userId),
      loadUserEvents(userId),
    ]);

    if (!user) {
      console.error("User not found");
      return;
    }

    console.log("User and events loaded successfully");
    // Update page content
    updatePageContent(user, events);

    // Add subscribe button functionality and check subscription status
    const subscribeBtn = document.getElementById("profile-subscribe-btn");
    if (subscribeBtn && subscribeBtn.textContent.includes("Subscribe")) {
      console.log("Setting up subscribe button...");
      // Check if user is already subscribed
      const isSubscribed = await checkSubscriptionStatus(userId);
      updateButtonState(subscribeBtn, isSubscribed);

      subscribeBtn.addEventListener("click", () => {
        handleSubscribe(userId, user.username);
      });
    } else {
      console.log("Subscribe button not found or not a subscribe button");
    }

    console.log("User events page initialization complete");

    // Dispatch custom event to notify map that content is ready
    document.dispatchEvent(new CustomEvent("userEventsLoaded"));
  } catch (error) {
    console.error("Error initializing user events page:", error);
  }
}

// Debug function to show all events and their host_user_ids
async function debugAllEvents() {
  console.log("=== DEBUG: All Events in Database ===");
  try {
    const eventsCol = collection(db, "events");
    const snapshot = await getDocs(eventsCol);

    console.log(`Total events in database: ${snapshot.size}`);
    snapshot.forEach((doc) => {
      const eventData = doc.data();
      console.log(`Event ID: ${doc.id}`);
      console.log(`  Name: ${eventData.name}`);
      console.log(`  Host User ID: ${eventData.host_user_id}`);
      console.log(`  Location: ${eventData.location}`);
      console.log(`  Start Time: ${eventData.start_time}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error debugging events:", error);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Run debug function first
  debugAllEvents();
  // Then initialize the page
  initUserEventsPage();
});
