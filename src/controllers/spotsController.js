const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.getSpots = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("spots")
      .select(
        `
        *,
        spot_images (
          id,
          image_url,
          caption
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data });
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
          caption
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: "Spot not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error getting spot: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new spot
exports.createSpot = async (req, res) => {
  try {
    const { name, description, location, images } = req.body;
    const userId = req.user.id; // Assuming you have auth middleware

    // First create the spot
    const { data: spot, error: spotError } = await supabase
      .from("spots")
      .insert([
        {
          name,
          description,
          location,
        },
      ])
      .select()
      .single();

    if (spotError) throw spotError;

    // If we have images, create the spot_images records
    if (images && images.length > 0) {
      const { error: imagesError } = await supabase.from("spot_images").insert(
        images.map((img) => ({
          spot_id: spot.id,
          image_url: img.image_url,
          caption: img.caption || null,
        })),
      );

      if (imagesError) throw imagesError;
    }

    // Fetch the complete spot with its images
    const { data: completeSpot, error: fetchError } = await supabase
      .from("spots")
      .select(
        `
        *,
        spot_images (
          id,
          image_url,
          caption
        )
      `,
      )
      .eq("id", spot.id)
      .single();

    if (fetchError) throw fetchError;

    return res.status(201).json({ success: true, data: completeSpot });
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
