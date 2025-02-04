const supabase = require("../config/supabaseClient");

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
    const { username, bio } = req.body;
    console.log("Received update request:", { username, bio });
    console.log("User ID:", req.user.id);

    // First check if username is already taken (if username changed)
    if (username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .neq("id", req.user.id)
        .single();

      console.log("Username check result:", { existingUser, checkError });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Username is already taken",
        });
      }
    }

    // Update the user profile
    const updateData = {
      username,
      bio,
      updated_at: new Date().toISOString(),
    };
    console.log("Updating with data:", updateData);

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", req.user.id)
      .select()
      .single();

    console.log("Update result:", { data, error });

    if (error) throw error;

    return res.json({
      success: true,
      data: {
        username: data.username,
        bio: data.bio,
        profile_picture: data.profile_picture,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
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
