const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide title'],
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: 1000, // Fixed the typo from maxlenght to maxlength
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
        ref: 'Client',  // Use 'client' (lowercase) since your model is named client.js
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],  // Fixed typo from "copmleted"
        default: 'open',
    },
}, { timestamps: true });

gigSchema.virtual('proposals', {
    ref: 'Proposal', // Ensure this is the correct model name
    localField: '_id',
    foreignField: 'gig', // Ensure this field matches the actual field name in the Proposal schema
});

module.exports = mongoose.model('Gig', gigSchema);
