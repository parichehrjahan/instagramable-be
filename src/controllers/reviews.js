import { Router } from "express";
import * as ReviewService from "../services/reviews.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const review = await ReviewService.createReview(req.body);
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/spot/:spotId", async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsBySpotId(req.params.spotId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add other CRUD endpoints as needed

export default router;
