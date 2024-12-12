const Escrow = require('../models/Escrow');
const Gig = require('../models/Gig');

exports.acceptProposal = async (req, res) => {
    try {
        const { gigId } = req.params;

        // Fetch gig
        const gig = await Gig.findById(gigId);
        if (!gig) return res.status(404).send({ message: 'Gig not found' });

        // Simulate payment and escrow creation
        const orderId = `ORDER_${Date.now()}`; // Simulated order ID
        const commission = gig.budget * 0.1;

        const escrow = new Escrow({
            orderId,
            clientId: gig.client,
            freelancerId: gig.assignedFreelancer,
            amount: gig.budget,
            commission,
        });
        await escrow.save();

        // Update gig status
        gig.escrow = escrow._id;
        gig.status = 'active'; // Status changes to active
        await gig.save();

        res.status(200).send({
            message: 'Proposal accepted. Payment is escrowed.',
            escrowId: escrow._id,
            orderId,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.completeOrder = async (req, res) => {
    try {
        const { gigId } = req.params;

        // Fetch gig and its escrow details
        const gig = await Gig.findById(gigId).populate('escrow');
        if (!gig) return res.status(404).send({ message: 'Gig not found' });

        const escrow = gig.escrow;

        // Ensure the order can be completed
        if (!escrow || escrow.status !== 'escrowed' || gig.status !== 'active') {
            return res.status(400).send({ message: 'Order cannot be completed at this stage.' });
        }

        // Calculate freelancer payout and update escrow status
        const freelancerPayout = escrow.amount - escrow.commission;
        console.log(`Simulated fund release of ${freelancerPayout} to freelancer ${escrow.freelancerId}`);

        escrow.status = 'released'; // Update escrow status
        await escrow.save();

        // Update gig status
        gig.status = 'completed';
        await gig.save();

        res.status(200).send({
            message: 'Order completed. Funds released to freelancer.',
            freelancerPayout,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
