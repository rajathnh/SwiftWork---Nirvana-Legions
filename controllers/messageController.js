const Message = require('../models/Message');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require('cloudinary').v2; // Ensure you're using the correct import
const generateConversationIdHash = require('../utils/helper');

// Send a new message
const sendMessage = async (req, res) => {
  const { recipient, content, gigId } = req.body; // Added gigId
  const sender = req.user.userId;

  if (!content || !recipient || !gigId) {
    throw new CustomError.BadRequestError('ConversationId, recipient, and gigId are required');
  }

  let attachments = [];

  // Handle file uploads in sendMessage
  if (req.files && req.files.attachments) {
    const uploadedFiles = Array.isArray(req.files.attachments)
      ? req.files.attachments // Multiple files
      : [req.files.attachments]; // Single file

    for (const file of uploadedFiles) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'freelancing-platform/messages',
        resource_type: 'auto',
      });

      attachments.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const conversationId = generateConversationIdHash(sender, recipient);

  const message = await Message.create({
    gigId, // Added gigId
    conversationId,
    sender,
    recipient,
    content,
    attachments, // Save Cloudinary file details
    freelancer: sender,
    client: recipient,
  });

  res.status(StatusCodes.CREATED).json({ message });
};

// Get messages for a particular gig
const getMessages = async (req, res) => {
  const { client, freelancer, gigId } = req.query; // Added gigId query parameter

  if (!client || !freelancer || !gigId) {
    throw new CustomError.BadRequestError('Please provide client, freelancer, and gigId');
  }

  // Fetch messages between the client and freelancer related to the specific gig
  const messages = await Message.find({
    gigId,
    $or: [
      { client, freelancer },
      { client: freelancer, freelancer: client }
    ]
  }).sort({ createdAt: 1 });

  res.status(StatusCodes.OK).json({ messages });
};

// Mark message as read
const markAsRead = async (req, res) => {
  const { id: messageId } = req.params;

  const message = await Message.findByIdAndUpdate(
    messageId,
    { isRead: true },
    { new: true }
  );

  if (!message) {
    throw new CustomError.NotFoundError(`No message found with ID: ${messageId}`);
  }

  res.status(StatusCodes.OK).json({ message });
};

// Handle file uploads separately
const uploadFile = async (req, res) => {
  if (!req.files || !req.files.attachment) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
  }

  const file = req.files.attachment;

  try {
    // Upload file to Cloudinary (or another file service)
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'freelancing-platform/messages',
      resource_type: 'auto', // Automatically detect file type
    });

    // Respond with the file URL and public_id
    res.status(StatusCodes.OK).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to upload file' });
  }
};

module.exports = { sendMessage, getMessages, markAsRead, uploadFile };
