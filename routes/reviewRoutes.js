const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleFreelancerReview } = require('../controllers/reviewController'); // Correct import

const {authenticateUser} = require('../middleware/authentication'); // Import authentication middleware

// Route setup
router.post('/', authenticateUser, createReview); // Ensure createReview is defined and authenticateUser is used
router.get('/', getAllReviews);
router.get('/:id', getSingleReview);
router.patch('/:id', authenticateUser, updateReview);
router.delete('/:id', authenticateUser, deleteReview);
//router.get('//:id/reviews', getSingleFreelancerReview);


module.exports = router;
