import { db } from "../config/firebase.js"; // Import the Firestore database instance
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


const storage = getStorage();


async function uploadImage(file) {
  const storageRef = ref(storage, `event_images/${file.name}-${Date.now()}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}


document.addEventListener("DOMContentLoaded", () => {

  const imagePreview = document.getElementById("imagePreview");
  const fileInput = document.getElementById("eventImage");

  // Click on image opens file picker
  imagePreview.addEventListener("click", () => {
    fileInput.click();
  });

  // When user selects an image, update preview
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

  document.getElementById("createEventBtn").addEventListener("click", async () => {
    const name = document.getElementById("eventName").value;
    const location = document.getElementById("eventLocation").value;
    const description = document.getElementById("eventDescription").value;
    const capacity = parseInt(document.getElementById("eventCapacity").value);
    const startDate = document.getElementById("startDate").value;
    const startTime = document.getElementById("startTime").value;
    const endDate = document.getElementById("endDate").value;
    const endTime = document.getElementById("endTime").value;
    const file = fileInput.files[0];  // get the selected image file

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
      // Upload the image and get URL
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
        image_url: imageUrl,  // save the image URL here
      };

      console.log("Creating event:", newEvent);

      const docRef = await addDoc(collection(db, "events"), newEvent);
      alert("Event created with ID: " + docRef.id);

      // Optionally, clear form or reset preview here

    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  });

});
