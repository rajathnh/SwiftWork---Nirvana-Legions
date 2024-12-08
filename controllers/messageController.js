const Message = require('../models/Message');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');

// Helper function to handle file upload to Cloudinary
const uploadToCloudinary = async (file) => {
  const upload = promisify(cloudinary.uploader.upload);
  return await upload(file.tempFilePath);
};

const sendMessage = async (req, res) => {
  const { gigId, text, attachments = [] } = req.body;

  // Validate incoming data
  if (!gigId || !text.trim()) {
    return res.status(400).json({ error: 'Gig ID and message text are required' });
  }

  // Save attachments to Cloudinary (if any)
  let uploadedAttachments = [];
  try {
    if (attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          try {
            const uploaded = await uploadToCloudinary(attachment);
            return {
              url: uploaded.secure_url,
              public_id: uploaded.public_id,
            };
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('File upload failed');
          }
        })
      );
    }
  } catch (error) {
    return res.status(500).json({ error: 'File upload failed' });
  }

  // Create a new message and save it to the database
  const message = new Message({
    gigId,
    sender: req.user.id, // Assuming user authentication is set up
    senderType: req.user.role, // Assuming the senderType is based on user role
    text,
    attachments: uploadedAttachments,
  });

  await message.save();

  // Emit message to the corresponding room (Socket.IO logic to broadcast message)
  req.io.to(gigId).emit('receiveMessage', message);

  res.status(201).json(message);
};

const getMessages = async (req, res) => {
  const { gigId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  // Validate gigId
  if (!gigId) {
    return res.status(400).json({ error: 'Gig ID is required' });
  }

  try {
    // Retrieve the chat history for the given gigId
    const messages = await Message.find({ gigId })
      .sort({ timestamp: 1 }) // Sort by timestamp in ascending order
      .skip(skip)
      .limit(limit); // Limit to 50 messages

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;

  // Mark message as read
  try {
    const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Unable to mark message as read' });
  }
};

const uploadFile = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.files.file;

  // Upload the file to Cloudinary or other file storage solution
  try {
    const uploaded = await uploadToCloudinary(file);
    res.status(200).json({ url: uploaded.secure_url, public_id: uploaded.public_id });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
};

module.exports = { sendMessage, getMessages, markAsRead, uploadFile };
