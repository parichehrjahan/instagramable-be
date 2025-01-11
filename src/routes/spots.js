// TODO: connect to supabase and update the spots table

const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");

const {
  getSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
  getSpotImages,
} = require("../controllers/spotsController");

router.get("/", authenticateUser, getSpots);

router.get("/:id", authenticateUser, getSpotById);

router.post("/", authenticateUser, createSpot);

router.put("/:id", authenticateUser, updateSpot);

router.delete("/:id", authenticateUser, deleteSpot);

router.get("/:id/images", authenticateUser, getSpotImages);

module.exports = router;
