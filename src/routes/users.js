const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const {
  getUser,
  updateUserProfile,
  uploadProfilePicture,
  getUserProfile,
} = require("../controllers/userController");
const upload = require("../middlewares/upload");

router.get("/", authenticateUser, getUser);
router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.post(
  "/profile/picture",
  authenticateUser,
  upload.single("file"),
  uploadProfilePicture,
);

module.exports = router;
