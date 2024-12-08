const Message = require('../models/Message');
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const generateConversationIdHash = require('../utils/helper');

// Send a new message including attachments
const sendMessage = async (req, res) => {
  const { text, senderId, senderType, gigId, attachments } = req.body;

  if (!senderId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Sender ID is required' });
  }

  try {
    // Initialize attachments array
    let attachmentData = [];

    // Handle file uploads in sendMessage (Logic from the first snippet)
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'freelancing-platform/messages',
          resource_type: 'raw', // Automatically detect file type
        });

        attachmentData.push({
          url: result.secure_url,
          public_id: result.public_id, // Public ID for future reference
        });
      }
    }

    // Create the message object with the attachments
    const message = new Message({
      text,
      sender: senderId,
      senderType,
      timestamp: new Date().toISOString(),
      gigId,
      attachments: attachmentData,  // Attachments with URLs and public IDs
    });

    // Save the message to the database
    await message.save();
    console.log("Message saved successfully!");

    // Emit the message to the corresponding room (gigId) for real-time communication
    req.io.to(gigId).emit('receiveMessage', message);  // Emit to specific room (gigId)

    res.status(StatusCodes.OK).json({ message: 'Message sent successfully', data: message });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to send message' });
  }
};

// Get messages for a specific gigId (with pagination)
const getMessages = async (req, res) => {
  const { gigId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  // Validate gigId
  if (!gigId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Gig ID is required' });
  }

  try {
    // Retrieve the chat history for the given gigId
    const messages = await Message.find({ gigId })
      .sort({ timestamp: 1 }) // Sort by timestamp in ascending order
      .skip(skip)
      .limit(limit); // Limit to 50 messages

    res.status(StatusCodes.OK).json(messages);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to fetch messages' });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  const { id } = req.params;

  // Mark message as read
  try {
    const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Message not found' });
    }
    res.status(StatusCodes.OK).json(message);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Unable to mark message as read' });
  }
};

// Upload a file to Cloudinary (with logic from the first snippet)
const uploadFile = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
  }

  const file = req.files.file; // Assuming 'file' is the name of the field in the form

  // Upload the file to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'freelancing-platform/messages',
      resource_type: 'auto', // Automatically detect file type
    });

    // Respond with the file URL and public_id
    res.status(StatusCodes.OK).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to upload file' });
  }
};

module.exports = { sendMessage, getMessages, markAsRead, uploadFile };