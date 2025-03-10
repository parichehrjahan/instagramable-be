const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");

const {
  getReviews,
  getReviewById,
  getReviewsBySpotId,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  toggleDislike,
  checkUserInteraction,
} = require("../controllers/reviewsController");

router.get("/", getReviews);
router.get("/:id", getReviewById);
router.get("/spot/:spotId", getReviewsBySpotId);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.post("/:id/like", authenticateUser, toggleLike);
router.post("/:id/dislike", authenticateUser, toggleDislike);
router.get("/:id/interaction", authenticateUser, checkUserInteraction);

module.exports = router;
