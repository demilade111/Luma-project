import { db, auth } from "../config/firebase.js";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getGamesFromFirebase } from "./uploadGamesToFirebase.js";

const container = document.getElementById("events");

if (container) {
  events.forEach((group) => {
    const dayBlock = document.createElement("div");
    dayBlock.innerHTML = `
      <p class="text-sm font-medium text-gray-600 mb-3">${group.day}</p>
      ${group.entries
        .map(
          (event) => `
        <div class="bg-white p-4 rounded shadow flex justify-between items-center mb-4">
          <div>
            <p class="text-sm text-gray-700">${event.time}</p>
            <p class="font-semibold">${event.title}</p>
            <p class="text-sm text-gray-500">by ${event.host}</p>
            <p class="text-sm text-gray-500">${event.location}</p>
            <p class="text-xs text-gray-400">${event.attendees}</p>
          </div>
          <div class="w-28 h-16 bg-gray-200 rounded"></div>
        </div>
      `
        )
        .join("")}
    `;
    container.appendChild(dayBlock);
  });
}

// import { seedFirestore } from "./seed/seed.js"; // Commented out for now

function setupSearchToggle() {
  const toggleBtn = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");

  if (!toggleBtn || !searchInput) return;

  toggleBtn.addEventListener("click", () => {
    searchInput.classList.toggle("hidden");
    if (!searchInput.classList.contains("hidden")) {
      searchInput.focus();
    }
  });

  document.addEventListener("click", (e) => {
    const clickedInside =
      toggleBtn.contains(e.target) || searchInput.contains(e.target);
    if (!clickedInside) {
      searchInput.classList.add("hidden");
    }
  });
}

function setupSeedButton() {
  const btn = document.getElementById("seedBtn");
  const status = document.getElementById("status");

  if (btn && status) {
    console.log("Seed button found, setting up event listener");
    btn.addEventListener("click", () => {
      console.log("Seed button clicked");
      alert("Seeding started!");
      // seedFirestore(status); // Commented out for now
    });
  } else {
    console.warn("Seed button or status element not found");
  }
}

// Games Page Functions
let allGamesData = [];
let currentPage = 1;
const GAMES_PER_PAGE = 10;

async function loadGames() {
  const loadingDiv = document.getElementById("games-loading");
  const errorDiv = document.getElementById("games-error");
  const gamesContainer = document.getElementById("games-container");

  if (!loadingDiv || !errorDiv || !gamesContainer) return;

  try {
    // Show loading state
    loadingDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    gamesContainer.classList.add("hidden");

    console.log("🎮 Loading games from Firebase...");

    // Load games data from Firebase
    allGamesData = await getGamesFromFirebase();
    currentPage = 1;
    console.log(`✅ Loaded ${allGamesData.length} games from Firebase`);

    // Hide loading and show games
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");

    // Render games with pagination
    renderGamesWithPagination();
  } catch (error) {
    console.error("❌ Error loading games:", error);

    // Show error state
    loadingDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    gamesContainer.classList.add("hidden");
  }
}

function renderGames(games) {
  const gamesContainer = document.getElementById("games-container");
  const gamesCount = document.getElementById("games-count");

  if (!gamesContainer) return;

  // Render all games
  gamesContainer.innerHTML = games.map((game) => createGameCard(game)).join("");

  // Update game count
  if (gamesCount) {
    gamesCount.classList.remove("hidden");
  }

  // Add click handlers for game cards
  setupGameCardClickHandlers();

  console.log(`🎮 Rendered ${games.length} games on page`);
}

function renderGamesWithPagination() {
  const gamesContainer = document.getElementById("games-container");
  const gamesCount = document.getElementById("games-count");

  if (!gamesContainer || !allGamesData.length) return;

  // Calculate pagination
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const endIndex = startIndex + GAMES_PER_PAGE;
  const gamesToShow = allGamesData.slice(0, endIndex); // Show from start to current end
  const hasMoreGames = endIndex < allGamesData.length;

  // Render games
  gamesContainer.innerHTML = gamesToShow
    .map((game) => createGameCard(game))
    .join("");

  // Add View More button if there are more games
  if (hasMoreGames) {
    const viewMoreButton = `
      <div class="col-span-full flex justify-center mt-8">
        <button id="view-more-games" class="px-8 py-3 bg-gradient-to-r to-[#f59275] from-[#f1647a] text-gray-200 rounded-xl transition-colors">
          View More Games 
        </button>
      </div>
    `;
    gamesContainer.innerHTML += viewMoreButton;

    // Add click handler for View More button
    const viewMoreBtn = document.getElementById("view-more-games");
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderGamesWithPagination();
      });
    }
  }

  // Update game count
  if (gamesCount) {
    gamesCount.innerHTML = `Showing ${gamesToShow.length} of ${allGamesData.length} games`;
    gamesCount.classList.remove("hidden");
  }

  // Add click handlers for game cards
  setupGameCardClickHandlers();

  console.log(
    `🎮 Rendered ${gamesToShow.length} of ${allGamesData.length} games (page ${currentPage})`
  );
}

function setupGameCardClickHandlers() {
  const gameCards = document.querySelectorAll(".game-card");
  const categoryTags = document.querySelectorAll(".category-tag");

  // Game card click handlers
  gameCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger card click if category tag was clicked
      if (e.target.classList.contains("category-tag")) {
        return;
      }

      const gameId = card.dataset.gameId;
      const gameData = JSON.parse(
        card.dataset.gameData.replace(/&apos;/g, "'")
      );

      console.log(`🎯 Clicked on game: ${gameData.name}`);

      // Store game data in localStorage for the details page
      localStorage.setItem("selectedGame", JSON.stringify(gameData));

      // Redirect to game details page with id in URL
      window.location.href = `./game-details.html?id=${gameId}`;
    });
  });

  // Category tag click handlers
  categoryTags.forEach((tag) => {
    tag.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card click

      const category = tag.dataset.category;
      console.log(`🏷️ Filtering by category: ${category}`);

      filterGamesByCategory(category);
    });
  });
}

async function filterGamesByCategory(category) {
  const loadingDiv = document.getElementById("games-loading");
  const gamesContainer = document.getElementById("games-container");
  const gamesCount = document.getElementById("games-count");

  try {
    // Show loading state
    loadingDiv.classList.remove("hidden");
    gamesContainer.classList.add("hidden");

    console.log(`🔍 Filtering games by category: ${category}`);

    // Load games data from Firebase
    const allGames = await getGamesFromFirebase();

    // Filter games by category
    const filteredGames = allGames.filter(
      (game) =>
        game.categories &&
        game.categories.some(
          (cat) => cat.toLowerCase() === category.toLowerCase()
        )
    );

    console.log(
      `✅ Found ${filteredGames.length} games in category: ${category}`
    );

    // Hide loading and show games
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");

    // Render filtered games
    const gamesContainerElement = document.getElementById("games-container");
    if (gamesContainerElement) {
      gamesContainerElement.innerHTML = filteredGames
        .map((game) => createGameCard(game))
        .join("");
      setupGameCardClickHandlers();
    }
  } catch (error) {
    console.error("❌ Error filtering games:", error);

    // Hide loading and show error
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");
  }
}

function createGameCard(game) {
  // Ensure we have fallback values
  const name = game.name || "Unknown Game";
  const description = game.description || "No description available";
  const image = game.thumbnail || game.image || "";
  const playingTime = game.playingTime || game.maxPlayTime || "?";
  const minPlayers = game.minPlayers || "?";
  const maxPlayers = game.maxPlayers || "?";
  const age = game.age || "?";
  const rating = game.rating || "?";
  const complexity = game.complexity || "?";
  const categories = game.categories || [];
  const year = game.year || "";
  const gameId = game.id || "";

  // Truncate description if too long
  const truncatedName = name.length > 30 ? name.substring(0, 27) + "..." : name;

  // Truncate description if too long
  const truncatedDescription =
    description.length > 100
      ? description.substring(0, 97) + "..."
      : description;

  return `
    <div class="flex flex-col md:flex-row items-center gap-4 overflow-hidden bg-transparent rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer game-card" 
         data-game-id="${gameId}" 
         data-game-data='${JSON.stringify(game).replace(/'/g, "&apos;")}'>
      <div class="w-full h-48 md:w-48 md:h-48 object-cover rounded-2xl overflow-hidden bg-gray-100 shrink-0">
        ${
          image
            ? `<img src="${image}" alt="${name}" class="w-full h-full md:w-48 md:h-48 object-cover"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div class="w-full h-full flex items-center justify-center text-gray-400" style="display:none;">
              <i class="fas fa-dice text-3xl"></i>
            </div>`
            : `<div class="w-full h-full flex items-center justify-center text-gray-400">
              <i class="fas fa-dice text-3xl"></i>
            </div>`
        }
      </div>

      <div class="md:p-4 flex flex-col justify-between items-start flex-1">
        <div class="w-full">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-2xl font-semibold text-gray-200">${truncatedName}</h2>
            ${
              year
                ? `<span class="text-sm text-gray-500 hidden">${year}</span>`
                : ""
            }
          </div>
          
          <p class="text-base text-gray-400 mb-3 leading-relaxed">
            ${truncatedDescription}
          </p>
          
          ${
            categories.length > 0
              ? `<div class="flex flex-wrap gap-1 mb-3">
              ${categories
                .slice(0, 3)
                .map(
                  (cat) =>
                    `<span class="px-2 py-1 text-xs underline text-gray-400 rounded-full category-tag cursor-pointer hover:bg-blue-200" 
                       data-category="${cat}">${cat}</span>`
                )
                .join("")}
            </div>`
              : ""
          }
          
          <div class="flex items-center gap-6 text-sm text-gray-400">
            <div class="flex items-center gap-1">
              <i class="fas fa-hourglass-half"></i>
              <span>${playingTime}m</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="fas fa-users"></i>
              <span>${minPlayers}${
    maxPlayers !== minPlayers ? `-${maxPlayers}` : ""
  }</span>
            </div>
            ${
              rating !== "?"
                ? `<div class="flex items-center gap-1">
                <i class="fas fa-star text-yellow-500"></i>
                <span>${rating}</span>
              </div>`
                : ""
            }
            ${
              age !== "?"
                ? `<div class="border border-gray-400 rounded-full px-2 py-1">
                <span>${age}+</span>
              </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRandomGames(games) {
  const container = document.getElementById("random-games-container");
  if (!container || !Array.isArray(games)) return;

  // Shuffle and pick 4 random games
  const randomFour = [...games].sort(() => 0.5 - Math.random()).slice(0, 4);

  container.innerHTML = randomFour
    .map((game) => {
      const name = game.name || "Untitled Game";
      const description = game.description || "No description available";
      const image = game.thumbnail || game.image || "";

      const isNightCafe = name === "The Night Cage";

      const truncatedName =
        name.length > 26 ? name.substring(0, 23) + "..." : name;
      const truncatedDescription =
        description.length > 60
          ? description.substring(0, 57) + "..."
          : description;

      const disabledAttr = isNightCafe ? "" : "disabled";
      const buttonClasses = isNightCafe
        ? "cursor-pointer hover:bg-[#3A4258]"
        : "opacity-50 cursor-not-allowed";

      return `
        <div class="min-w-[350px] flex-shrink-0 flex flex-col rounded-2xl py-4 px-6 bg-[#262C3D] shadow-md shadow-gray-500/20">
          <h3 class="text-lg font-semibold mb-4 text-gray-200">${truncatedName}</h3>
          <div class="flex gap-4">
            <div class="w-32 h-32 rounded-2xl overflow-hidden bg-gray-300">
              ${
                image
                  ? `<img src="${image}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling?.style.display='flex'">`
                  : `<div class="w-full h-full flex items-center justify-center text-gray-400">
                      <i class="fas fa-dice text-3xl"></i>
                    </div>`
              }
            </div>
            <div class="text-button flex flex-col justify-between h-32 w-32">
              <p class="text-sm text-gray-400 leading-tight">${truncatedDescription}</p>
              <button type="button" ${disabledAttr}
                ${
                  isNightCafe
                    ? `onclick="window.location.href='/views/game/night-cage-tutorial.html'"`
                    : ""
                }
                style="box-shadow: -3px -3px 8px -3px rgba(255, 255, 255, 0.8)"
                class="border border-gray-700 rounded-xl px-6 py-1 bg-[#2F364A] text-gray-200 transition-colors ${buttonClasses}">
                Tutorial
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

export async function loadRandomGames() {
  const loadingDiv = document.getElementById("games-loading");
  const errorDiv = document.getElementById("games-error");
  const gamesContainer = document.getElementById("games-container");

  if (!loadingDiv || !errorDiv || !gamesContainer) return;

  try {
    // Show loading state
    loadingDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    gamesContainer.classList.add("hidden");

    console.log("🎮 Loading games from Firebase...");

    // Load games data from Firebase
    allGamesData = await getGamesFromFirebase();
    currentPage = 1;

    console.log(`✅ Loaded ${allGamesData.length} games from Firebase`);

    // Hide loading
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");

    // Render all games with pagination
    renderGamesWithPagination();

    // ✅ Render 4 random games in horizontal scroll
    renderRandomGames(allGamesData);
  } catch (error) {
    console.error("❌ Error loading games:", error);

    // Show error state
    loadingDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    gamesContainer.classList.add("hidden");
  }
}

function setupGamesPage() {
  // Only run on games page
  if (!document.getElementById("games-container")) return;

  console.log("🎮 Setting up games page...");

  // Load games
  loadGames();

  loadRandomGames();

  // Setup retry button
  const retryBtn = document.getElementById("retry-games");
  if (retryBtn) {
    retryBtn.addEventListener("click", loadGames);
  }

  // Setup category filter buttons
  setupCategoryFilters();
}

function setupCategoryFilters() {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.category;
      console.log(`🏷️ Main category filter clicked: ${category}`);
      filterGamesByCategory(category);
    });
  });
}

function setupTutorial() {
  console.log("Tutorial setup running...");
  if (!document.querySelector(".tutorial-1")) {
    console.log("Tutorial page not found, skipping tutorial initialization");
    return;
  }
  console.log("Tutorial page found, initializing...");

  const playButton = document.querySelector(".play-buttons");
  const videos = document.querySelectorAll(".tutorial-1 video");
  const videoControls = document.getElementById("video-controls");
  const replayBtn = document.getElementById("replay-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const introText = document.getElementById("text-tutorial-intro");
  const backgroundImage = document.querySelector(".tutorial-1 img");

  let currentIndex = 0;
  let isPlaying = false;

  function initTutorial() {
    if (!playButton || !videos.length) {
      console.warn("Tutorial elements not found");
      return;
    }
    playButton.addEventListener("click", function (e) {
      startTutorial();
    });
    replayBtn.addEventListener("click", replayCurrentVideo);
    nextBtn.addEventListener("click", nextVideo);
    prevBtn.addEventListener("click", previousVideo);
    videos.forEach((video, index) => {
      video.addEventListener("ended", () => {
        if (index < videos.length - 1) {
          currentIndex = index + 1;
          showVideo(currentIndex);
        }
      });
    });
    updateButtonStates();
  }
  function startTutorial() {
    isPlaying = true;
    playButton.parentElement.style.display = "none";
    introText.style.display = "none";
    backgroundImage.style.display = "none";
    showVideo(0);
  }
  function showVideo(index) {
    if (index < 0 || index >= videos.length) return;
    currentIndex = index;
    videos.forEach((video, i) => {
      if (i === index) {
        video.classList.remove("hidden");
        video.play().catch((err) => {
          console.warn("Video play failed:", err);
        });
      } else {
        video.pause();
        video.classList.add("hidden");
      }
    });
    videoControls.classList.remove("hidden");
    updateButtonStates();
  }
  function replayCurrentVideo() {
    if (videos[currentIndex]) {
      videos[currentIndex].currentTime = 0;
      videos[currentIndex]
        .play()
        .catch((err) => console.warn("Video replay failed:", err));
    }
  }
  function nextVideo() {
    if (currentIndex < videos.length - 1) {
      currentIndex++;
      showVideo(currentIndex);
    }
  }
  function previousVideo() {
    if (currentIndex > 0) {
      currentIndex--;
      showVideo(currentIndex);
    } else {
      returnToIntro();
    }
  }
  function returnToIntro() {
    isPlaying = false;
    videos.forEach((video) => {
      video.pause();
      video.classList.add("hidden");
    });
    videoControls.classList.add("hidden");
    playButton.parentElement.style.display = "flex";
    introText.style.display = "block";
    backgroundImage.style.display = "block";
    currentIndex = 0;
  }
  function updateButtonStates() {
    prevBtn.disabled = false;
    nextBtn.disabled = currentIndex >= videos.length - 1;
    replayBtn.disabled = !isPlaying;
  }
  initTutorial();
}
document.addEventListener("DOMContentLoaded", setupTutorial);
window.addEventListener("components-injected", setupTutorial);

// Game Details Page Functions
async function setupGameDetailsPage() {
  // Only run on game details page
  if (!document.getElementById("game-title")) return;

  console.log("🎮 Setting up game details page...");

  await loadGameDetails();
  setupPDFModal();
  if (window.location.pathname.includes("game-details.html")) {
    setupGameComments();
    onAuthStateChanged(auth, () => {
      renderSuggestedGames();
    });
  }
}

async function loadGameDetails() {
  // Get game ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");

  if (!gameId) {
    console.error("No game ID found in URL");
    document.getElementById("game-title").textContent = "Game not found";
    return;
  }

  console.log("🎮 Loading game details for ID:", gameId);

  try {
    // Fetch game data from Firebase by ID
    const games = await getGamesFromFirebase();
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      console.error("❌ Game not found in Firebase:", gameId);
      document.getElementById("game-title").textContent = "Game not found";
      return;
    }

    console.log("✅ Game found:", game);

    // Update game image
    const gameImage = document.getElementById("game-image");
    const imageUrl = game.image || game.thumbnail;

    if (imageUrl) {
      gameImage.innerHTML = `
      <img src="${imageUrl}" 
           alt="${game.name}" 
           class="w-full h-full object-cover rounded-2xl"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="w-full h-full flex items-center justify-center text-center" style="display:none;">
        <div>
          <i class="fas fa-dice text-6xl text-gray-400"></i>
          <p class="mt-4 text-gray-600">${game.name || "Game Image"}</p>
        </div>
      </div>
    `;
    } else {
      gameImage.innerHTML = `
      <div class="w-full h-full flex items-center justify-center text-center">
        <div>
          <i class="fas fa-dice text-6xl text-gray-400"></i>
          <p class="mt-4 text-gray-600">${game.name || "Game Image"}</p>
        </div>
      </div>
    `;
    }

    // Update basic info
    document.getElementById("game-title").textContent =
      game.name || "Unknown Game";
    document.getElementById("game-subtitle").textContent = game.year
      ? `Released in ${game.year}`
      : "";
    
    // Debug description
    console.log("🎮 Game description:", game.description);
    console.log("🎮 Detailed description element:", document.getElementById("detailed-description"));
    
    // Update both description elements
    const descriptionElement = document.getElementById("detailed-description");
    const gameDescriptionElement = document.getElementById("game-description");
    
    if (descriptionElement) {
      // Set description with a small delay to ensure DOM is ready
      setTimeout(() => {
        descriptionElement.innerHTML =
          game.description || "No description available";
        descriptionElement.style.display = "block"; // Ensure it's visible
        console.log("✅ Detailed description set successfully");
        console.log(
          "🎮 Element content after setting:",
          descriptionElement.innerHTML
        );
      }, 100);
    } else {
      console.error("❌ Detailed description element not found!");
    }
    
    // Update the short description too
    if (gameDescriptionElement) {
      console.log("🎮 Found game-description element:", gameDescriptionElement);
      console.log("🎮 Current content:", gameDescriptionElement.innerHTML);
      gameDescriptionElement.innerHTML = game.description || "No description available";
      console.log("✅ Game description set successfully");
      console.log("🎮 New content:", gameDescriptionElement.innerHTML);
    } else {
      console.error("❌ Game description element not found!");
    }

    // Update stats
    const playingTime = game.playingTime || game.maxPlayTime || "?";
    if (document.querySelector(".time-value")) {
      document.querySelector(".time-value").textContent = `${playingTime}m`;
    }

    const minPlayers = game.minPlayers || "?";
    const maxPlayers = game.maxPlayers || "?";
    const playerText =
      minPlayers === maxPlayers ? minPlayers : `${minPlayers}-${maxPlayers}`;
    if (document.querySelector(".players-value")) {
      document.querySelector(".players-value").textContent = playerText;
    }

    if (document.querySelector(".age-value")) {
      document.querySelector(".age-value").textContent = game.age
        ? `${game.age}+`
        : "N/A";
    }
    if (document.querySelector(".rating-value")) {
      document.querySelector(".rating-value").textContent = game.rating
        ? `${game.rating}/10`
        : "?";
    }

    // Update designers
    if (game.designers && game.designers.length > 0) {
      document.getElementById("designers-list").innerHTML = game.designers
        .map((designer) => `<p class="text-base text-gray-400">${designer}</p>`)
        .join("");
    } else {
      document.getElementById("designers-list").innerHTML =
        '<p class="text-custom-gray text-2xl">Unknown</p>';
    }

    // Update publishers
    if (game.publishers && game.publishers.length > 0) {
      console.log(game);
      document.getElementById("publishers-list").innerHTML = game.publishers
        .map(
          (publisher) => `<p class="text-base text-gray-400">${publisher}</p>`
        )
        .join("");
    } else {
      document.getElementById("publishers-list").innerHTML =
        '<p class="text-custom-gray text-2xl">Unknown</p>';
    }

    // Update categories
    if (game.categories && game.categories.length > 0) {
      document.getElementById("categories-list").innerHTML = game.categories
        .map((category) => `<p class="text-base text-gray-400">${category}</p>`)
        .join("");
    } else {
      document.getElementById("categories-list").innerHTML =
        '<p class="text-custom-gray text-2xl">Unknown</p>';
    }

    // Update bookmark button
    updateBookmarkBtn(game);

    // Setup Rules button
    setupRulesButton(game);

    // Setup Tutorial button
    setupTutorialButton(game);
  } catch (error) {
    console.error("❌ Error loading game details:", error);
    document.getElementById("game-title").textContent = "Error loading game";
  }
}

// Setup Rules button functionality
function setupRulesButton(game) {
  const rulesBtn = document.getElementById("rules-btn");
  if (!rulesBtn) return;

  if (game.rulebook) {
    // Game has rules PDF - enable button
    rulesBtn.onclick = () => {
      openPDFPreview(game.rulebook, game.name);
    };
    rulesBtn.disabled = false;
    rulesBtn.classList.remove("opacity-50", "cursor-not-allowed");
    rulesBtn.classList.add("cursor-pointer", "hover:bg-[#3A4258]");
  } else {
    // No rules PDF - disable button
    rulesBtn.onclick = null;
    rulesBtn.disabled = true;
    rulesBtn.classList.add("opacity-50", "cursor-not-allowed");
    rulesBtn.classList.remove("cursor-pointer", "hover:bg-[#3A4258]");
  }
}

// Setup Tutorial button functionality
function setupTutorialButton(game) {
  const tutorialBtn = document.getElementById("tutorial-btn");
  console.log("🎮 Tutorial button element:", tutorialBtn);
  
  if (!tutorialBtn) {
    console.error("❌ Tutorial button not found!");
    return;
  }

  tutorialBtn.onclick = () => {
    console.log("🎮 Tutorial button clicked! Redirecting to tutorial page...");
    // Navigate to tutorial page
    window.location.href = "/views/tutorial/tutorial.html";
  };
  
  console.log("✅ Tutorial button setup complete");
}

// Update bookmark button state
async function updateBookmarkBtn(game) {
  const bookmarkBtn = document.getElementById("bookmark-btn");
  if (!bookmarkBtn) return;

  const user = auth.currentUser;
  if (!user) {
    // User not logged in - show login prompt
    bookmarkBtn.innerHTML =
      '<i class="fa-regular fa-bookmark mr-3 text-gray-400"></i>Login to Bookmark';
    bookmarkBtn.onclick = () => {
      window.location.href = "/views/auth/login.html";
    };
    return;
  }

  try {
    // Check if game is bookmarked
    const bookmarkRef = doc(db, "users", user.uid, "bookmarks", game.id);
    const bookmarkDoc = await getDoc(bookmarkRef);
    const isBookmarked = bookmarkDoc.exists();

    // Update button appearance and functionality
    if (isBookmarked) {
      bookmarkBtn.innerHTML =
        '<i class="fa-solid fa-bookmark mr-3 text-[#F1647A]"></i>Bookmarked';
      bookmarkBtn.onclick = async () => {
        if (confirm(`Remove "${game.name}" from bookmarks?`)) {
          try {
            await deleteDoc(bookmarkRef);
            console.log("Bookmark removed successfully");
            updateBookmarkBtn(game); // Re-fetch and update button state after deletion
          } catch (error) {
            console.error("Error removing bookmark:", error);
            alert("Failed to remove bookmark. Please try again.");
          }
        }
      };
    } else {
      bookmarkBtn.innerHTML =
        '<i class="fa-regular fa-bookmark mr-3 text-gray-400"></i>Bookmark';
      bookmarkBtn.onclick = async () => {
        try {
          await setDoc(bookmarkRef, {
            gameId: game.id,
            title: game.name,
            image: game.image || game.thumbnail,
          });
          console.log("Game bookmarked successfully");
          updateBookmarkBtn(game); // Re-fetch and update button state after addition
        } catch (error) {
          console.error("Error adding bookmark:", error);
          alert("Failed to add bookmark. Please try again.");
        }
      };
    }
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    bookmarkBtn.innerHTML =
      '<i class="fa-regular fa-bookmark mr-3 text-gray-400"></i>Bookmark';
  }
}

function setupPDFModal() {
  const modal = document.getElementById("pdf-modal");
  const closeBtn = document.getElementById("close-pdf-modal");
  const closeBtnBottom = document.getElementById("close-pdf-modal-btn");

  if (!modal) return;

  [closeBtn, closeBtnBottom].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", closePDFModal);
    }
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closePDFModal();
    }
  });
}

function openPDFPreview(pdfUrl, gameName) {
  console.log("Opening PDF preview:", pdfUrl);

  const modal = document.getElementById("pdf-modal");
  const viewer = document.getElementById("pdf-viewer");
  const downloadBtn = document.getElementById("download-pdf");

  if (!modal || !viewer) return;

  // Set up PDF viewer
  viewer.src = pdfUrl;

  // Set up download button
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${gameName}-rules.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }

  // Show modal
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePDFModal() {
  const modal = document.getElementById("pdf-modal");
  const viewer = document.getElementById("pdf-viewer");

  if (!modal || !viewer) return;

  modal.classList.add("hidden");
  viewer.src = "";
  document.body.style.overflow = "auto";
}

// Home Page Functions
function setupHomePage() {
  console.log("🏠 Setting up home page...");
  loadHomeGames();
  setupHomeGamesRetry();
}

async function loadHomeGames() {
  const loadingDiv = document.getElementById("home-games-loading");
  const errorDiv = document.getElementById("home-games-error");
  const gamesContainer = document.getElementById("home-games-container");

  if (!loadingDiv || !errorDiv || !gamesContainer) return;

  try {
    // Show loading state
    loadingDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
    gamesContainer.classList.add("hidden");

    console.log("🎮 Loading games for home page from Firebase...");

    // Load games data from Firebase
    const games = await getGamesFromFirebase();
    console.log(`✅ Loaded ${games.length} games for home page from Firebase`);

    // Hide loading and show games
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");

    // Render games (show first 7 for home page)
    renderHomeGames(games.slice(0, 7));
  } catch (error) {
    console.error("❌ Error loading home games:", error);

    // Show error state
    loadingDiv.classList.add("hidden");
    errorDiv.classList.remove("hidden");
    gamesContainer.classList.add("hidden");
  }
}

function renderHomeGames(games) {
  const gamesList = document.getElementById("home-games-list");

  if (!gamesList || !games.length) return;

  // Create game cards with similar styling to existing cards
  gamesList.innerHTML = games.map((game) => createHomeGameCard(game)).join("");

  // Add click handlers for game cards
  setupHomeGameCardClickHandlers();

  console.log(`🎮 Rendered ${games.length} games on home page`);
}

function createHomeGameCard(game) {
  const imageUrl =
    game.image || game.thumbnail || "../../src/asset/images/placeholder.png";

  return `
    <div class="relative cursor-pointer home-game-card" data-game-id="${game.id}">
      <div class="absolute inset-0 opacity-50 rounded-[30px] transform translate-x-4 translate-y-4 blur-lg z-0"></div>
      <div class="relative bg-gray-300 rounded-[30px] shadow flex-shrink-0 overflow-hidden flex flex-col justify-center items-center w-[250px] h-[400px] bg-cover bg-center bg-no-repeat z-10" 
           style="background-image: url('${imageUrl}');">
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-[30px]">
          <h4 class="text-white text-lg font-bold mb-1 truncate">${game.name}</h4>
          <p class="text-gray-300 text-sm">${game.minPlayers}-${game.maxPlayers} players • ${game.playingTime}min</p>
        </div>
      </div>
    </div>
  `;
}

function setupHomeGameCardClickHandlers() {
  const gameCards = document.querySelectorAll(".home-game-card");
  console.log(
    `🎯 Setting up click handlers for ${gameCards.length} home game cards`
  );

  gameCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const gameId = card.dataset.gameId;
      console.log(`🎮 Home game card clicked: ${gameId}`);

      // Navigate to game details page with the game ID
      console.log(
        `✅ Navigating to: /views/game/game-details.html?id=${gameId}`
      );
      window.location.href = `/views/game/game-details.html?id=${gameId}`;
    });
  });
}

function setupHomeGamesRetry() {
  const retryBtn = document.getElementById("retry-games");
  if (retryBtn) {
    retryBtn.addEventListener("click", loadHomeGames);
  }
}

// Initialize based on current page
document.addEventListener("DOMContentLoaded", function () {
  setupSearchToggle();
  setupSeedButton();

  // Setup page-specific functionality
  if (document.getElementById("games-container")) {
    setupGamesPage();
  }

  if (document.getElementById("game-title")) {
    setupGameDetailsPage();
  }

  // Setup home page games if on home page
  if (document.getElementById("home-games-container")) {
    setupHomePage();
  }
});

// SHARE GAME DETAILS FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.getElementById("share-btn");

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      const title = document.title;
      const text =
        document.querySelector("#detailed-description")?.innerText ||
        "Check out this game!";

      // Use Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: url,
          });
        } catch (err) {
          console.error("Share failed:", err);
        }
      } else {
        // Fallback: just show an alert with the URL
        alert(`Share this game: ${url}`);
      }
    });
  }
});

// Tutorial Video System Implementation
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - checking for tutorial page...");

  // Only run on tutorial page
  if (!document.querySelector(".tutorial-1")) {
    console.log("Tutorial page not found, skipping tutorial initialization");
    return;
  }

  console.log("Tutorial page found, initializing...");

  const playButton = document.querySelector(".play-buttons");
  const videos = document.querySelectorAll(".tutorial-1 video");
  const videoControls = document.getElementById("video-controls");
  const replayBtn = document.getElementById("replay-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const introText = document.getElementById("text-tutorial-intro");
  const backgroundImage = document.querySelector(".tutorial-1 img");

  let currentIndex = 0;
  let isPlaying = false;

  // Initialize tutorial system
  function initTutorial() {
    console.log("Initializing tutorial system...");
    console.log("Play button found:", !!playButton);
    console.log("Videos found:", videos.length);
    console.log("Video controls found:", !!videoControls);
    console.log("Replay button found:", !!replayBtn);
    console.log("Next button found:", !!nextBtn);
    console.log("Prev button found:", !!prevBtn);
    console.log("Intro text found:", !!introText);
    console.log("Background image found:", !!backgroundImage);

    if (!playButton || !videos.length) {
      console.warn("Tutorial elements not found");
      return;
    }

    // Set up event listeners
    playButton.addEventListener("click", function (e) {
      console.log("Play button clicked!");
      // alert("Play button clicked! Starting tutorial...");
      startTutorial();
    });
    replayBtn.addEventListener("click", replayCurrentVideo);
    nextBtn.addEventListener("click", nextVideo);
    prevBtn.addEventListener("click", previousVideo);

    // Set up video event listeners for auto-advance
    videos.forEach((video, index) => {
      video.addEventListener("ended", () => {
        if (index < videos.length - 1) {
          currentIndex = index + 1;
          showVideo(currentIndex);
        }
      });
    });

    // Update button states
    updateButtonStates();
  }

  // Start tutorial - hide intro, show first video
  function startTutorial() {
    console.log("Starting tutorial...");
    isPlaying = true;

    // Hide intro elements
    console.log("Hiding intro elements...");
    playButton.parentElement.style.display = "none";
    introText.style.display = "none";
    backgroundImage.style.display = "none";

    // Show first video and controls
    console.log("Showing first video...");
    showVideo(0);
  }

  // Show specific video
  function showVideo(index) {
    console.log("Showing video at index:", index);
    if (index < 0 || index >= videos.length) {
      console.warn("Invalid video index:", index);
      return;
    }

    currentIndex = index;

    // Hide all videos first
    videos.forEach((video, i) => {
      if (i === index) {
        console.log("Showing video", i);
        video.classList.remove("hidden");
        video.play().catch((err) => {
          console.warn("Video play failed:", err);
          console.log("Video src:", video.querySelector("source")?.src);
        });
      } else {
        video.pause();
        video.classList.add("hidden");
      }
    });

    // Show controls
    console.log("Showing video controls");
    videoControls.classList.remove("hidden");

    // Update button states
    updateButtonStates();
  }

  // Replay current video
  function replayCurrentVideo() {
    if (videos[currentIndex]) {
      videos[currentIndex].currentTime = 0;
      videos[currentIndex]
        .play()
        .catch((err) => console.warn("Video replay failed:", err));
    }
  }

  // Next video
  function nextVideo() {
    if (currentIndex < videos.length - 1) {
      currentIndex++;
      showVideo(currentIndex);
    }
  }

  // Previous video or back to intro
  function previousVideo() {
    if (currentIndex > 0) {
      // Go to previous video
      currentIndex--;
      showVideo(currentIndex);
    } else {
      // Return to intro screen
      returnToIntro();
    }
  }

  // Return to intro screen
  function returnToIntro() {
    isPlaying = false;

    // Stop and hide all videos
    videos.forEach((video) => {
      video.pause();
      video.classList.add("hidden");
    });

    // Hide controls
    videoControls.classList.add("hidden");

    // Show intro elements
    playButton.parentElement.style.display = "flex";
    introText.style.display = "block";
    backgroundImage.style.display = "block";

    // Reset to first video
    currentIndex = 0;
  }

  // Update button states based on current position
  function updateButtonStates() {
    // Previous button - always enabled (can go back to intro)
    prevBtn.disabled = false;

    // Next button - disabled on last video
    nextBtn.disabled = currentIndex >= videos.length - 1;

    // Replay button - always enabled when video is playing
    replayBtn.disabled = !isPlaying;
  }

  // Initialize the tutorial system
  initTutorial();
});

// Loading Games in the Continue Learning boxes
async function resistance() {
  try {
    // const resp = await fetch("./data/top-games.json");
    const resp = await fetch("../../Server/data/top-games.json");
    const games = await resp.json();

    const game = games.find((g) => g.name === "The Resistance");

    if (!game) {
      console.warn("The Resistance was not found in games data");
      return;
    }

    //adding image of the game in the box
    const divBox = document.querySelector(".resistance-box");
    if (divBox) {
      divBox.innerHTML = `<img src="${game.thumbnail}" alt="${game.name}" class="w-full h-full object-cover rounded-2xl"/>`;
    }

    //adding description
    const desc = document.getElementById("resistance-desc");
    if (desc) {
      desc.textContent = game.description || "No description available";
    }

    //Tutorial button
    const tutorialBtn = document.getElementById("resistance-tutorial");
    if (tutorialBtn) {
      tutorialBtn.addEventListener("click", () => {
        if (game.rulebook) window.open(game.rulebook, "_blank");
      });
    }
  } catch (err) {
    console.error("failed to load game:", err);
  }
}
document.addEventListener("DOMContentLoaded", resistance);
document.addEventListener("DOMContentLoaded", () => {
  renderTrendingEvents();
  renderUpcomingEvents();
});

async function renderTrendingEvents() {
  const grid = document.getElementById("trendingEventsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  let q;
  try {
    // Try to order by 'popularity' field if it exists
    q = query(
      collection(db, "events"),
      orderBy("popularity", "desc"),
      limit(12)
    );
    let snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Fallback: order by most recent
      q = query(
        collection(db, "events"),
        orderBy("start_time", "desc"),
        limit(12)
      );
      snapshot = await getDocs(q);
    }
    snapshot.forEach((docSnap) => {
      const event = docSnap.data();
      const card = document.createElement("div");
      card.className =
        "relative cursor-pointer flex-shrink-0 w-[45vw] sm:w-[200px] md:w-[250px] h-[320px] sm:h-[380px] md:h-[400px]";
      card.innerHTML = `
  <div class="absolute inset-0 opacity-50 rounded-[30px] translate-x-4 translate-y-4 blur-lg z-0"></div>
  <div
    class="relative bg-gray-300 rounded-[30px] shadow flex-shrink-0 overflow-hidden flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat z-10 w-full h-full"
    style="background-image: url('${
      event.image_url || "../../src/asset/images/fea-cal-1.png"
    }');"
  ></div>
`;

      card.onclick = () => {
        window.location.href = `/views/event/post-event-details.html?id=${docSnap.id}`;
      };
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class='text-gray-400'>Failed to load trending events.</p>`;
  }
}

async function renderUpcomingEvents() {
  const grid = document.getElementById("upcomingEventsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  try {
    const q = query(
      collection(db, "events"),
      orderBy("start_time", "asc"),
      limit(12)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      const event = docSnap.data();
      const card = document.createElement("div");
      card.className =
        "relative cursor-pointer flex-shrink-0 w-[45vw] sm:w-[200px] md:w-[250px] h-[320px] sm:h-[380px] md:h-[400px]";
      card.innerHTML = `
  <div class="absolute inset-0 opacity-50 rounded-[30px] translate-x-4 translate-y-4 blur-lg z-0"></div>
  <div
    class="relative bg-gray-300 rounded-[30px] shadow flex-shrink-0 overflow-hidden flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat z-10 w-full h-full"
    style="background-image: url('${
      event.image_url || "../../src/asset/images/fea-cal-1.png"
    }');"
  ></div>
`;
      card.onclick = () => {
        window.location.href = `/views/event/post-event-details.html?id=${docSnap.id}`;
      };
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class='text-gray-400'>Failed to load upcoming events.</p>`;
  }
}

function getGameIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getCurrentUser() {
  // Use your existing auth logic or fallback
  return auth.currentUser
    ? {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
      }
    : null;
}

function setupGameComments() {
  const gameId = getGameIdFromUrl();
  const commentInput = document.getElementById("gameCommentInput");
  const postCommentBtn = document.getElementById("gamePostCommentBtn");
  const gameCommentGrid = document.getElementById("gameCommentGrid");

  if (!gameId) {
    commentInput.disabled = true;
    postCommentBtn.disabled = true;
    postCommentBtn.textContent = "No Game Selected";
    return;
  }

  commentInput.disabled = false;
  postCommentBtn.disabled = false;
  postCommentBtn.textContent = "Add Comment";

  postCommentBtn.onclick = async () => {
    const user = getCurrentUser();
    const text = commentInput.value.trim();
    if (!user) {
      alert("Sign in to comment");
      return;
    }
    if (!text) return;
    postCommentBtn.disabled = true;
    await postGameComment(gameId, text, user);
    commentInput.value = "";
    postCommentBtn.disabled = false;
  };

  listenForGameComments(gameId, (comments) => {
    renderGameComments(comments, gameCommentGrid);
  });
}

async function postGameComment(gameId, text, user) {
  const commentsCol = collection(db, "games", gameId, "comments");
  await addDoc(commentsCol, {
    text,
    userId: user.userId,
    userEmail: user.email,
    userName: user.email?.split("@")[0] || user.userId,
    createdAt: serverTimestamp(),
  });
}

function listenForGameComments(gameId, callback) {
  const commentsCol = collection(db, "games", gameId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => comments.push({ id: doc.id, ...doc.data() }));
    callback(comments);
  });
}

function renderGameComments(comments, grid) {
  // Preserve the comment input box (assumed to be the first child)
  const inputBox = grid.querySelector(".bg-gradient-to-b");
  grid.innerHTML = "";
  if (inputBox) grid.appendChild(inputBox);

  if (!comments.length) {
    const noComments = document.createElement("div");
    noComments.className = "col-span-full text-gray-400 text-center";
    noComments.textContent = "No comments yet.";
    grid.appendChild(noComments);
    return;
  }
  comments.forEach((comment) => {
    if (!comment.text || !comment.text.trim()) return; // Skip empty comments

    // Prioritize userName, then userEmail, then fallback to Anonymous
    const user =
      comment.userName ||
      (comment.userEmail ? comment.userEmail.split("@")[0] : "") ||
      "Anonymous";

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user
    )}&background=random`;

    // Outer wrapper with gradient border using inline style
    const wrapper = document.createElement("div");
    wrapper.className = "p-[2px] rounded-2xl h-full";
    wrapper.style.background = "linear-gradient(to right, #f59275, #f1647a)";

    // Inner content box
    const div = document.createElement("div");
    div.className =
      "rounded-2xl p-5 bg-[#23243a] shadow-md bg-clip-padding relative h-full";
    div.innerHTML = `
    <div class="flex items-start gap-4 mb-3">
      <img src="${avatarUrl}" alt="${user}" class="w-10 h-10 rounded-full object-cover shrink-0" />
      <span class="text-white font-semibold text-sm break-words overflow-hidden w-full block">${user}</span>
    </div>
    <p class="text-gray-300 text-sm break-words whitespace-pre-line">${comment.text}</p>
  `;

    // Nest and append
    wrapper.appendChild(div);
    gameCommentGrid.appendChild(wrapper);
  });
}

async function renderSuggestedGames() {
  const section = document.getElementById("suggestedGamesSection");
  const grid = document.getElementById("suggestedGamesGrid");
  if (!grid || !section) return;

  grid.innerHTML = "";
  const user = getCurrentUser();
  const currentGameId = getGameIdFromUrl();

  if (!user || !user.userId) {
    section.style.display = "none";
    return;
  }

  // Fetch user categories from preferences
  let userDoc;
  try {
    userDoc = await getDoc(doc(db, "users", user.userId));
  } catch (e) {
    console.error("Error fetching user document:", e);
    userDoc = null;
  }

  const categories = userDoc?.exists() ? userDoc.data().categories || [] : [];

  // If user has no categories, hide the suggested games section
  if (!categories || categories.length === 0) {
    section.style.display = "none";
    return;
  }

  // Show the section if user has categories
  section.style.display = "";

  // Fetch bookmarks
  let bookmarksSnap;
  try {
    bookmarksSnap = await getDocs(
      collection(db, "users", user.userId, "bookmarks")
    );
  } catch (e) {
    console.error("Error fetching bookmarks:", e);
    bookmarksSnap = { docs: [] };
  }
  const bookmarkedIds = bookmarksSnap.docs.map((d) => d.id);

  // Fetch tutorials watched (optional, fallback to empty array)
  let tutorialsWatched = [];
  if (userDoc?.exists() && userDoc.data().tutorialsWatched) {
    tutorialsWatched = userDoc.data().tutorialsWatched;
  }

  // Collect all prioritized game IDs
  const prioritizedIds = Array.from(
    new Set([...bookmarkedIds, ...tutorialsWatched])
  );

  // Fetch all games from Firebase
  let games = [];
  try {
    games = await getGamesFromFirebase();
  } catch (e) {
    console.error("Error fetching games:", e);
    grid.innerHTML =
      '<p class="text-gray-400">Failed to load suggested games.</p>';
    return;
  }

  // Remove current game from suggestions
  games = games.filter((g) => g.id !== currentGameId);

  // Prioritize: bookmarks & tutorials first, then category matches
  const prioritizedGames = games.filter((g) => prioritizedIds.includes(g.id));
  const categoryGames = games.filter(
    (g) =>
      !prioritizedIds.includes(g.id) &&
      g.categories &&
      g.categories.some((cat) => categories.includes(cat))
  );

  // Combine and limit
  const suggested = [...prioritizedGames, ...categoryGames].slice(0, 10);

  if (!suggested.length) {
    grid.innerHTML =
      '<p class="text-gray-400">No games found matching your preferences.</p>';
    return;
  }

  // Render suggested games
  suggested.forEach((game) => {
    const card = document.createElement("div");
    card.className =
      "rounded-2xl overflow-hidden shadow bg-white flex-shrink-0 cursor-pointer hover:scale-105 transition-transform";
    card.style.width = "180px";
    card.style.height = "180px";
    card.innerHTML = `
      <img src="${
        game.image || game.thumbnail || "../../src/asset/images/placeholder.png"
      }" 
           alt="${game.name}" 
           class="w-full h-full object-cover" />
    `;
    card.onclick = () => {
      localStorage.setItem("selectedGame", JSON.stringify(game));
      window.location.href = `game-details.html?id=${game.id}`;
    };
    grid.appendChild(card);
  });
}
