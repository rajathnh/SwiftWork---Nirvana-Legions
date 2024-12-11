const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/calculate-price", async (req, res) => {
  const { description, deadline } = req.body;

  // Validate input
  if (!description || !deadline) {
    return res
      .status(400)
      .json({ error: 'Both "description" and "deadline" fields are required' });
  }

  try {
    const flaskResponse = await axios.post("http://127.0.0.1:5001/predict", {
      description,
      deadline,
    });

    const { complexity, urgency } = flaskResponse.data;

    const basePrice = 1200;
    const complexityWeight = 1200;
    const urgencyWeight = 1500;
    const totalPrice =
      basePrice + complexity * complexityWeight + urgency * urgencyWeight;

    res.json({
      complexity,
      urgency,
      totalPrice: totalPrice.toFixed(2),
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to process the request" });
  }
});

module.exports = router;
