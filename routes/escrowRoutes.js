const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');

// Accept Proposal and Simulate Escrow
router.post('/accept/:gigId', escrowController.acceptProposal);

// Complete Order and Simulate Fund Release
router.post('/complete/:gigId', escrowController.completeOrder);

module.exports = router;
