import { Router } from "express";
import * as ReviewService from "../services/reviews.js";
import { authenticateUser } from "../middlewares/auth.js";

const router = Router();

// Create a new review
router.post("/", authenticateUser, async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      user_id: req.user.id,
    };
    const review = await ReviewService.createReview(reviewData);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all reviews for a spot
router.get("/spot/:spotId", async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsBySpotId(req.params.spotId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a specific review
router.get("/:id", async (req, res) => {
  try {
    const review = await ReviewService.getReviewById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a review
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const review = await ReviewService.updateReview(req.params.id, req.body);
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a review
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    await ReviewService.deleteReview(req.params.id);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like a review
router.post("/:id/like", authenticateUser, async (req, res) => {
  try {
    const review = await ReviewService.toggleLike(req.params.id, req.user.id);
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dislike a review
router.post("/:id/dislike", authenticateUser, async (req, res) => {
  try {
    const review = await ReviewService.toggleDislike(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user interactions for a spot's reviews
router.get("/interactions/:spotId", authenticateUser, async (req, res) => {
  try {
    const interactions = await ReviewService.getUserInteractions(
      req.user.id,
      req.params.spotId,
    );
    res.json({ success: true, data: interactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
