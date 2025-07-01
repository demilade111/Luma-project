import { db } from "../config/firebase.js"; // Import the Firestore database instance
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("createEventBtn").addEventListener("click", async () => {
    // form logic
    const name = document.getElementById("eventName").value;
    const location = document.getElementById("eventLocation").value;
    const description = document.getElementById("eventDescription").value;
    const capacity = parseInt(document.getElementById("eventCapacity").value);
    const startDate = document.getElementById("startDate").value;
    const startTime = document.getElementById("startTime").value;
    const endDate = document.getElementById("endDate").value;
    const endTime = document.getElementById("endTime").value;

    if (!name || !location || !startDate || !startTime || !endDate || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const newEvent = {
      host_user_id: "user_123",
      city_id: "city_456",
      name,
      location,
      description,
      capacity,
      start_time: Timestamp.fromDate(startDateTime),
      end_time: Timestamp.fromDate(endDateTime),
    };

    console.log("Creating event:", newEvent);

    try {
      const docRef = await addDoc(collection(db, "events"), newEvent);
      alert("Event created with ID: " + docRef.id);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  });
});
