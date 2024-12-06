const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    gigId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Gig', // Reference to the Gig model
      required: true 
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        url: String, // Cloudinary file URL
        public_id: String, // Cloudinary file public ID
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
