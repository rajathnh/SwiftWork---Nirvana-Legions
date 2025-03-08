const mongoose = require("mongoose");

// Define Message Schema
const messageSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig", // Reference to the Gig model (related project)
      required: true,
      index: true, // Index for faster queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType", // Dynamically refer to the user who sent the message (Client or Freelancer)
      required: true,
    },
    senderType: {
      type: String,
      enum: ["client", "freelancer"], // Define allowed values
      required: true,
    },
    text: {
      type: String,
      maxlength: 1000, // Maximum length for message content
      trim: true,
      default: "", // Default to empty string if not provided
    },
    isRead: {
      type: Boolean,
      default: false, // Default to false (unread)
      index: true, // Index for filtering unread messages
    },
    attachments: [
      {
        url: {
          type: String,
          required: true, // Attachment must have a URL
          validate: {
            validator: function (v) {
              return /^https?:\/\/.+/.test(v); // Ensure it's a valid URL
            },
            message: "Invalid URL format for attachment.",
          },
        },
        public_id: {
          type: String,
          required: true, // Attachment must have a public ID
        },
      },
    ],
  },
  { timestamps: true } // Automatically include createdAt and updatedAt
);

// Virtual populate for sender details
messageSchema.virtual("senderDetails", {
  ref: function () {
    return this.senderType; // Dynamically populate based on senderType
  },
  localField: "sender",
  foreignField: "_id",
  justOne: true,
});

// Export the Message model
module.exports = mongoose.model("Message", messageSchema);
