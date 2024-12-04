
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

const createFreelancer = async (req, res) => {
    try {
        const { name, email, password, skills, bio, portfolio } = req.body;
        const defaultImage = '/uploads/default.jpg';

        // Validate required fields
        if (!name || !email || !password) {
            throw new CustomError.BadRequestError('Please provide all required fields');
        }

        // Check if freelancer already exists
        const existingFreelancer = await Freelancer.findOne({ email });
        if (existingFreelancer) {
            throw new CustomError.BadRequestError('Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Define the function to safely upload an image
        const uploadImageSafely = async (file) => {
            if (!file) return defaultImage;
            try {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    use_filename: true,
                    folder: 'file-upload',
                });
                return result.secure_url;
            } catch (error) {
                console.error('Error uploading image:', error.message);
                return defaultImage; // Fallback to default image if upload fails
            }
        };

        // Upload images dynamically
        const uploadImages = async (files, defaultImage) => {
            return Promise.all(
                Array.from({ length: 4 }).map((_, i) => {
                    const file = files[`image${i + 1}`];
                    return file ? uploadImageSafely(file) : defaultImage;
                })
            );
        };
        const profilePic = await uploadImageSafely(req.files?.profilePic, defaultImage);
        // Process image uploads
        const [image1, image2, image3, image4] = await uploadImages(req.files || {}, defaultImage);

        // Create the freelancer document
        const newFreelancer = await Freelancer.create({
            name,
            email,
            password: hashedPassword,
            skills,
            bio,
            portfolio,
            profilePic,
            image1,
            image2,
            image3,
            image4,
        });

        // Send response
        res.status(201).json({
            msg: 'Freelancer created successfully',
            newFreelancer: {
                id: newFreelancer._id,
                name: newFreelancer.name,
                email: newFreelancer.email,
                skills: newFreelancer.skills,
                profilePic: newFreelancer.profilePic,
                images: [image1, image2, image3, image4],
            },
        });
    } catch (error) {
        console.error('Error creating freelancer:', error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: 'Server Error',
            error: error.message,
        });
    }
};



const createClient = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const defaultProfilePic = '/uploads/default-profile.jpg'; // Default image if none is uploaded

        // Check if client already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Define the function to safely upload the profile picture
        const uploadImageSafely = async (file, defaultUrl) => {
            if (!file) return defaultUrl; // Return default if no file is uploaded
            try {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    use_filename: true,
                    folder: 'client-profile-images',
                });
                return result.secure_url; // Return the uploaded image URL
            } catch (error) {
                console.error('Error uploading image:', error.message);
                return defaultUrl; // Return default image if upload fails
            }
        };

        // Process the profile picture upload
        const profilePic = await uploadImageSafely(req.files?.profilePic, defaultProfilePic);

        // Create the new client document
        const newClient = new Client({
            name,
            email,
            password: hashedPassword,
            profilePic, // Add the profilePic field
        });
        await newClient.save();

        // Respond with success
        res.status(201).json({
            msg: 'Client created successfully',
            newClient: {
                id: newClient._id,
                name: newClient.name,
                email: newClient.email,
                profilePic: newClient.profilePic, // Include profilePic in the response
            },
        });
    } catch (error) {
        console.error('Error creating client:', error.message);
        res.status(500).json({ msg: 'Server Error', error: error.message });
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
        const userType = user instanceof Freelancer ? 'freelancer' : 'client';
        res.status(StatusCodes.OK).json({ user: tokenUser ,userId:user._id, userType: userType,});
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