import { db } from "../config/firebase.js";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { postComment, listenForComments } from "./comment.js";
import { getCurrentUser } from "./auth/authGuard.js";

function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
const eventId = getEventIdFromUrl();

function formatDateTime(ts) {
  if (!ts) return "";
  let dateObj =
    typeof ts === "object" && ts.seconds
      ? new Date(ts.seconds * 1000)
      : new Date(ts);

  const options = { weekday: "long", month: "long", day: "numeric" };
  const dateStr = dateObj.toLocaleDateString(undefined, options);
  const timeStr = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateStr, timeStr };
}

async function renderEventDetails() {
  if (!eventId) return;
  const eventDoc = await getDoc(doc(db, "events", eventId));
  if (!eventDoc.exists()) return;
  const event = eventDoc.data();

  document.getElementById("eventName").textContent = event.name || "";
  document.getElementById("eventDescription").textContent =
    event.description || "";
  document.getElementById("eventImage").src = event.image_url || "";
  if (document.getElementById("eventCapacity"))
    document.getElementById("eventCapacity").textContent = event.capacity || "";

  const start = formatDateTime(event.start_time);
  const end = formatDateTime(event.end_time);
  const startTimeEl = document.getElementById("eventStartTime");
  const endTimeEl = document.getElementById("eventEndTime");
  const locationEl = document.getElementById("eventLocation");

  if (startTimeEl && endTimeEl && locationEl) {
    startTimeEl.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-gray-700 font-bold text-lg">
          ${start.dateStr ? start.dateStr.split(" ")[1] : ""}
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-white">${start.dateStr || ""}</span>
          <span class="text-gray-300">${start.timeStr || ""}${
      end.timeStr ? " - " + end.timeStr : ""
    }</span>
        </div>
      </div>`;
    endTimeEl.innerHTML = "";
    locationEl.innerHTML = `
      <div class="flex items-center gap-3 mt-2">
        <i class="fas fa-map-marker-alt text-2xl text-white"></i>
        <div class="flex flex-col">
          <span class="font-bold text-white">${event.location || ""}</span>
        </div>
      </div>`;
  }

  // Add Google Maps embed for event location
  const mapDiv = document.getElementById("eventMap");
  if (mapDiv && event.location) {
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
      event.location
    )}&output=embed&zoom=15`;
    mapDiv.innerHTML = `<iframe
      width="100%"
      height="100%"
      style="border:0;"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src="${mapSrc}">
    </iframe>`;
  } else if (mapDiv) {
    // Show placeholder if no location is available
    mapDiv.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
        <div class="text-center">
          <i class="fas fa-map-marker-alt text-4xl mb-2"></i>
          <p>Location not available</p>
        </div>
      </div>
    `;
  }
}

// --- Registration Logic ---
async function registerForEvent(eventId, user) {
  const attendeeRef = doc(db, "events", eventId, "attendees", user.userId);
  await setDoc(attendeeRef, {
    userId: user.userId,
    userName: user.email?.split("@")[0] || user.userId,
    userEmail: user.email,
    registeredAt: new Date(),
  });
}

async function unregisterForEvent(eventId, user) {
  const attendeeRef = doc(db, "events", eventId, "attendees", user.userId);
  await deleteDoc(attendeeRef);
}

function setupRegistration() {
  const registerBtn = document.getElementById("event-register-btn");
  const goingCountEl = document.getElementById("eventGoingCount");
  const goingListEl = document.getElementById("eventGoingList");
  const user = getCurrentUser();
  if (!registerBtn) return;

  // Listen for real-time updates to attendees
  const attendeesCol = collection(db, "events", eventId, "attendees");
  onSnapshot(attendeesCol, (snapshot) => {
    const attendees = snapshot.docs.map((doc) => doc.data());
    // Update count with correct singular/plural
    if (goingCountEl) {
      if (attendees.length === 1) {
        goingCountEl.textContent = `1 person is going`;
      } else {
        goingCountEl.textContent = `${attendees.length} people are going`;
      }
    }
    // Update list (show up to 2 names, then 'and X others')
    if (goingListEl) {
      if (attendees.length === 0) {
        goingListEl.textContent = "";
      } else {
        const names = attendees.map(
          (a) => a.userName || a.userEmail?.split("@")[0] || "Anonymous"
        );
        if (names.length <= 2) {
          goingListEl.textContent = names.join(", ");
        } else {
          goingListEl.textContent = `${names[0]}, ${names[1]} and ${
            names.length - 2
          } others`;
        }
      }
    }
    // Update button state
    const isRegistered = attendees.some((a) => a.userId === user.userId);
    if (isRegistered) {
      registerBtn.textContent = "Registered";
      registerBtn.classList.add("bg-green-600", "text-white");
      registerBtn.classList.remove("bg-[#2F364A]", "hover:bg-[#3A4258]");
    } else {
      registerBtn.textContent = "Register";
      registerBtn.classList.remove("bg-green-600", "text-white");
      registerBtn.classList.add("bg-[#2F364A]", "hover:bg-[#3A4258]");
    }
    registerBtn.disabled = false;
  });

  // Register/unregister on click
  registerBtn.onclick = async () => {
    registerBtn.disabled = true;
    const attendeesCol = collection(db, "events", eventId, "attendees");
    const snapshot = await getDoc(
      doc(db, "events", eventId, "attendees", user.userId)
    );
    if (snapshot.exists()) {
      // Already registered, unregister
      await unregisterForEvent(eventId, user);
    } else {
      // Not registered, register
      await registerForEvent(eventId, user);
    }
    registerBtn.disabled = false;
  };
}

function setupComments() {
  const commentInput = document.getElementById("commentInput");
  const postCommentBtn = document.getElementById("postCommentBtn");
  const commentGrid = document.getElementById("commentGrid");

  if (!eventId) {
    commentInput.disabled = true;
    postCommentBtn.disabled = true;
    postCommentBtn.textContent = "No Event Selected";
    return;
  }

  postCommentBtn.addEventListener("click", async () => {
    const text = commentInput.value.trim();
    if (!text) return;
    await postComment(eventId, text);
    commentInput.value = "";
  });

  listenForComments(eventId, (comments) => {
    while (commentGrid.children.length > 1) {
      commentGrid.removeChild(commentGrid.lastChild);
    }

    comments.forEach((comment) => {
      // Prioritize userName, then userEmail, then fallback to Anonymous
      const user =
        comment.userName || comment.userEmail?.split("@")[0] || "Anonymous";
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user
      )}&background=random`;

      const div = document.createElement("div");
      div.className =
        "rounded-2xl p-5 bg-[#23243a] border-2 border-transparent shadow-md bg-clip-padding relative";
      div.style.borderImage = "linear-gradient(90deg, #f59275, #f1647a) 1";

      div.innerHTML = `
        <div class="flex items-center gap-4 mb-3">
          <img src="${avatarUrl}" alt="${user}" class="w-10 h-10 rounded-full object-cover border-2 border-white" />
          <span class="text-white font-semibold text-sm">${user}</span>
        </div>
        <p class="text-gray-300 text-sm">${comment.text}</p>
      `;
      commentGrid.appendChild(div);
    });
  });
}

function setupShareButton() {
  const shareBtn = document.querySelector(
    "#event-register-btn"
  ).nextElementSibling;
  if (!shareBtn) return;
  shareBtn.onclick = async () => {
    const url = window.location.href;
    const eventName =
      document.getElementById("eventName")?.textContent ||
      "Check out this event!";
    if (navigator.share) {
      try {
        await navigator.share({ title: eventName, url });
      } catch (e) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      shareBtn.textContent = "Copied!";
      setTimeout(() => (shareBtn.textContent = "Share"), 1200);
    }
  };
}

function setupAddToCalendar() {
  const addToCalendarBtn = document.getElementById("add-to-calendar-btn");
  if (!addToCalendarBtn || !eventId) return;
  const user = getCurrentUser();
  if (!user || !user.userId) {
    addToCalendarBtn.disabled = true;
    addToCalendarBtn.textContent = "Sign in to add to calendar";
    return;
  }
  // Check if event is already in user's calendar
  const calendarRef = doc(db, "users", user.userId, "calendar", eventId);
  function setAddState() {
    addToCalendarBtn.disabled = false;
    addToCalendarBtn.textContent = "Add to Calendar";
    addToCalendarBtn.onclick = async () => {
      addToCalendarBtn.disabled = true;
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (!eventDoc.exists()) throw new Error("Event not found");
        const event = eventDoc.data();
        await setDoc(calendarRef, {
          ...event,
          eventId,
          addedAt: new Date(),
        });
        setAddedState();
        alert("Event added to calendar");
      } catch (err) {
        addToCalendarBtn.disabled = false;
        alert("Failed to add event to calendar: " + err.message);
      }
    };
  }
  function setAddedState() {
    addToCalendarBtn.disabled = false;
    addToCalendarBtn.textContent = "Added to Calendar";
    addToCalendarBtn.onclick = async () => {
      addToCalendarBtn.disabled = true;
      try {
        await deleteDoc(calendarRef);
        setAddState();
        alert("Event removed from calendar");
      } catch (err) {
        addToCalendarBtn.disabled = false;
        alert("Failed to remove event from calendar: " + err.message);
      }
    };
  }
  getDoc(calendarRef).then((docSnap) => {
    if (docSnap.exists()) {
      setAddedState();
    } else {
      setAddState();
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderEventDetails();
  setupComments();
  setupRegistration();
  setupShareButton();
  setupAddToCalendar();
});
