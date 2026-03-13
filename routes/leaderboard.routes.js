const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { checkCache } = require('../services/cacheService');

const router = express.Router();

// Using redis cache for 1 hour
router.get('/', checkCache('leaderboard'), getLeaderboard);

module.exports = router;
