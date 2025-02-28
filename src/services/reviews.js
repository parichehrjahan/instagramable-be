import supabase from "../config/supabaseClient.js";

export const createReview = async (reviewData) => {
  try {
    // First, create the review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert([
        {
          spot_id: reviewData.spot_id,
          user_id: reviewData.user_id,
          rating: reviewData.rating,
          content: reviewData.content,
        },
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // If there are images, add them to review_images
    if (reviewData.images && reviewData.images.length > 0) {
      const reviewImages = reviewData.images.map((image) => ({
        review_id: review.id,
        image_url: image.url,
        caption: image.caption,
      }));

      const { error: imageError } = await supabase
        .from("review_images")
        .insert(reviewImages);

      if (imageError) throw imageError;
    }

    // Update spot's average rating and review count
    await updateSpotStats(reviewData.spot_id);

    // Fetch the complete review with images
    const { data: completeReview, error: fetchError } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*),
        profiles:user_id (name, avatar_url)
      `,
      )
      .eq("id", review.id)
      .single();

    if (fetchError) throw fetchError;

    return {
      ...completeReview,
      user_name: completeReview.profiles?.name,
      user_avatar: completeReview.profiles?.avatar_url,
    };
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const getReviewsBySpotId = async (spotId) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*),
        profiles:user_id (name, avatar_url)
      `,
      )
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the data to include user info directly in the review object
    return data.map((review) => ({
      ...review,
      user_name: review.profiles?.name,
      user_avatar: review.profiles?.avatar_url,
    }));
  } catch (error) {
    console.error("Error getting reviews by spot:", error);
    throw error;
  }
};

export const getReviewById = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        review_images (*),
        profiles:user_id (name, avatar_url)
      `,
      )
      .eq("id", reviewId)
      .single();

    if (error) throw error;

    return {
      ...data,
      user_name: data.profiles?.name,
      user_avatar: data.profiles?.avatar_url,
    };
  } catch (error) {
    console.error("Error getting review by id:", error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating: reviewData.rating,
        content: reviewData.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) throw error;

    // Update spot's average rating
    await updateSpotStats(data.spot_id);

    return data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    // Get the spot_id before deleting
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("spot_id")
      .eq("id", reviewId)
      .single();

    if (fetchError) throw fetchError;

    const spotId = review.spot_id;

    // Delete the review (cascade will delete images)
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;

    // Update spot's average rating
    await updateSpotStats(spotId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

export const toggleLike = async (reviewId, userId) => {
  try {
    // Check if user has already interacted with this review
    const { data: existingInteraction, error: checkError } = await supabase
      .from("review_interactions")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    // Get current review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (reviewError) throw reviewError;

    let likeCount = review.like_count || 0;
    let dislikeCount = review.dislike_count || 0;

    // Handle the interaction based on existing state
    if (!existingInteraction) {
      // No previous interaction, create a new like
      await supabase
        .from("review_interactions")
        .insert([{ review_id: reviewId, user_id: userId, is_liked: true }]);
      likeCount += 1;
    } else if (existingInteraction.is_liked === true) {
      // Already liked, remove the like
      await supabase
        .from("review_interactions")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", userId);
      likeCount = Math.max(0, likeCount - 1);
    } else {
      // Was disliked, change to like
      await supabase
        .from("review_interactions")
        .update({ is_liked: true })
        .eq("review_id", reviewId)
        .eq("user_id", userId);
      likeCount += 1;
      dislikeCount = Math.max(0, dislikeCount - 1);
    }

    // Update review counts
    const { data, error: updateError } = await supabase
      .from("reviews")
      .update({
        like_count: likeCount,
        dislike_count: dislikeCount,
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) throw updateError;

    return data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const toggleDislike = async (reviewId, userId) => {
  try {
    // Check if user has already interacted with this review
    const { data: existingInteraction, error: checkError } = await supabase
      .from("review_interactions")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    // Get current review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (reviewError) throw reviewError;

    let likeCount = review.like_count || 0;
    let dislikeCount = review.dislike_count || 0;

    // Handle the interaction based on existing state
    if (!existingInteraction) {
      // No previous interaction, create a new dislike
      await supabase
        .from("review_interactions")
        .insert([{ review_id: reviewId, user_id: userId, is_liked: false }]);
      dislikeCount += 1;
    } else if (existingInteraction.is_liked === false) {
      // Already disliked, remove the dislike
      await supabase
        .from("review_interactions")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", userId);
      dislikeCount = Math.max(0, dislikeCount - 1);
    } else {
      // Was liked, change to dislike
      await supabase
        .from("review_interactions")
        .update({ is_liked: false })
        .eq("review_id", reviewId)
        .eq("user_id", userId);
      dislikeCount += 1;
      likeCount = Math.max(0, likeCount - 1);
    }

    // Update review counts
    const { data, error: updateError } = await supabase
      .from("reviews")
      .update({
        like_count: likeCount,
        dislike_count: dislikeCount,
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) throw updateError;

    return data;
  } catch (error) {
    console.error("Error toggling dislike:", error);
    throw error;
  }
};

export const getUserInteractions = async (userId, spotId) => {
  try {
    // Get all reviews for the spot
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id")
      .eq("spot_id", spotId);

    if (reviewsError) throw reviewsError;

    if (!reviews.length) return [];

    // Get user interactions for these reviews
    const reviewIds = reviews.map((review) => review.id);

    const { data, error } = await supabase
      .from("review_interactions")
      .select("*")
      .eq("user_id", userId)
      .in("review_id", reviewIds);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error getting user interactions:", error);
    throw error;
  }
};

// Helper function to update spot stats
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
    console.error("Error updating spot stats:", error);
    throw error;
  }
};
