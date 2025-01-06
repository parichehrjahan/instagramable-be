const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.toggleStoredSpot = async (req, res) => {
  try {
    const { spot_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User must be authenticated",
      });
    }

    // Check if the spot exists
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

    // Check if already saved
    const { data: existingStored } = await supabase
      .from("stored_spots")
      .select("*")
      .eq("spot_id", spot_id)
      .eq("user_id", user_id)
      .single();

    let result;

    if (existingStored) {
      // Remove if already saved
      const { error } = await supabase
        .from("stored_spots")
        .delete()
        .eq("spot_id", spot_id)
        .eq("user_id", user_id);

      if (error) throw error;
      result = { data: null };
    } else {
      // Save if not already saved
      result = await supabase
        .from("stored_spots")
        .insert([
          {
            spot_id,
            user_id,
          },
        ])
        .select()
        .single();
    }

    return res.json({
      success: true,
      data: result.data,
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
    const user_id = req.user?.id;

    const { data, error } = await supabase
      .from("stored_spots")
      .select("*")
      .eq("spot_id", spotId)
      .eq("user_id", user_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    logger.error(`Error getting stored spot status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getUserStoredSpots = async (req, res) => {
  try {
    const user_id = req.user?.id;

    // Get stored spots with spot details using join
    const { data, error } = await supabase
      .from("stored_spots")
      .select(
        `
        *,
        spots:spots(*)
      `,
      )
      .eq("user_id", user_id);

    if (error) throw error;

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    logger.error(`Error getting user stored spots: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
