const express = require ('express')
const router = express.Router()
const Freelancer = require('../models/freelancer')
const Gig = require('../models/Gig')
const {updateFreelancer,getAllFreelancers,
    getFreelancerById,
    deleteFreelancer} = require('../controllers/freelancerController')
const {getSingleFreelancerReview} = require('../controllers/reviewController')
const {getProposalsForFreelancer} = require('../controllers/proposalController')
router.get('/',getAllFreelancers)
router.get('/all-gigs', async (req, res) => {
    try {
        // Fetch all gigs, without needing an ID
        const gigs = await Gig.find({}).select('title description budget _id'); 
        res.render('all-gigs', { gigs }); // Render the gigs on the 'all-gigs' view
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch gigs');
    }
});
router.get('/:id',getFreelancerById)

// Route to get a freelancer profile by ID and render the HTML page
router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch freelancer data by ID
        const freelancer = await Freelancer.findById(id).populate('reviews');
        
        if (!freelancer) {
            return res.status(404).send('Freelancer not found');
        }

        // Log the fetched freelancer data
       // console.log(freelancer);

        // Render the profile page
        res.render('freelancer-profile', { freelancer });
    } catch (err) {
        console.error('Error fetching freelancer:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display all gigs for freelancer (no need for an ID)




router.patch('/:id',updateFreelancer)
router.delete('/:id',deleteFreelancer)

router.route('/:id/reviews').get(getSingleFreelancerReview)
router.route('/:id/proposals').get(getProposalsForFreelancer)

module.exports = router;