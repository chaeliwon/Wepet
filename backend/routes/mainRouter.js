const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  console.log("서버 동작!");
  res.sendFile(
    path.join(__dirname, "..", "..", "frontend", "build", "index.html")
  );
});

module.exports = router;
