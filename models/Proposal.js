const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.ObjectId,
            ref: 'Gig',
            required: true,
        },
        freelancer: {
            type: mongoose.Schema.ObjectId,
            ref: 'Freelancer',
            required: true,
        },
        bidAmount: {
            type: Number,
            required: [true, 'Please provide bid amount'],
            min: 0,
        },
        proposalMessage: {
            type: String,
            maxlength: 1000,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        deadline: {
            type: Date,
            required: [true, 'Please provide a deadline for the proposal'],  // Optionally make it required
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
