const express = require('express')
const router = express.Router();
const{updateClient,
    getClientById,    
    deleteClient} = require('../controllers/clientController')

router.get('/:id',getClientById)
router.patch('/:id',updateClient)
router.delete('/:id',deleteClient)

module.exports = router;