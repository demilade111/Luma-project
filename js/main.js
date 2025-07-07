import { db, auth } from "../config/firebase.js";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

    console.log("🎮 Loading games from API...");

    // Get gameService from window (since it's loaded as a script tag)
    const gameService =
      window.gameService ||
      (typeof gameService !== "undefined" ? gameService : null);

    if (!gameService) {
      throw new Error("Game service not available");
    }

    const result = await gameService.getAllGames();

    if (!result.success) {
      throw new Error(result.error || "Failed to load games");
    }

    allGamesData = result.games;
    console.log(allGamesData);
    currentPage = 1;
    console.log(`✅ Loaded ${allGamesData.length} games`);

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
        <button id="view-more-games" class="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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

      // Redirect to game details page
      window.location.href = "./game-details.html";
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

    const gameService = window.gameService;
    if (!gameService) {
      throw new Error("Game service not available");
    }

    const result = await gameService.getGamesByCategory(category);

    if (!result.success) {
      throw new Error(result.error || "Failed to filter games");
    }

    console.log(
      `✅ Found ${result.games.length} games in category: ${category}`
    );

    // Hide loading and show games
    loadingDiv.classList.add("hidden");
    gamesContainer.classList.remove("hidden");

    // Render filtered games
    const gamesContainerElement = document.getElementById("games-container");
    if (gamesContainerElement) {
      gamesContainerElement.innerHTML = result.games
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
  const truncatedDescription =
    description.length > 150
      ? description.substring(0, 147) + "..."
      : description;

  return `
    <div class="flex items-center gap-4 overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer game-card" 
         data-game-id="${gameId}" 
         data-game-data='${JSON.stringify(game).replace(/'/g, "&apos;")}'>
      <div class="w-48 h-48 border rounded-2xl shrink-0 overflow-hidden bg-gray-100">
        ${
          image
            ? `<img src="${image}" alt="${name}" class="w-full h-full object-cover" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
           <div class="w-full h-full flex items-center justify-center text-gray-400" style="display:none;">
             <i class="fas fa-dice text-3xl"></i>
           </div>`
            : `<div class="w-full h-full flex items-center justify-center text-gray-400">
             <i class="fas fa-dice text-3xl"></i>
           </div>`
        }
      </div>
      
      <div class="p-4 flex flex-col justify-between items-start flex-1">
        <div class="w-full">
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-lg font-semibold text-gray-800">${name}</h2>
            ${year ? `<span class="text-sm text-gray-500">${year}</span>` : ""}
          </div>
          
          <p class="text-base text-gray-600 mb-3 leading-relaxed">
            ${truncatedDescription}
          </p>
          
          ${
            categories.length > 0
              ? `<div class="flex flex-wrap gap-1 mb-3">
              ${categories
                .slice(0, 3)
                .map(
                  (cat) =>
                    `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full category-tag cursor-pointer hover:bg-blue-200" 
                       data-category="${cat}">${cat}</span>`
                )
                .join("")}
            </div>`
              : ""
          }
          
          <div class="flex items-center gap-6 text-sm text-gray-600">
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
                <i class="fas fa-star text-yellow-400"></i>
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

function setupGamesPage() {
  // Only run on games page
  if (!document.getElementById("games-container")) return;

  console.log("🎮 Setting up games page...");

  // Load games
  loadGames();

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

window.addEventListener("components-injected", () => {
  console.log("Components injected event fired");
  setupSearchToggle();
  setupSeedButton();
  setupGamesPage();
  setupGameDetailsPage();

  // Initialize games page swiper
  if (document.querySelector(".swiper")) {
    new Swiper(".swiper", {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 20,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
        },
        1024: {
          slidesPerView: 1,
        },
      },
    });
  }
});

// Game Details Page Functions
function setupGameDetailsPage() {
  // Only run on game details page
  if (!document.getElementById("game-title")) return;

  console.log("🎮 Setting up game details page...");

  loadGameDetails();
  setupPDFModal();
}

function loadGameDetails() {
  const gameData = localStorage.getItem("selectedGame");

  if (!gameData) {
    console.error("No game data found");
    document.getElementById("game-title").textContent = "Game not found";
    return;
  }

  const game = JSON.parse(gameData);
  console.log("Loading game details:", game);

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
  document.getElementById("game-description").textContent =
    game.description || "No description available";

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
      .map((publisher) => `<p class="text-base text-gray-400">${publisher}</p>`)
      .join("");
  } else {
    document.getElementById("publishers-list").innerHTML =
      '<p class="text-custom-gray text-2xl">Unknown</p>';
  }

  // Update categories
  if (game.categories && game.categories.length > 0) {
    document.getElementById("categories-list").innerHTML = game.categories
      .map(
        (category) =>
          `<span style="box-shadow: -3px -3px 8px -3px rgba(255, 255, 255, 0.8)" class="inline-flex items-center mr-6 bg-[#2F364A] rounded-xl p-3 border text-gray-200 border-gray-700 gap-3 w-fit whitespace-nowrap min-w-[140px] justify-center">${category}</span>`
      )
      .join("");
  } else {
    document.getElementById("categories-list").innerHTML =
      '<p class="text-custom-gray text-2xl">None specified</p>';
  }

  // Update detailed description
  document.getElementById("detailed-description").textContent =
    game.description || "No detailed description available";

  // Setup rules button
  const rulesBtn = document.getElementById("rules-btn");
  if (game.rulebook && rulesBtn) {
    rulesBtn.onclick = () => openPDFPreview(game.rulebook, game.name);
  } else if (rulesBtn) {
    rulesBtn.disabled = true;
    rulesBtn.textContent = "Rules N/A";
    rulesBtn.classList.add("opacity-50", "cursor-not-allowed");
  }

  // Setup tutorial button for The Night Cage
  const tutorialBtn = document.getElementById("tutorial-btn");
  if (tutorialBtn) {
    if (game.name && game.name.toLowerCase() === "the night cage") {
      tutorialBtn.onclick = () => {
        window.location.href = "night-cage-tutorial.html";
      };
    } else {
      tutorialBtn.onclick = null;
      tutorialBtn.classList.add("opacity-50", "cursor-not-allowed");
      tutorialBtn.disabled = true;
    }
  }

  // --- Bookmark and Share logic ---
  const bookmarkBtn = document.getElementById("bookmark-btn");
  const shareBtn = document.getElementById("share-btn");
  let currentUser = null;
  let isBookmarked = false;

  function updateBookmarkBtn() {
    if (!bookmarkBtn) return;
    if (isBookmarked) {
      bookmarkBtn.innerHTML =
        '<i class="fa-solid fa-bookmark m-2 text-yellow-400"></i>Bookmarked';
    } else {
      bookmarkBtn.innerHTML =
        '<i class="fa-regular fa-bookmark m-2 text-gray-500"></i>Bookmark';
    }
  }

  async function checkBookmark(user) {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "bookmarks", game.id);
    const snap = await getDoc(docRef);
    isBookmarked = snap.exists();
    updateBookmarkBtn();
  }

  async function toggleBookmark(user) {
    if (!user) {
      alert("Please sign in to bookmark games.");
      return;
    }
    const docRef = doc(db, "users", user.uid, "bookmarks", game.id);
    if (isBookmarked) {
      await deleteDoc(docRef);
      isBookmarked = false;
      updateBookmarkBtn();
      alert("Bookmark removed.");
    } else {
      const info = {
        gameId: game.id,
        title: game.name,
        image: game.image || game.thumbnail || "",
      };
      await setDoc(docRef, info);
      isBookmarked = true;
      updateBookmarkBtn();
      alert("Game bookmarked successfully!");
    }
  }

  if (bookmarkBtn) {
    bookmarkBtn.onclick = () => {
      if (!currentUser) {
        alert("Please sign in to bookmark games.");
        return;
      }
      toggleBookmark(currentUser);
    };
  }

  if (shareBtn) {
    shareBtn.onclick = async () => {
      const url = window.location.href;
      const title = game.name || "Check out this game!";
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
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

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      checkBookmark(user);
    } else {
      isBookmarked = false;
      updateBookmarkBtn();
    }
  });
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

    console.log("🎮 Loading games for home page...");

    // Get gameService from window
    const gameService =
      window.gameService ||
      (typeof gameService !== "undefined" ? gameService : null);

    if (!gameService) {
      throw new Error("Game service not available");
    }

    const result = await gameService.getAllGames();

    if (!result.success) {
      throw new Error(result.error || "Failed to load games");
    }

    const games = result.games;
    console.log(`✅ Loaded ${games.length} games for home page`);

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

  gameCards.forEach((card) => {
    card.addEventListener("click", () => {
      const gameId = card.dataset.gameId;

      // Get the game data and store in localStorage
      const gameService = window.gameService;
      if (gameService) {
        gameService.getGameById(gameId).then((result) => {
          if (result.success) {
            localStorage.setItem("selectedGame", JSON.stringify(result.game));
            window.location.href = "../game/game-details.html";
          }
        });
      }
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
  const shareBtn = document.getElementById("shareBtn");
  const links = document.getElementById("share-links");
  const fb = document.getElementById("share-facebook");
  const tw = document.getElementById("share-twitter");

  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const text = encodeURIComponent(
    document.querySelector("#game-description")?.innerText || ""
  );

  // Fallback share URLs
  fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  tw.href = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;

  shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      links.classList.toggle("hidden");
    }
  });
});

// BOOKMARK FUNCTIONALITY
document.getElementById(`DOMContentLoad`, () => {
  const btn = document.getElementById(`tutorialPage`);
  btn.addEventListener(`click`, () => {
    window.location.href = `tutorial.html`;
  });
});
