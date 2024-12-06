const express = require('express');
const { sendMessage, getMessages, markAsRead, uploadFile } = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

// Define route for uploading files
router.post('/upload', authenticateUser, uploadFile);

// Define other routes for sending messages, getting messages, and marking as read
router.post('/', authenticateUser, sendMessage);
router.get('/', authenticateUser, getMessages);
router.patch('/:id/read', authenticateUser, markAsRead);

module.exports = router;
