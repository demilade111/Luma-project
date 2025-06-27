const axios = require("axios");
const xml2js = require("xml2js");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const path = require("path");

// List of board games to fetch
const gameNames = [
  "Catan",
  "Carcassonne",
  "Dominion",
  "7 Wonders",
  "Gloomhaven",
  "Azul",
  "Splendor",
  "Wingspan",
  "The Resistance",
  "King of Tokyo",
  "Ticket to Ride",
  "Pandemic",
  "Scythe",
  "Terraforming Mars",
  "Codenames",
  "Spirit Island",
  "Machi Koro",
  "Agricola",
  "Power Grid",
  "Blood Rage",
];

// Delay function to avoid rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to search for game on BGG and get ID
async function searchBGG(gameName) {
  try {
    console.log(`Searching BGG for: ${gameName}`);
    const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(
      gameName
    )}`;
    const response = await axios.get(searchUrl);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    if (result.items && result.items.item && result.items.item.length > 0) {
      // Get the first matching game's ID
      const gameId = result.items.item[0].$.id;
      console.log(`Found BGG ID for ${gameName}: ${gameId}`);
      return gameId;
    }

    console.log(`No BGG results found for: ${gameName}`);
    return null;
  } catch (error) {
    console.error(`Error searching BGG for ${gameName}:`, error.message);
    return null;
  }
}

// Function to get detailed game info from BGG
async function getGameDetails(gameId) {
  try {
    console.log(`Fetching details for BGG ID: ${gameId}`);
    const detailUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`;
    const response = await axios.get(detailUrl);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    if (result.items && result.items.item && result.items.item.length > 0) {
      const item = result.items.item[0];

      // Extract primary name
      const names = Array.isArray(item.name) ? item.name : [item.name];
      const primaryName =
        names.find((name) => name.$.type === "primary")?.$.value ||
        names[0]?.$.value;

      // Extract basic details
      const year = item.yearpublished?.[0]?.$.value || "";
      const minPlayers = item.minplayers?.[0]?.$.value || "";
      const maxPlayers = item.maxplayers?.[0]?.$.value || "";
      const playingTime = item.playingtime?.[0]?.$.value || "";
      const minPlayTime = item.minplaytime?.[0]?.$.value || "";
      const maxPlayTime = item.maxplaytime?.[0]?.$.value || "";
      
      // Extract images
      const image = item.image?.[0] || "";
      const thumbnail = item.thumbnail?.[0] || "";
      
      // Extract description and clean HTML tags
      let description = item.description?.[0] || "";
      if (description) {
        // Remove HTML tags and decode entities
        description = description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
        // Limit description length
        if (description.length > 500) {
          description = description.substring(0, 497) + '...';
        }
      }
      
      // Extract ratings and statistics
      const statistics = item.statistics?.[0]?.ratings?.[0];
      const rating = statistics?.average?.[0]?.$.value || "";
      const ratingCount = statistics?.usersrated?.[0]?.$.value || "";
      const complexity = statistics?.averageweight?.[0]?.$.value || "";
      const rank = statistics?.ranks?.[0]?.rank?.find(r => r.$.name === 'boardgame')?.$.value || "";
      
      // Extract categories
      const categories = [];
      if (item.link) {
        const categoryLinks = Array.isArray(item.link) ? item.link : [item.link];
        categoryLinks.forEach(link => {
          if (link.$.type === 'boardgamecategory') {
            categories.push(link.$.value);
          }
        });
      }
      
      // Extract mechanics
      const mechanics = [];
      if (item.link) {
        const mechanicLinks = Array.isArray(item.link) ? item.link : [item.link];
        mechanicLinks.forEach(link => {
          if (link.$.type === 'boardgamemechanic') {
            mechanics.push(link.$.value);
          }
        });
      }
      
      // Extract designers
      const designers = [];
      if (item.link) {
        const designerLinks = Array.isArray(item.link) ? item.link : [item.link];
        designerLinks.forEach(link => {
          if (link.$.type === 'boardgamedesigner') {
            designers.push(link.$.value);
          }
        });
      }
      
      // Extract publishers
      const publishers = [];
      if (item.link) {
        const publisherLinks = Array.isArray(item.link) ? item.link : [item.link];
        publisherLinks.forEach(link => {
          if (link.$.type === 'boardgamepublisher') {
            publishers.push(link.$.value);
          }
        });
      }
      
      // Extract age recommendation
      const age = item.age?.[0]?.$.value || "";

      return {
        id: gameId,
        name: primaryName,
        year: year,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        playingTime: playingTime,
        minPlayTime: minPlayTime,
        maxPlayTime: maxPlayTime,
        age: age,
        image: image,
        thumbnail: thumbnail,
        description: description,
        rating: rating ? parseFloat(rating).toFixed(1) : "",
        ratingCount: ratingCount,
        complexity: complexity ? parseFloat(complexity).toFixed(1) : "",
        rank: rank && rank !== 'Not Ranked' ? rank : "",
        categories: categories.slice(0, 5), // Limit to top 5 categories
        mechanics: mechanics.slice(0, 5), // Limit to top 5 mechanics
        designers: designers.slice(0, 3), // Limit to top 3 designers
        publishers: publishers.slice(0, 3), // Limit to top 3 publishers
      };
    }

    console.log(`No details found for BGG ID: ${gameId}`);
    return null;
  } catch (error) {
    console.error(
      `Error fetching details for BGG ID ${gameId}:`,
      error.message
    );
    return null;
  }
}

// Function to search for rulebook on 1jour-1jeu.com
async function findRulebook(gameName) {
  try {
    console.log(`Searching for rulebook: ${gameName}`);
    const searchUrl = `https://en.1jour-1jeu.com/rules/search?q=${encodeURIComponent(
      gameName
    )}`;

    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Look for the first search result link
    const firstResultLink =
      $(".search-result a").first().attr("href") ||
      $(".result-item a").first().attr("href") ||
      $('a[href*="/rules/"]').first().attr("href");

    if (firstResultLink) {
      let fullUrl = firstResultLink;
      if (firstResultLink.startsWith("/")) {
        fullUrl = `https://en.1jour-1jeu.com${firstResultLink}`;
      }

      console.log(`Found result page: ${fullUrl}`);

      // Visit the result page to find PDF link
      const detailResponse = await axios.get(fullUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $detail = cheerio.load(detailResponse.data);

      // Look for PDF links
      const pdfLink =
        $detail('a[href$=".pdf"]').first().attr("href") ||
        $detail('a[href*=".pdf"]').first().attr("href");

      if (pdfLink) {
        let fullPdfUrl = pdfLink;
        if (pdfLink.startsWith("/")) {
          fullPdfUrl = `https://en.1jour-1jeu.com${pdfLink}`;
        }
        console.log(`Found rulebook PDF: ${fullPdfUrl}`);
        return fullPdfUrl;
      }
    }

    console.log(`No rulebook found for: ${gameName}`);
    return null;
  } catch (error) {
    console.error(
      `Error searching for rulebook for ${gameName}:`,
      error.message
    );
    return null;
  }
}

// Main function to process all games
async function generateTopGames() {
  console.log("Starting to generate top-games.json...\n");

  const results = [];

  for (const gameName of gameNames) {
    try {
      console.log(`\n--- Processing: ${gameName} ---`);

      // Step 1: Search BGG for game ID
      const gameId = await searchBGG(gameName);
      await delay(1000); // Rate limiting

      if (!gameId) {
        console.log(`Skipping ${gameName} - no BGG ID found`);
        continue;
      }

      // Step 2: Get detailed game info
      const gameDetails = await getGameDetails(gameId);
      await delay(1000); // Rate limiting

      if (!gameDetails) {
        console.log(`Skipping ${gameName} - no details found`);
        continue;
      }

      // Step 3: Search for rulebook
      const rulebook = await findRulebook(gameName);
      await delay(2000); // Longer delay for web scraping

      // Step 4: Combine all data
      const gameData = {
        ...gameDetails,
        rulebook: rulebook || null,
      };

      results.push(gameData);
      console.log(`Successfully processed: ${gameName}`);
    } catch (error) {
      console.error(`Error processing ${gameName}:`, error.message);
      continue; // Continue with next game
    }
  }

  // Step 5: Save to JSON file
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, "data");
    await fs.mkdir(dataDir, { recursive: true });

    // Save JSON file
    const outputPath = path.join(dataDir, "top-games.json");
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log(
      `\n✅ Successfully saved ${results.length} games to ${outputPath}`
    );
    console.log("\nSample of generated data:");
    console.log(JSON.stringify(results.slice(0, 2), null, 2));
  } catch (error) {
    console.error("Error saving file:", error.message);
  }
}

// Run the script
if (require.main === module) {
  generateTopGames().catch(console.error);
}

module.exports = { generateTopGames };
