const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");

const {
  toggleStoredSpot,
  getStoredSpotStatus,
  getUserStoredSpots,
} = require("../controllers/storedSpotsController");

// Protected routes - require authentication
router.post("/", authenticateUser, toggleStoredSpot);
router.get("/:spotId/status", authenticateUser, getStoredSpotStatus);
router.get("/user", authenticateUser, getUserStoredSpots);

module.exports = router;
