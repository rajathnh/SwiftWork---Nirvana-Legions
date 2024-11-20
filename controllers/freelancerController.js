const Freelancer = require('../models/freelancer')
const bcrypt = require('bcryptjs')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')

const getFreelancerById = async(req,res)=>{
    try{
        const{id} = req.params;
        const freelancer = await Freelancer.findById(id);
        if(!freelancer){
            throw new CustomError.BadRequestError("Invalid Credentials")
        }
        res.status(StatusCodes.OK).json({freelancer})
    }
    catch(error){
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
}

const updateFreelancer = async(req,res) =>{
    try{
        const{id} = req.params;
        const {name,email,password,skills,bio,portfolio} = req.body

        const freelancer = await Freelancer.findById(id);
        if(!freelancer){
            throw new CustomError.BadRequestError("Invalid Credentials")
        }
        freelancer.name = name||freelancer.name;
        freelancer.email =email||freelancer.email;
        freelancer.password = password?await bcrypt.hash(password,10):freelancer.password
        freelancer.skills = skills||freelancer.skills
        freelancer.bio = bio||freelancer.bio;
        freelancer.portfolio = portfolio||freelancer.portfolio

        await freelancer.save();

        res.status(StatusCodes.OK).json({
            msg:'Freelancer updated successfully',
            freelancer,
        })
    }catch(error){
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
}

const deleteFreelancer = async(req,res) =>{
    try{
        const {id} = req.params;
        const freelancer = await Freelancer.findOneAndDelete(id);
        if(!freelancer){
            throw new CustomError.BadRequestError("Invalid Credentials")
        }
        res.status(StatusCodes.OK).json({msg:'Freelancer deleted Successfulls!'})

    }catch(error){
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }    
}

module.exports = {
    updateFreelancer,
    getFreelancerById,
    deleteFreelancer,
}