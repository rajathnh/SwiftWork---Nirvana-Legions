
const Freelancer = require('../models/freelancer')
const Client = require('../models/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
const cloudinary = require('cloudinary');
const fs = require('fs/promises')

const createFreelancer = async (req,res)=>{
    try {
        // console.log('Received files:', req.files);
        // console.log('Received body:', req.body);

        const { name, email, password, skills, bio, portfolio } = req.body;
        const defaultImage = '/uploads/default.jpg';
        
        // Function to upload image safely
        const uploadImageSafely = async (file) => {
            if (!file) return defaultImage;
            try {
                console.log('Attempting to upload file:', {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size,
                    tempFilePath: file.tempFilePath
                });

                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    use_filename: true,
                    folder: 'file-upload'
                });

                console.log('Cloudinary upload result:', {
                    url: result.secure_url,
                    public_id: result.public_id
                });

                return result.secure_url;
            } catch (error) {
                console.error('Detailed Image upload error:', {
                    message: error.message,
                    stack: error.stack,
                    file: file
                });
                return defaultImage;
            }
        };

        // Safely upload images
        const image1 = req.files?.image1 
            ? await uploadImageSafely(req.files.image1) 
            : defaultImage;
        const image2 = req.files?.image2 
            ? await uploadImageSafely(req.files.image2) 
            : defaultImage;
        const image3 = req.files?.image3 
            ? await uploadImageSafely(req.files.image3) 
            : defaultImage;
        const image4 = req.files?.image4 
            ? await uploadImageSafely(req.files.image4) 
            : defaultImage;
    


    const existingFreelancer = await Freelancer.findOne({email});
    if(existingFreelancer){
        return res.status(400).json({msg:'Email already exists'})
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const newFreelancer = new Freelancer({name,email,password:hashedPassword,skills,bio,portfolio,image1,image2,image3,image4})
    await newFreelancer.save()

    res.status(201).json({
        msg:'Freelancer created successfully',
        newFreelancer:{
            id: newFreelancer._id,
            name: newFreelancer.name,
            email: newFreelancer.email,
            skills: newFreelancer.skills,
            image1: newFreelancer.image1,
            image2: newFreelancer.image2,
            image3: newFreelancer.image3,
            image4: newFreelancer.image4,
        },
    });
}catch(error){
    res.status(500).json({msg:'Server Error',error:error.message});
}
};

const createClient = async(req,res)=>{
    try{
    const{name,email,password} = req.body;
    const existingClient = await Client.findOne({email})
    if(existingClient)
    {
        return res.status(400).json({msg:'Email already exists'})
    }
    const hashedPassword = await bcrypt.hash(password,10);
    
    const newClient = new Client({name,email,password:hashedPassword});
    await newClient.save();    
    
    res.status(201).json({msg:'client created successfully',newClient: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,},
    });
}catch(error){
    res.status(500).json({msg:'Server Error',error:error.message});
}
};

const login = async(req,res)=>{
    try{
        const {email,password} = req.body;       
        
        if(!email || !password){
            throw new CustomError.BadRequestError('Please provide email and password')
        }

        let user = await Freelancer.findOne({email});
        
        
        if(!user){
            user = await Client.findOne({email});
            
        }
        
        if(!user) {
            throw new CustomError.UnauthenticatedError('Invalid Credentials')
        }       
       
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        
        
        if(!isPasswordCorrect){
            throw new CustomError.UnauthenticatedError('Invalid Credentials')
        }        
        
        const tokenUser = createTokenUser(user);
        attachCookiesToResponse({ res, user: tokenUser });
        res.status(StatusCodes.OK).json({ user: tokenUser });
    }catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server Error', error: error.message });
    }
}



const logout = async (req, res) => {
    res.cookie('token', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now() + 1000),
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
  };

module.exports = {
    createFreelancer,
    createClient,
    login,
    logout,
}
