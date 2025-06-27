const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { generateTopGames } = require('./generate-top-games.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataFilePath = path.join(__dirname, 'data', 'top-games.json');

// Helper function to check if data file exists and is recent (less than 24 hours old)
async function isDataFresh() {
  try {
    const stats = await fs.stat(dataFilePath);
    const now = new Date();
    const fileAge = now - new Date(stats.mtime);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return fileAge < twentyFourHours;
  } catch (error) {
    return false; // File doesn't exist or other error
  }
}

// Helper function to read games data
async function readGamesData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading games data:', error.message);
    return null;
  }
}

// Routes

// GET /api/games - Get all games
app.get('/api/games', async (req, res) => {
  try {
    console.log('📱 Frontend requesting games data...');
    
    // Check if we have fresh data
    const isFresh = await isDataFresh();
    
    if (!isFresh) {
      console.log('🔄 Data is stale or missing, generating fresh data...');
      // Generate fresh data if needed
      await generateTopGames();
    }
    
    // Read and return the data
    const games = await readGamesData();
    
    if (!games) {
      return res.status(500).json({ 
        error: 'Failed to load games data',
        message: 'Could not read or generate games data'
      });
    }
    
    console.log(`✅ Serving ${games.length} games to frontend`);
    res.json({
      success: true,
      count: games.length,
      data: games,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/games:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/games/:id - Get specific game by ID
app.get('/api/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    console.log(`🎯 Frontend requesting game with ID: ${gameId}`);
    
    const games = await readGamesData();
    
    if (!games) {
      return res.status(500).json({ 
        error: 'Failed to load games data' 
      });
    }
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found',
        message: `No game found with ID: ${gameId}`
      });
    }
    
    console.log(`✅ Found game: ${game.name}`);
    res.json({
      success: true,
      data: game
    });
    
  } catch (error) {
    console.error('Error in /api/games/:id:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/games/refresh - Force refresh game data
app.post('/api/games/refresh', async (req, res) => {
  try {
    console.log('🔄 Frontend requesting data refresh...');
    
    // Force generate new data
    await generateTopGames();
    
    // Read the fresh data
    const games = await readGamesData();
    
    if (!games) {
      return res.status(500).json({ 
        error: 'Failed to generate fresh data' 
      });
    }
    
    console.log(`✅ Data refreshed successfully with ${games.length} games`);
    res.json({
      success: true,
      message: 'Data refreshed successfully',
      count: games.length,
      data: games,
      refreshedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/games/refresh:', error.message);
    res.status(500).json({ 
      error: 'Failed to refresh data',
      message: error.message 
    });
  }
});

// GET /api/status - API health check
app.get('/api/status', async (req, res) => {
  try {
    const isFresh = await isDataFresh();
    const games = await readGamesData();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      dataStatus: {
        exists: !!games,
        count: games ? games.length : 0,
        fresh: isFresh
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// GET / - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Board Games API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/games': 'Get all games',
      'GET /api/games/:id': 'Get specific game by ID',
      'POST /api/games/refresh': 'Force refresh game data',
      'GET /api/status': 'API health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Board Games API Server running on port ${PORT}`);
  console.log(`📊 Access API at: http://localhost:${PORT}`);
  console.log(`🎮 Get games: http://localhost:${PORT}/api/games`);
  console.log(`📋 API status: http://localhost:${PORT}/api/status\n`);
});

module.exports = app; 