const Gig = require('../models/Gig');
const Client = require('../models/client');
const Freelancer = require('../models/freelancer'); // Add this import for validation
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Create a new gig
const createGig = async (req, res) => {
    const { title, description, budget, deadline } = req.body;
    req.body.client = req.user.userId;
    const gig = await Gig.create(req.body);
    res.status(StatusCodes.CREATED).json({ gig });
};

// Get all gigs
const getAllGigs = async (req, res) => {
    const gigs = await Gig.find({}).populate({ path: 'client', select: 'name' });
    res.status(StatusCodes.OK).json({ gigs, count: gigs.length });
};

// Get a single gig by ID
const getGigById = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findById(gigId)
        .populate('proposals', 'proposalMessage bidAmount') // Populate proposals
        .populate('client', 'name email') // Populate client details
        .populate('assignedFreelancer', 'name email'); // Populate freelancer details

    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }

    res.status(StatusCodes.OK).json({
        gig,
        proposals: gig.proposals,
        freelancer: gig.assignedFreelancer, // Include populated freelancer details
    });
};

// Update a gig
const updateGig = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findOneAndUpdate(
        { _id: gigId, client: req.user.userId }, // Ensure only the owner can update
        req.body,
        { new: true, runValidators: true }
    );
    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }
    res.status(StatusCodes.OK).json({ gig });
};

// Delete a gig
const deleteGig = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findOneAndDelete({ _id: gigId, client: req.user.userId }); // Ensure only the owner can delete
    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }
    res.status(StatusCodes.OK).json({ msg: 'Gig deleted successfully' });
};

// Get gigs for a single client
const getSingleClientGigs = async (req, res) => {
    const { id: clientId } = req.params;
    const gigs = await Gig.find({ client: clientId });
    res.status(StatusCodes.OK).json({ gigs, count: gigs.length });
};

// Accept a proposal and assign a freelancer to the gig
const acceptProposal = async (req, res) => {
    const { gigId, freelancerId } = req.body;

    try {
        // Find the gig
        const gig = await Gig.findById(gigId);
        if (!gig) {
            throw new CustomError.NotFoundError('Gig not found');
        }

        // Check if the freelancer exists
        const freelancer = await Freelancer.findById(freelancerId);
        if (!freelancer) {
            throw new CustomError.NotFoundError('Freelancer not found');
        }

        // Check if the gig is already assigned
        if (gig.status === 'assigned') {
            throw new CustomError.BadRequestError('Gig is already assigned');
        }

        // Update the gig details
        gig.status = 'assigned'; // Update status
        gig.assignedFreelancer = freelancerId; // Set the assigned freelancer

        await gig.save();

        // Populate the updated gig with freelancer details
        const updatedGig = await Gig.findById(gigId).populate('assignedFreelancer', 'name email');

        res.status(StatusCodes.OK).json({
            message: 'Proposal accepted and gig assigned successfully',
            gig: updatedGig,
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Error assigning the gig' });
    }
};

module.exports = {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    getSingleClientGigs,
    acceptProposal,
};
