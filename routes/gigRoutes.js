const express=  require('express')
const router = express.Router();
const{
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig
} = require('../controllers/gigController')
const{getProposalsForGig} = require('../controllers/proposalController')
const {authenticateUser} = require('../middleware/authentication')

router.route('/').post(authenticateUser,createGig).get(getAllGigs);
router.route('/:id').get(getGigById).patch(authenticateUser,updateGig).delete(authenticateUser,deleteGig);

router.route('/:id/proposals').get(getProposalsForGig)

module.exports = router;