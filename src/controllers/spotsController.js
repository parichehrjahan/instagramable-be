const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.getSpots = async (req, res) => {
  try {
    // First, get all spots with their basic info and images
    const { data: spots, error } = await supabase.from("spots").select(`
        *,
        spot_images (*),
        reviews (
          rating
        ),
        spot_categories (
          category_id
        )
      `);

    if (error) throw error;

    // Calculate stats for each spot
    const spotsWithStats = spots.map((spot) => {
      const reviews = spot.reviews || [];
      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number(
              (
                reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
                reviewCount
              ).toFixed(1),
            )
          : null;

      return {
        ...spot,
        review_count: reviewCount,
        average_rating: averageRating,
        categories: spot.spot_categories.map((sc) => sc.category_id),
        reviews: undefined, // Optional: remove reviews array from response if not needed
        spot_categories: undefined, // Remove the join table data
      };
    });

    return res.json({ success: true, data: spotsWithStats });
  } catch (error) {
    logger.error(`Error getting spots: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single spot by ID
exports.getSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("spots")
      .select(
        `
        *,
        spot_images (
          id,
          image_url,
          caption,
          is_gallery
        ),
        reviews (
          *
        )
      `,
      )
      .eq("id", id)
      .order("updated_at", { foreignTable: "reviews", ascending: false })
      .single();

    const { data: userReviewInteraction, error: userReviewInteractionError } =
      await supabase
        .from("review_interactions")
        .select("*")
        .eq("spot_id", id)
        .eq("user_id", req.user.id);

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: "Spot not found" });
    }

    const compiledData = {
      ...data,
      user_review_interaction: userReviewInteraction,
    };

    return res.json({ success: true, data: compiledData });
  } catch (error) {
    logger.error(`Error getting spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new spot
exports.createSpot = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      imageURLs,
      categories,
    } = req.body;
    const userId = req.user.id; // Assuming you have auth middleware

    // First create the spot
    const { data: spot, error: spotError } = await supabase
      .from("spots")
      .insert([
        {
          name,
          description,
          location,
          latitude,
          longitude,
        },
      ])
      .select()
      .single();

    if (spotError) throw spotError;

    // If we have images, create the spot_images records
    if (imageURLs && imageURLs.length > 0) {
      const { error: imagesError } = await supabase.from("spot_images").insert(
        imageURLs.map((url) => ({
          spot_id: spot.id,
          image_url: url,
          caption: null,
        })),
      );

      if (imagesError) throw imagesError;
    }

    // Insert category relationships
    if (categories?.length > 0) {
      const categoryRelations = categories.map((categoryId) => ({
        spot_id: spot.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("spot_categories")
        .insert(categoryRelations);

      if (categoryError) throw categoryError;
    }

    return res.status(201).json({ success: true, data: spot.id });
  } catch (error) {
    logger.error(`Error creating spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update a spot
exports.updateSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;

    const { data, error } = await supabase
      .from("spots")
      .update({ name, address, description })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Spot not found" });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error) {
    logger.error(`Error updating spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a spot
exports.deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("spots").delete().eq("id", id);

    if (error) throw error;

    return res.json({ success: true, message: "Spot deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSpotImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("spot_images")
      .select("image_url")
      .eq("spot_id", id)
      .limit(3);

    if (error) throw error;

    return res.json({
      success: true,
      data: data.map((img) => img.image_url),
    });
  } catch (error) {
    logger.error(`Error getting spot images: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};
