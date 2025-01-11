const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

// Get all categories
router.get("/", authenticateUser, getCategories);

// Create a new category
router.post("/", authenticateUser, createCategory);

// Delete a category
router.delete("/:id", authenticateUser, deleteCategory);

module.exports = router;
