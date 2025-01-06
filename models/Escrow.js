const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
    orderId: { type: String, required: true }, // Simulated order ID
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer', required: true },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 }, // 10% commission
    status: { type: String, enum: ['escrowed', 'released', 'disputed'], default: 'escrowed' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Escrow', escrowSchema);
