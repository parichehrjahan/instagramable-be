const express = require("express");
const router = express.Router();

const spotsRouter = require("./spots");

const reviewsRouter = require("./reviews");

const storedSpotsRouter = require("./storedSpots");

const categoriesRouter = require("./categories");

const usersRouter = require("./users");
router.use("/reviews", reviewsRouter);

router.use("/spots", spotsRouter);

router.use("/stored-spots", storedSpotsRouter);

router.use("/categories", categoriesRouter);

router.use("/users", usersRouter);

router.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = router;
