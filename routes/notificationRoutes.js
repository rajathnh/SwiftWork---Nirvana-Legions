// routes/notificationRoutes.js
const express = require('express');
const { createNotification } = require('../controllers/notificationController');
const Notification = require('../models/Notification');
const router = express.Router();

// Route to fetch notifications
router.get('/get', async (req, res) => {
  const freelancerId = req.user.id;  // Assuming the freelancer is authenticated
  const notifications = await Notification.find({ freelancerId });
  res.json(notifications);
});

// Route to mark notification as read
router.put('/mark-as-read/:id', async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  notification.seen = true;
  await notification.save();
  res.json(notification);
});

module.exports = router;
