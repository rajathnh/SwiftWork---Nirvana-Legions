const express = require('express')
const router = express.Router();
const{updateClient,
    getClientById,    
    deleteClient,getAllClients} = require('../controllers/clientController')
const {getSingleClientGigs} = require('../controllers/gigController')

router.get('/',getAllClients)
router.get('/:id',getClientById)
router.patch('/:id',updateClient)
router.delete('/:id',deleteClient)
router.route('/:id/gigs').get(getSingleClientGigs)
module.exports = router;