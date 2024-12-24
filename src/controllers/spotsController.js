const logger = require("../utils/logger");
const supabase = require("../config/supabaseClient");

exports.getSpots = async (req, res) => {
  try {
    return res.json({ success: true, data: ["spot A", "spot B"] });
  } catch (error) {
    logger.error(`Error getting spots: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};
