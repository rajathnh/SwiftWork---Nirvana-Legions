const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: 1000,
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
      min: 0,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: 'Client', // Reference to the Client model
      required: true,
    },
    assignedFreelancer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Freelancer', 
      default:null,// Reference to the Freelancer model
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed', 'approval pending', 'cancelled'], // Updated typo
      default: 'open',
    },
    submissions: [
        {
            files: [String], // Array of file URLs
            message: { type: String },
            submittedAt: { type: Date, default: Date.now },
        },
    ],
  },
  { timestamps: true }
);

// Virtual field to reference proposals linked to the gig
gigSchema.virtual('proposals', {
  ref: 'Proposal', // Ensure this is the correct model name
  localField: '_id',
  foreignField: 'gig', // Match the actual field name in the Proposal schema
});

module.exports = mongoose.model('Gig', gigSchema);
