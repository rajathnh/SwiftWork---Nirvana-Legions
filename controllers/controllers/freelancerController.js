const Freelancer = require('../models/freelancer')
const bcrypt = require('bcryptjs')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')
const cloudinary = require('cloudinary');  

const getAllFreelancers = async(req,res) =>{
    const freelancer = await Freelancer.find({});
    res.status(StatusCodes.OK).json({ freelancer, count: freelancer.length });
}

const getFreelancerById = async(req,res)=>{
    try{
        const{id:freelancerId} = req.params;
        
        const freelancer = await Freelancer.findOne({_id:freelancerId}).populate({path:'reviews',select:'title comment rating user'})
        console.log(freelancer)
        if(!freelancer){
            throw new CustomError.BadRequestError("Invalid Credentials")
        }
        res.status(StatusCodes.OK).json({freelancer:{
            id:freelancer._id,
            name:freelancer.name,
            email:freelancer.email,
            bio:freelancer.bio,           
            skills:freelancer.skills,
            image1:freelancer.image1,
            image2:freelancer.image2,
            image3:freelancer.image3,
            image4:freelancer.image4,
            averageRating:freelancer.averageRating,
            numOfReviews:freelancer.numOfReviews,
            reviews:freelancer.reviews,
        }
        })
    }
    catch(error){
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
}



const uploadImageSafely = async (file) => {
    const defaultImage = '/uploads/default.jpg';
    if (!file) return defaultImage;
  
    try {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: 'file-upload'
      });
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return defaultImage; // fallback if upload fails
    }
  };
  
  const updateFreelancer = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password, skills, bio, portfolio } = req.body;
  
      // Check if freelancer exists
      const freelancer = await Freelancer.findById(id);
      if (!freelancer) {
        throw new CustomError.NotFoundError('Freelancer not found');
      }
  
      // Handle image uploads if files exist
      const image1 = req.files?.image1 ? await uploadImageSafely(req.files.image1) : freelancer.image1;
      const image2 = req.files?.image2 ? await uploadImageSafely(req.files.image2) : freelancer.image2;
      const image3 = req.files?.image3 ? await uploadImageSafely(req.files.image3) : freelancer.image3;
      const image4 = req.files?.image4 ? await uploadImageSafely(req.files.image4) : freelancer.image4;
  
      // Update freelancer details
      freelancer.name = name || freelancer.name;
      freelancer.email = email || freelancer.email;
      freelancer.password = password ? await bcrypt.hash(password, 10) : freelancer.password;
      freelancer.skills = skills || freelancer.skills;
      freelancer.bio = bio || freelancer.bio;
      freelancer.portfolio = portfolio || freelancer.portfolio;
  
      // Update the images if they are provided
      freelancer.image1 = image1;
      freelancer.image2 = image2;
      freelancer.image3 = image3;
      freelancer.image4 = image4;
  
      await freelancer.save();
  
      res.status(StatusCodes.OK).json({
        msg: 'Freelancer updated successfully',
        freelancer: {
          id: freelancer._id,
          name: freelancer.name,
          email: freelancer.email,
          skills: freelancer.skills,
          bio: freelancer.bio,
          portfolio: freelancer.portfolio,
          image1: freelancer.image1,
          image2: freelancer.image2,
          image3: freelancer.image3,
          image4: freelancer.image4,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server Error', error: error.message });
    }
  };
  

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
    getAllFreelancers,
    updateFreelancer,
    getFreelancerById,
    deleteFreelancer,
}