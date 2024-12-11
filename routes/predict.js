const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/predict-complexity", async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "description field is required" });
  }
  try {
    const flaskResponse = await axios.post("http://localhost:5001/predict", {
      description,
    });
    res.json({ Predicted_Complexity: flaskResponse.data.predicted_complexity });
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Flask API" });
  }
});

module.exports = router;
