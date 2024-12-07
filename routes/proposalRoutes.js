const express = require('express')
const router = express.Router();
const{
    getProposalById,
    getProposalsForFreelancer,
    getProposalsForGig,
    updateProposalStatus,
    deleteProposal,
    SubmitProposal,
    getAllProposals,
}= require('../controllers/proposalController')
const {authenticateUser} = require('../middleware/authentication')

router.route('/').post(authenticateUser,SubmitProposal).get(getAllProposals)

router.route('/:id').patch(authenticateUser,updateProposalStatus).delete(authenticateUser,deleteProposal).get(getProposalById)

module.exports = router;
