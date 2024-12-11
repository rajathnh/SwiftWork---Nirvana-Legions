const express = require("express");
const router = express.Router();
const htmlQuestions = require("../data/htmlQuestions");

// Route to get all questions
router.get("/html-expert", (req, res) => {
  res.json(htmlQuestions);
});

module.exports = router;
