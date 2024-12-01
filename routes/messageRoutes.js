const express = require('express');
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/authentication');

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  sendMessage // No need for a special middleware since express-fileupload is global
);
router.get('/', authenticateUser, getMessages);
router.patch('/:id/read', authenticateUser, markAsRead);

module.exports = router;
