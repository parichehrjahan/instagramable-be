const supabase = require("../lib/supabaseClient");

exports.getUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, full_name, bio, profile_picture")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, full_name, bio } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({
        username,
        full_name,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { file } = req.body; // You'll need to handle file upload middleware

    // Upload to user_images bucket
    const fileExt = file.name.split(".").pop();
    const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("user_images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user_images").getPublicUrl(filePath);

    // Update user profile with new image URL
    const { error: updateError } = await supabase
      .from("users")
      .update({
        profile_picture: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id);

    if (updateError) throw updateError;

    return res.json({
      success: true,
      data: { profile_picture: publicUrl },
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
