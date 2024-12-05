const Gig = require('../models/Gig')
const Client = require('../models/client')
const{StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')

const createGig = async(req,res) =>{
    const{title,description,budget,deadline} = req.body;
    req.body.client = req.user.userId;
    const gig = await Gig.create(req.body)
    res.status(StatusCodes.CREATED).json({gig})
}

const getAllGigs = async (req, res) => {
    // const { title, minBudget, maxBudget } = req.query;

    // Build query object
    // const queryObject = {};
    // if (title) queryObject.title = { $regex: title, $options: 'i' }; // Case-insensitive search
    // if (minBudget) queryObject.budget = { $gte: Number(minBudget) };
    // if (maxBudget) queryObject.budget = { ...queryObject.budget, $lte: Number(maxBudget) };

    const gigs = await Gig.find({}).populate({path:'client',select:'name'})
    
    res.status(StatusCodes.OK).json({ gigs, count: gigs.length });
};

// Get a single gig by ID
const getGigById = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findById(gigId)
        .populate('proposals', 'proposalMessage bidAmount')
        .populate('client', 'name email'); // Populate client details (name and email)

    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }

    res.status(StatusCodes.OK).json({
        gig,
        proposals: gig.proposals, // Include populated proposals in response
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

const getSingleClientGigs = async(req,res) =>{
    const {id:clientId} = req.params;
    const gigs = await Gig.find({client:clientId})
    res.status(StatusCodes.OK).json({gigs,count:gigs.length})
}

module.exports = {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    getSingleClientGigs,
};