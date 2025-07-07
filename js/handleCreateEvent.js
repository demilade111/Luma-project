// handleCreateEvent.js
import { db } from "../config/firebase.js";
import {
  collection,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth();
const currentUser = auth.currentUser;

if (!currentUser) {
  alert("You must be signed in to create an event.");
  return;
}

const host_user_id = currentUser.uid;

// Cloudinary Config
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhg2zrff9/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "event_upload";

// Upload to Cloudinary
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url;
};

function updateTimezoneDisplay(offsetMinutes, timeZoneId, label = null) {
  const timezoneDisplay = document.getElementById("timezoneDisplay");
  if (!timezoneDisplay) return;

  const offsetHours = offsetMinutes / 60;
  const offsetLabel =
    offsetHours >= 0 ? `GMT +${offsetHours}` : `GMT ${offsetHours}`;
  const locationLabel = label || "Local Time";

  timezoneDisplay.innerHTML = `
    <div class="flex items-center gap-2">
      <i class="fas fa-globe text-sm"></i>
      <span class="text-sm font-medium">${offsetLabel}</span>
    </div>
    <div class="text-sm mt-2">${timeZoneId}</div>
    <div class="text-sm">${locationLabel}</div>
  `;
}

function setDefaultLocalTimezone() {
  const now = new Date();
  const offsetMinutes = -now.getTimezoneOffset(); // JS offset is opposite
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  updateTimezoneDisplay(offsetMinutes, timeZoneName);
}

async function fetchTimezone(lat, lng, label) {
  const timestamp = Math.floor(Date.now() / 1000);
  const apiKey = "AIzaSyAMMYHYEQXmjD3xG1Q5yasCDQbSPoLnwDk";

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === "OK") {
    updateTimezoneDisplay(data.rawOffset / 60, data.timeZoneName, label);
  } else {
    console.warn("Could not fetch timezone:", data);
  }
}

// Set up Google Places autocomplete
function initAutocomplete() {
  const input = document.getElementById("eventLocation");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const city = place.formatted_address || "Selected Location";
      fetchTimezone(lat, lng, city);
    }
  });
}

// Tag handling
const tags = new Set();

function renderTags() {
  const tagContainer = document.getElementById("tagContainer");
  tagContainer.innerHTML = "";
  tags.forEach((tag) => {
    const tagEl = document.createElement("span");
    tagEl.className = "tag";
    tagEl.innerHTML = `${tag} <button type="button" data-tag="${tag}">×</button>`;
    tagContainer.appendChild(tagEl);
  });
}

function handleTagEvents() {
  const tagInput = document.getElementById("tagInput");
  const tagContainer = document.getElementById("tagContainer");

  tagInput.addEventListener("keydown", (e) => {
    const value = tagInput.value.trim();
    if (e.key === "Enter" && value !== "") {
      e.preventDefault();
      if (!tags.has(value)) {
        tags.add(value);
        renderTags();
      }
      tagInput.value = "";
    }
  });

  tagContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const tag = e.target.getAttribute("data-tag");
      tags.delete(tag);
      renderTags();
    }
  });
}

// Save the form to Firestore
async function handleCreateEvent() {
  const name = document.getElementById("eventName").value.trim();
  const location = document.getElementById("eventLocation").value.trim();
  const description = document.getElementById("eventDescription").value.trim();
  const capacity = parseInt(document.getElementById("eventCapacity").value);
  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endDate = document.getElementById("endDate").value;
  const endTime = document.getElementById("endTime").value;
  const recurrence =
    document.querySelector('input[name="recurrence"]:checked')?.value || null;
  const fileInput = document.getElementById("eventImage");
  const imagePreview = document.getElementById("imagePreview");
  const file = fileInput.files[0];

  if (!name || !location || !startDate || !startTime || !endDate || !endTime) {
    alert("Please fill in all required fields.");
    return;
  }

  if (!file) {
    alert("Please select an image.");
    return;
  }

  const startDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const tagArray = Array.from(tags);

  try {
    const createBtn = document.getElementById("createEventBtn");
    createBtn.innerText = "Uploading...";
    createBtn.disabled = true;

    const imageUrl = await uploadImage(file);

    const newEvent = {
      host_user_id,
      city_id: "city_456",
      name,
      location,
      description,
      capacity,
      start_time: Timestamp.fromDate(startDateTime),
      end_time: Timestamp.fromDate(endDateTime),
      image_url: imageUrl,
      tags: tagArray,
      recurrence,
    };

    const docRef = await addDoc(collection(db, "events"), newEvent);
    alert("✅ Event created successfully");

    // Reset form
    document.getElementById("eventName").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventCapacity").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("endTime").value = "";
    document
      .querySelectorAll('input[name="recurrence"]')
      .forEach((r) => (r.checked = false));
    fileInput.value = null;
    imagePreview.src = "../../src/asset/images/event-img.png";
    tags.clear();
    renderTags();
  } catch (err) {
    console.error("❌ Error creating event:", err);
    alert("Failed to create event.");
  } finally {
    const createBtn = document.getElementById("createEventBtn");
    createBtn.innerText = "Create Event";
    createBtn.disabled = false;
  }
}

// Initialize everything on load
document.addEventListener("DOMContentLoaded", () => {
  setDefaultLocalTimezone();
  initAutocomplete();
  handleTagEvents();

  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("eventImage");

  imagePreview.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => (imagePreview.src = e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  });

  document
    .getElementById("createEventBtn")
    .addEventListener("click", handleCreateEvent);
});
