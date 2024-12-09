const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/predict-complexity", async (req, res) => {
  const { Description } = req.body;
  if (!Description) {
    return res.status(400).json({ error: "Description field is required" });
  }
  try {
    const flaskResponse = await axios.post("http://127.0.0.1:5001/predict", {
      Description,
    });
    res.json({ predictedComplexity: flaskResponse.data.predicted_complexity });
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Flask API" });
  }
});

module.exports = router;
