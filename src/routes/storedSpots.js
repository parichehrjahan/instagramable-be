const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");

const {
  toggleStoredSpot,
  getStoredSpotStatus,
  getSpotLikeCounts,
} = require("../controllers/storedSpotsController");

// Protected routes - require authentication
router.post("/", authenticateUser, toggleStoredSpot);
router.get("/:spotId/status", authenticateUser, getStoredSpotStatus);

// Public route - anyone can see like counts
router.get("/:spotId/counts", getSpotLikeCounts);

module.exports = router;
