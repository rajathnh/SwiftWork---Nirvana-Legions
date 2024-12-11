const express = require("express");
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Middleware to validate order creation payload
const validateOrder = (req, res, next) => {
  const { gig_id, gig_title, client_id, client_email, order_amount } = req.body;
  if (!gig_id || !client_id || !order_amount || !client_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  next();
};

// Route to create the payment order
router.post("/create-order", validateOrder, paymentController.createOrder);

// Route to handle return after payment (Cashfree redirect)
router.get("/return", paymentController.paymentReturn);

module.exports = router;
