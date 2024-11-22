const express = require ('express')
const router = express.Router()
const {updateFreelancer,getAllFreelancers,
    getFreelancerById,
    deleteFreelancer} = require('../controllers/freelancerController')
const {getSingleFreelancerReview} = require('../controllers/reviewController')
router.get('/',getAllFreelancers)
router.get('/:id',getFreelancerById)
router.patch('/:id',updateFreelancer)
router.delete('/:id',deleteFreelancer)

router.route('/:id/reviews').get(getSingleFreelancerReview)
module.exports = router;
