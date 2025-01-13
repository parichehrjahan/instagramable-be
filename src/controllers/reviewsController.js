const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.getReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error getting reviews: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error getting review: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getReviewsBySpotId = async (req, res) => {
  try {
    const { spotId } = req.params;
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*)
      `,
      )
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error getting reviews by spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { spot_id, rating, content, images } = req.body;

    // First, create the review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert([
        {
          spot_id,
          rating,
          content,
          user_id: req.user?.id, // Add user_id if authenticated
        },
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // If there are images, add them to review_images
    if (images && images.length > 0) {
      const reviewImages = images.map((image) => ({
        review_id: review.id,
        image_url: image.url,
        caption: image.caption,
      }));

      const { error: imageError } = await supabase
        .from("review_images")
        .insert(reviewImages);

      if (imageError) throw imageError;
    }

    // Calculate new average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("spot_id", spot_id);

    if (reviewsError) throw reviewsError;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update spot's average rating
    const { error: updateError } = await supabase
      .from("spots")
      .update({ average_rating: avgRating })
      .eq("id", spot_id);

    if (updateError) throw updateError;

    // Fetch the complete review with images
    const { data: completeReview, error: fetchError } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*)
      `,
      )
      .eq("id", review.id)
      .single();

    if (fetchError) throw fetchError;

    return res.status(201).json({ success: true, data: completeReview });
  } catch (error) {
    logger.error(`Error creating review: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;

    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        review_images (*)
      `,
      )
      .single();

    if (error) throw error;
    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error updating review: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Due to ON DELETE CASCADE, this will automatically delete associated review_images
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) throw error;

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting review: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};
