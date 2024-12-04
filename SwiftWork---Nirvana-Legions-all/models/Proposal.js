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
            ref: 'Freelancer',  // Note: "Freelancer" should match the model name exactly
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
            enum: ['pending', 'accepted', 'rejected'],  // Corrected 'enume' to 'enum'
            default: 'pending',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
