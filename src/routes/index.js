const express = require("express");
const router = express.Router();

const spotsRouter = require("./spots");

router.use("/spots", spotsRouter);

router.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = router;
