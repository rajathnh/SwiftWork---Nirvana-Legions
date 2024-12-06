const express = require('express');
const router = express.Router();
const {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    acceptProposal,
} = require('../controllers/gigController');
const { getProposalsForGig } = require('../controllers/proposalController');
const { authenticateUser } = require('../middleware/authentication');

// Route to create a new gig (only for authenticated users)
router.route('/').post(authenticateUser, createGig).get(getAllGigs);
router.route('/all-gigs').get(getAllGigs);
router.post('/accept-proposal', acceptProposal);
// Route to get a specific gig, update, or delete it (only by its ID)
router.route('/:id')
    .get(getGigById)
    .patch(authenticateUser, updateGig)
    .delete(authenticateUser, deleteGig);

// Route to get proposals for a specific gig (by gig ID)
router.route('/:id/proposals').get(getProposalsForGig);


// New route to fetch all gigs for freelancers (no specific freelancer ID)


module.exports = router;
