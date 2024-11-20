const express = require ('express')
const router = express.Router()
const {updateFreelancer,
    getFreelancerById,
    deleteFreelancer} = require('../controllers/freelancerController')

router.get('/:id',getFreelancerById)
router.patch('/:id',updateFreelancer)
router.delete('/:id',deleteFreelancer)

module.exports = router;