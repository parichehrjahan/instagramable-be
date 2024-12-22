// TODO: connect to supabase and update the spots table

const express = require("express");
const router = express.Router();

const { getSpots } = require("../controllers/spotsController");

router.get("/", getSpots);

router.post("/", (req, res) => {
  const { name } = req.body;
  return res.json({ success: true, message: `Created spot ${name}` });
});

module.exports = router;
