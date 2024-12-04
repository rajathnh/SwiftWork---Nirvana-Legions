const Message = require('../models/Message');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require('cloudinary');
const generateConversationIdHash = require('../utils/helper');

const sendMessage = async (req, res) => {
    const { recipient, content } = req.body;
    const sender = req.user.userId;
  
    if (!content || !recipient) {
      throw new CustomError.BadRequestError('ConversationId and recipient are required');
    }
  
    let attachments = [];
  
    // Handle file uploads
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
  const getMessages = async (req, res) => {
    const { client, freelancer } = req.query;

    if (!client || !freelancer) {
        throw new CustomError.BadRequestError('Please provide client and freelancer IDs');
    }

    // Fetch messages between the client and freelancer
    const messages = await Message.find({
        $or: [
            { client, freelancer },
            { client: freelancer, freelancer: client }
        ]
    }).sort({ createdAt: 1 });

    res.status(StatusCodes.OK).json({ messages });
};

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

module.exports = { sendMessage, getMessages, markAsRead };

