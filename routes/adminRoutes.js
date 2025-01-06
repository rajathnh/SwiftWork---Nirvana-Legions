const express = require('express');
const router = express.Router();
const { getAllFreelancers } = require('../controllers/freelancerController');
const { getAllClients } = require('../controllers/clientController');
const { getAllGigs } = require('../controllers/gigController');

// Route to get all freelancers
router.get('/getAllFreelancers', getAllFreelancers);

// Route to get all clients
router.get('/getAllClients', getAllClients);

// Route to get all gigs
router.get('/getAllGigs', getAllGigs);

module.exports = router;
