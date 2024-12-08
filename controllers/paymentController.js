const axios = require('axios');

// Cashfree credentials
const CLIENT_ID = 'TEST10375629239f487f439eefd8f79592657301'; // Replace with your Cashfree Client ID
const CLIENT_SECRET = 'cfsk_ma_test_03b8aba6e47fa6dccc4d0fda8b889302_4ea2ebab'; // Replace with your Cashfree Client Secret

// Function to create an order for payment
const createOrder = async (req, res) => {
  const { gig_id, gig_title, client_id, client_email, order_amount } = req.body;

  // Validate inputs
  if (!gig_id || !client_id || !order_amount || !client_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const returnUrl = `http://localhost:5000/return?order_id=${gig_id}`;

  try {
    // Send request to Cashfree to create the order
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders", // Use production URL in live mode
      {
        order_id: `order_${gig_id}`, // Unique ID for the order based on the gig
        order_amount, // Amount to be paid
        order_currency: "INR", // Currency type
        customer_details: {
          customer_id: client_id, // Client's unique ID
          customer_email: client_email,
        },
        order_note: `Payment for ${gig_title}`,
        order_meta: {
          return_url: returnUrl, // Use local URL for testing
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

    // Send the order token back to frontend
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
const paymentReturn = (req, res) => {
  const { order_id, payment_status } = req.query;

  console.log(`Order ID: ${order_id}, Payment Status: ${payment_status}`);

  if (payment_status === "SUCCESS") {
    // Redirect to gig details page after successful payment
    res.redirect(`/gig-details.html?gig_id=${order_id}`);
  } else {
    // Redirect to a payment failure page or show an error message
    res.redirect(`/payment-failed.html?gig_id=${order_id}`);
  }
};

module.exports = {
  createOrder,
  paymentReturn,
};
