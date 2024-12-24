// TODO: connect to supabase and update the spots table

const express = require("express");
const router = express.Router();

const {
  getSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
} = require("../controllers/spotsController");

router.get("/", getSpots);

router.get("/:id", getSpotById);

router.post("/", createSpot);

router.put("/:id", updateSpot);

router.delete("/:id", deleteSpot);

module.exports = router;
