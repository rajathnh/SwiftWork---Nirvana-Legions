const express = require('express');
const router = express.Router();
const { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleFreelancerReview } = require('../controllers/reviewController'); // Correct import

const {authenticateUser} = require('../middleware/authentication'); // Import authentication middleware

// Route setup
router.post('/', async (req, res) => {
    try {
      console.log('Request body:', req.body); // Log the request body to verify the data
      // Handle the review submission logic here
    } catch (error) {
      console.error('Error while submitting review:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  // Ensure createReview is defined and authenticateUser is used
router.get('/', getAllReviews);
router.get('/:id', getSingleReview);
router.patch('/:id', authenticateUser, updateReview);
router.delete('/:id', authenticateUser, deleteReview);
//router.get('//:id/reviews', getSingleFreelancerReview);


module.exports = router;
