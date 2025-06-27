// Board Games API Service
// Base API URL - update this if your API runs on a different port
const API_BASE_URL = 'http://localhost:3000/api';

class GameService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to handle API requests
  async makeRequest(endpoint, options = {}) {
    try {
      console.log(`🌐 API Request: ${endpoint}`);
      
      const url = `${this.baseURL}${endpoint}`;
      
      // Add timeout and proper headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      };

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`⏰ API Timeout: ${endpoint}`);
        throw new Error('Request timed out. The server might be busy generating data.');
      }
      console.error(`❌ API Error: ${endpoint}`, error.message);
      throw error;
    }
  }

  // Get all games
  async getAllGames() {
    try {
      const response = await this.makeRequest('/games');
      return {
        success: true,
        games: response.data || [],
        count: response.count || 0,
        lastUpdated: response.lastUpdated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: []
      };
    }
  }

  // Get a specific game by ID
  async getGameById(gameId) {
    try {
      const response = await this.makeRequest(`/games/${gameId}`);
      return {
        success: true,
        game: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        game: null
      };
    }
  }

  // Force refresh the games data
  async refreshGamesData() {
    try {
      const response = await this.makeRequest('/games/refresh', {
        method: 'POST'
      });
      return {
        success: true,
        games: response.data || [],
        count: response.count || 0,
        message: response.message,
        refreshedAt: response.refreshedAt
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: []
      };
    }
  }

  // Check API status
  async getAPIStatus() {
    try {
      const response = await this.makeRequest('/status');
      return {
        success: true,
        status: response.status,
        dataStatus: response.dataStatus,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'ERROR'
      };
    }
  }

  // Search games by name (frontend filtering)
  async searchGames(query) {
    try {
      const { games } = await this.getAllGames();
      
      if (!query || query.trim() === '') {
        return {
          success: true,
          games: games,
          query: ''
        };
      }

      const searchTerm = query.toLowerCase().trim();
      const filteredGames = games.filter(game => 
        game.name.toLowerCase().includes(searchTerm) ||
        (game.categories && game.categories.some(cat => 
          cat.toLowerCase().includes(searchTerm)
        )) ||
        (game.mechanics && game.mechanics.some(mech => 
          mech.toLowerCase().includes(searchTerm)
        )) ||
        (game.designers && game.designers.some(designer => 
          designer.toLowerCase().includes(searchTerm)
        ))
      );

      return {
        success: true,
        games: filteredGames,
        query: searchTerm,
        count: filteredGames.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: [],
        query: query
      };
    }
  }

  // Filter games by category
  async getGamesByCategory(category) {
    try {
      const { games } = await this.getAllGames();
      
      const filteredGames = games.filter(game => 
        game.categories && game.categories.some(cat => 
          cat.toLowerCase() === category.toLowerCase()
        )
      );

      return {
        success: true,
        games: filteredGames,
        category: category,
        count: filteredGames.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: [],
        category: category
      };
    }
  }

  // Filter games by player count
  async getGamesByPlayerCount(playerCount) {
    try {
      const { games } = await this.getAllGames();
      
      const filteredGames = games.filter(game => {
        const min = parseInt(game.minPlayers) || 1;
        const max = parseInt(game.maxPlayers) || 10;
        return playerCount >= min && playerCount <= max;
      });

      return {
        success: true,
        games: filteredGames,
        playerCount: playerCount,
        count: filteredGames.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: [],
        playerCount: playerCount
      };
    }
  }

  // Filter games by playing time
  async getGamesByPlayingTime(maxTime) {
    try {
      const { games } = await this.getAllGames();
      
      const filteredGames = games.filter(game => {
        const playTime = parseInt(game.playingTime) || parseInt(game.maxPlayTime) || 0;
        return playTime > 0 && playTime <= maxTime;
      });

      return {
        success: true,
        games: filteredGames,
        maxTime: maxTime,
        count: filteredGames.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: [],
        maxTime: maxTime
      };
    }
  }

  // Get games sorted by rating
  async getTopRatedGames(limit = 10) {
    try {
      const { games } = await this.getAllGames();
      
      const sortedGames = games
        .filter(game => game.rating && parseFloat(game.rating) > 0)
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, limit);

      return {
        success: true,
        games: sortedGames,
        count: sortedGames.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        games: []
      };
    }
  }
}

// Create and export a singleton instance
const gameService = new GameService();

// Make it available globally for script tag usage
if (typeof window !== 'undefined') {
  window.gameService = gameService;
} 