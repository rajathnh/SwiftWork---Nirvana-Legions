const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleFreelancerReview } = require('../controllers/reviewController'); // Correct import

const {authenticateUser} = require('../middleware/authentication'); // Import authentication middleware


router.post('/', createReview)
router.get('/', getAllReviews);
router.get('/:id', getSingleReview);
router.patch('/:id', authenticateUser, updateReview);
router.delete('/:id', authenticateUser, deleteReview);

module.exports = router;
