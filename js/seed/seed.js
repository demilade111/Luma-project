// js/seed.js
import { app } from "../../config/firebase.js";
import { getFirestore, doc, setDoc } from "firebase/firestore";

console.log("Seed module loaded");

let db;
try {
  db = getFirestore(app);
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

export async function seedFirestore(statusElement) {
  console.log("seedFirestore function called");
  if (!db) {
    console.error("Firestore not initialized");
    statusElement.textContent = "Error: Firestore not initialized";
    return;
  }

  try {
    statusElement.textContent = "Seeding…";
    console.log("Starting to seed Firestore data");

    // USERS
    await setDoc(doc(db, "users", "user1"), {
      displayName: "Alex Kim",
      email: "alex@email.com",
      avatarUrl: "https://example.com/avatar.png",
    });
    console.log("Added user data");

    // GAMES
    await setDoc(doc(db, "games", "game1"), {
      title: "Catan",
      description: "Trade, build, settle.",
      designer: "Klaus Teuber",
      publisher: "Kosmos",
      minPlayers: 3,
      maxPlayers: 4,
      playTimeMinutes: 90,
      categories: ["strategy", "family"],
    });
    console.log("Added game data");

    // Ratings (subcollection)
    await setDoc(doc(db, "games/game1/ratings", "user1"), {
      rating: 5,
      review: "Great gateway game",
      createdAt: new Date(),
    });

    // Tutorials (subcollection)
    await setDoc(doc(db, "games/game1/tutorials", "tut1"), {
      title: "Setup and first turn",
      steps: [
        "Place terrain hexes",
        "Shuffle resource cards",
        "Give everyone two settlements",
      ],
    });

    // Rulebooks (subcollection)
    await setDoc(doc(db, "games/game1/rulebooks", "rule1"), {
      fileUrl: "https://example.com/catan_rulebook.pdf",
    });

    // Comments (subcollection)
    await setDoc(doc(db, "games/game1/comments", "c1"), {
      userId: "user1",
      content: "Looking forward to playing again",
      createdAt: new Date(),
    });

    // EVENTS
    await setDoc(doc(db, "events", "event1"), {
      name: "Board Game Night",
      description: "Weekly open table session",
      startTime: "2025-06-10T18:00:00Z",
      endTime: "2025-06-10T22:00:00Z",
      location: "Vancouver Library",
      hostUserId: "user1",
      capacity: 30,
      categories: ["community"],
    });

    // Attendees (subcollection)
    await setDoc(doc(db, "events/event1/attendees", "user1"), {
      status: "going",
    });

    // Comments (subcollection)
    await setDoc(doc(db, "events/event1/comments", "ce1"), {
      userId: "user1",
      content: "See you all there",
      createdAt: new Date(),
    });

    statusElement.textContent = "Data added!";
    console.log("Seeding completed successfully");
  } catch (err) {
    console.error("Error seeding Firestore:", err);
    statusElement.textContent = "Error – check console";
  }
}
