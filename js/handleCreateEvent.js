import { db } from "../config/firebase.js";
import {
  collection,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Config
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhg2zrff9/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "event_upload";

// 🔁 Replace with your Cloudinary credentials:
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

document.addEventListener("DOMContentLoaded", () => {
  const f_eventName = document.getElementById('eventName');
  if (f_eventName) {
    f_eventName.focus(); // this puts the cursor in the input field
  }
  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("eventImage");

  // Click image to select file
  imagePreview.addEventListener("click", () => {
    fileInput.click();
  });

  // Preview image
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }
  });

  // Create event
  document.getElementById("createEventBtn").addEventListener("click", async () => {
    const name = document.getElementById("eventName").value.trim();
    const location = document.getElementById("eventLocation").value.trim();
    const description = document.getElementById("eventDescription").value.trim();
    const capacity = parseInt(document.getElementById("eventCapacity").value);
    const startDate = document.getElementById("startDate").value;
    const startTime = document.getElementById("startTime").value;
    const endDate = document.getElementById("endDate").value;
    const endTime = document.getElementById("endTime").value;
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

    try {
      const createBtn = document.getElementById("createEventBtn");
      createBtn.innerText = "Uploading...";
      createBtn.disabled = true;

      const imageUrl = await uploadImage(file);

      const newEvent = {
        host_user_id: "user_123",
        city_id: "city_456",
        name,
        location,
        description,
        capacity,
        start_time: Timestamp.fromDate(startDateTime),
        end_time: Timestamp.fromDate(endDateTime),
        image_url: imageUrl,
      };

      const docRef = await addDoc(collection(db, "events"), newEvent);
      alert("✅ Event created with ID: " + docRef.id);

      // Optional: Clear form
      document.getElementById("eventName").value = "";
      document.getElementById("eventLocation").value = "";
      document.getElementById("eventDescription").value = "";
      document.getElementById("eventCapacity").value = "";
      document.getElementById("startDate").value = "";
      document.getElementById("startTime").value = "";
      document.getElementById("endDate").value = "";
      document.getElementById("endTime").value = "";
      fileInput.value = null;
      imagePreview.src = "../../src/asset/images/event-img.png";

    } catch (err) {
      console.error("❌ Error creating event:", err);
      alert("Failed to create event.");
    } finally {
      const createBtn = document.getElementById("createEventBtn");
      createBtn.innerText = "Create Event";
      createBtn.disabled = false;
    }
  });
});
