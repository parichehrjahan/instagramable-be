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

    await updateSpotStats(spot_id);

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

    await updateSpotStats(data.spot_id);

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

    await updateSpotStats(data.spot_id);

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting review: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get current review
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Update like count
    const { data, error } = await supabase
      .from("reviews")
      .update({
        like_count: review.like_count + 1,
        dislike_count: Math.max(0, review.dislike_count - 1), // Reset dislike if exists
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error toggling review like: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleDislike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get current review
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Update dislike count
    const { data, error } = await supabase
      .from("reviews")
      .update({
        dislike_count: review.dislike_count + 1,
        like_count: Math.max(0, review.like_count - 1), // Reset like if exists
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error toggling review dislike: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateSpotStats = async (spotId) => {
  try {
    // Get all reviews for the spot
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("spot_id", spotId);

    if (reviewsError) throw reviewsError;

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            ).toFixed(1),
          )
        : null;

    // Update spot stats
    const { error: updateError } = await supabase
      .from("spots")
      .update({
        review_count: reviewCount,
        average_rating: averageRating,
      })
      .eq("id", spotId);

    if (updateError) throw updateError;
  } catch (error) {
    logger.error(`Error updating spot stats: ${error.message}`);
    throw error;
  }
};

exports.checkUserInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if user has already liked or disliked this review
    const { data: existingInteraction, error: existingError } = await supabase
      .from("review_interactions")
      .select("*")
      .eq("review_id", id)
      .eq("user_id", userId)
      .single();

    if (existingError) throw existingError;

    return res.json({ success: true, interaction: existingInteraction });
  } catch (error) {
    logger.error(`Error checking user interaction: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};
