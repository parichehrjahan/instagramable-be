const express = require("express");
const router = express.Router();

const {
  getReviews,
  getReviewById,
  getReviewsBySpotId,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewsController");

router.get("/", getReviews);
router.get("/:id", getReviewById);
router.get("/spot/:spotId", getReviewsBySpotId);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
