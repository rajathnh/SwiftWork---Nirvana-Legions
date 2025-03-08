const express = require('express');
const { sendMessage, getMessages, markAsRead, uploadFile } = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

// Route for uploading files
router.post('/upload', authenticateUser, uploadFile);

// Route for sending messages
router.post('/', authenticateUser, sendMessage);

// Route for fetching messages for a specific gig with pagination
router.get('/:gigId', authenticateUser, getMessages);

// Route for marking a message as read
router.patch('/:id/read', authenticateUser, markAsRead);

module.exports = router;
