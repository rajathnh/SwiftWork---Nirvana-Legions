const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to create the payment order
router.post('/create-order', paymentController.createOrder);

// Route to handle return after payment (Cashfree redirect)
router.get('/return', paymentController.paymentReturn);

module.exports = router;
