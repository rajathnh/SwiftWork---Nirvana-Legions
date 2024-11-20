const express = require('express')
const router = express.Router();
const{
    createFreelancer,createClient,login}=require('../controllers/authController');
router.post('/register/freelancer',createFreelancer)
router.post('/register/client',createClient)
router.post('/login',login)

module.exports = router;
