const axios = require("axios");
require("dotenv").config(); // Use dotenv for environment variables

// Cashfree credentials
const CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Function to create an order for payment
const createOrder = async (req, res) => {
  const { gig_id, gig_title, client_id, client_email, order_amount } = req.body;

  // Validate inputs
  if (!gig_id || !client_id || !order_amount || !client_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const orderId = `order_${gig_id}_${Date.now()}`; // Ensure uniqueness
  const returnUrl = `${process.env.BASE_URL}/return?order_id=${gig_id}`;

  try {
    // Send request to Cashfree to create the order
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders", // Use production URL in live mode
      {
        order_id: orderId,
        order_amount,
        order_currency: "INR",
        version: "2022-09-01",
        customer_details: {
          customer_id: client_id,
          customer_email: client_email,
        },
        order_note: `Payment for ${gig_title}`,
        order_meta: {
          return_url: returnUrl,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CLIENT_ID,
          "x-client-secret": CLIENT_SECRET,
        },
      }
    );

    res.status(200).json({
      success: true,
      order_token: response.data.order_token,
    });
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

// Function to handle the return from Cashfree after payment
const paymentReturn = async (req, res) => {
  const { order_id, payment_status } = req.query;

  if (!order_id || !payment_status) {
    return res.status(400).json({ error: "Invalid payment return data" });
  }

  try {
    if (payment_status === "SUCCESS") {
      // Update gig/proposal in DB as paid
      console.log(`Payment successful for Order ID: ${order_id}`);
      res.redirect(`/gig-details.html?gig_id=${order_id}`);
    } else {
      console.log(`Payment failed for Order ID: ${order_id}`);
      res.redirect(`/payment-failed.html?gig_id=${order_id}`);
    }
  } catch (error) {
    console.error("Error handling payment return:", error.message);
    res.status(500).json({ error: "Failed to handle payment return" });
  }
};

module.exports = {
  createOrder,
  paymentReturn,
};
