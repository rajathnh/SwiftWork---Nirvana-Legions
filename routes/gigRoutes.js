const express = require('express');
const router = express.Router();
const upload= require('../middleware/multer')
const {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    acceptProposal,
    submitFinalWork,
    setGigToCompleted,
    getRelevantGigs,
} = require('../controllers/gigController');
const { getProposalsForGig } = require('../controllers/proposalController');
const { authenticateUser } = require('../middleware/authentication');

// Route to create a new gig (only for authenticated users)
router.route('/').post(authenticateUser, createGig).get(getAllGigs);
router.route('/all-gigs').get(getAllGigs);
router.post('/accept-proposal', acceptProposal);
router.get('/:id/relevant-gigs', getRelevantGigs); 
// Route to get a specific gig, update, or delete it (only by its ID)
router.route('/:id')
    .get(getGigById)
    .patch(authenticateUser, updateGig)
    .delete(authenticateUser, deleteGig);
router.route('/:id/files').post(submitFinalWork);
// Route to get proposals for a specific gig (by gig ID)
router.route('/:id/proposals').get(getProposalsForGig);
router.patch("/:id/complete", setGigToCompleted);


// New route to fetch all gigs for freelancers (no specific freelancer ID)


module.exports = router;
