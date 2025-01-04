const express = require("express");
const router = express.Router();

const spotsRouter = require("./spots");

const reviewsRouter = require("./reviews");

const storedSpotsRouter = require("./storedSpots");

router.use("/reviews", reviewsRouter);

router.use("/spots", spotsRouter);

router.use("/stored-spots", storedSpotsRouter);

router.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = router;
