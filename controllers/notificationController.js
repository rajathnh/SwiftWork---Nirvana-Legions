// services/notificationService.js
const Notification = require('../models/Notification');

const createNotification = async (freelancerId, message) => {
  const notification = new Notification({
    freelancerId,
    message
  });
  await notification.save();
};

// Mark notification as read

    
module.exports = { createNotification };
