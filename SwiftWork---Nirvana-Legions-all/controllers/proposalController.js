const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')

const SubmitProposal = async (req, res) => {
  const { gigId, bidAmount, proposalMessage } = req.body;
  const freelancerId = req.user.userId;

  if (!gigId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Gig ID is required' });
  }

  if (!bidAmount || !proposalMessage) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Bid Amount and Proposal Message are required' });
  }

  const gig = await Gig.findById(gigId); // Use 'gigId' (singular)
  if (!gig) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No gig found with ID: ${gigId}` });
  }

  const proposal = await Proposal.create({
    gig: gigId,  // Use 'gig' (singular) in the Proposal schema
    freelancer: freelancerId,
    proposalMessage,
    bidAmount,
  });

  res.status(StatusCodes.CREATED).json({ proposal });
};

const getProposalsForGig = async (req, res) => {
  const { gigId } = req.params;
  const proposals = await Proposal.find({ gig: gigId }).populate('freelancer', 'name email');
  res.status(StatusCodes.OK).json({ proposals });
};

const getProposalsForFreelancer = async (req, res) => {
  const freelancerId = req.user.userId;
  const proposals = await Proposal.find({ freelancer: freelancerId })
    .populate('gig', 'title description budget deadline')
    .populate('freelancer', 'name email');
  res.status(StatusCodes.OK).json({ proposals });
};

const updateProposalStatus = async (req, res) => {
  const { id } = req.params;
  const { bidAmount, proposalMessage } = req.body; // Expect both bidAmount and proposalMessage

  // Ensure at least one field is provided to update
  if (!bidAmount && !proposalMessage) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'At least one field (bidAmount or proposalMessage) is required' });
  }

  // Build update object
  const updateData = {};
  if (bidAmount) updateData.bidAmount = bidAmount;
  if (proposalMessage) updateData.proposalMessage = proposalMessage;

  // Find and update the proposal with the new values
  const proposal = await Proposal.findByIdAndUpdate(
    id,
    updateData, // Update with either bidAmount, proposalMessage, or both
    { new: true, runValidators: true }
  );

  if (!proposal) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No proposal found with ID: ${proposalId}` });
  }

  res.status(StatusCodes.OK).json({ proposal });
};

const deleteProposal = async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findByIdAndDelete(id);

  if (!proposal) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No proposal found with id ${proposalId}` });
  }

  res.status(StatusCodes.OK).json({ msg: 'Proposal Deleted Successfully' });
};

const getProposalById = async(req,res)=>{
  const {id:proposalId} = req.params;
  const proposal = await Proposal.findOne({_id:proposalId})
  if(!proposal){
      throw new CustomError.NotFoundError(`No proposal with id ${proposalId}`);
  }
  res.status(StatusCodes.OK).json({proposal})
}

const getAllProposals = async(req,res) =>{
  const proposal = await Proposal.find({})
  res.status(StatusCodes.OK).json({ proposal, count: proposal.length });
}


module.exports = {
    getAllProposals,
    getProposalById,
    getProposalsForFreelancer,
    getProposalsForGig,
    updateProposalStatus,
    deleteProposal,
    SubmitProposal,
}
