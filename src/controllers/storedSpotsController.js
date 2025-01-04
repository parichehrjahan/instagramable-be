const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.toggleStoredSpot = async (req, res) => {
  try {
    const { spot_id, is_liked } = req.body;
    const user_id = req.user?.id; // Get user_id from authenticated request

    // First check if the spot exists
    const { data: existingSpot } = await supabase
      .from("spots")
      .select("id")
      .eq("id", spot_id)
      .single();

    if (!existingSpot) {
      return res.status(404).json({
        success: false,
        error: "Spot not found",
      });
    }

    // Check if there's an existing stored_spot entry for this user
    const { data: existingStored } = await supabase
      .from("stored_spots")
      .select("*")
      .eq("spot_id", spot_id)
      .eq("user_id", user_id)
      .single();

    let result;

    if (existingStored) {
      if (is_liked === null) {
        // Delete the stored_spot if is_liked is null (removing like/dislike)
        const { error } = await supabase
          .from("stored_spots")
          .delete()
          .eq("spot_id", spot_id)
          .eq("user_id", user_id);

        if (error) throw error;

        return res.json({
          success: true,
          data: null,
        });
      } else {
        // Update existing entry
        result = await supabase
          .from("stored_spots")
          .update({ is_liked })
          .eq("spot_id", spot_id)
          .eq("user_id", user_id)
          .select()
          .single();
      }
    } else if (is_liked !== null) {
      // Create new entry only if is_liked is not null
      result = await supabase
        .from("stored_spots")
        .insert([
          {
            spot_id,
            user_id,
            is_liked,
          },
        ])
        .select()
        .single();
    }

    if (result?.error) throw result.error;

    return res.json({
      success: true,
      data: result?.data || null,
    });
  } catch (error) {
    logger.error(`Error toggling stored spot: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getStoredSpotStatus = async (req, res) => {
  try {
    const { spotId } = req.params;
    const user_id = req.user?.id; // Get user_id from authenticated request

    const { data, error } = await supabase
      .from("stored_spots")
      .select("*")
      .eq("spot_id", spotId)
      .eq("user_id", user_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // Ignore "no rows returned" error
      throw error;
    }

    return res.json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    logger.error(`Error getting stored spot status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// New endpoint to get like/dislike counts for a spot
exports.getSpotLikeCounts = async (req, res) => {
  try {
    const { spotId } = req.params;

    const { data, error } = await supabase
      .from("stored_spots")
      .select("is_liked")
      .eq("spot_id", spotId);

    if (error) throw error;

    const counts = data.reduce(
      (acc, curr) => {
        if (curr.is_liked === true) acc.likes++;
        if (curr.is_liked === false) acc.dislikes++;
        return acc;
      },
      { likes: 0, dislikes: 0 },
    );

    return res.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    logger.error(`Error getting spot like counts: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
