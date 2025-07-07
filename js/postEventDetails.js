import { db } from "../config/firebase.js";
import {
  doc,
  getDoc,
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
      const user = comment.userEmail || comment.userName || "Anonymous";
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

window.addEventListener("DOMContentLoaded", () => {
  renderEventDetails();
  setupComments();
});
