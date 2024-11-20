const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const freelancerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        minlength:3,
        maxlength:50,
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'Please provide email'
        }
    },
    password:{
        type:String,
        required:[true,'Please provide password'],
        minlength:6,
        trim:true,
    },
    portfolio:{
        type:String,
    },
    bio:{
        type:String,
        maxlength:1000,
    },
    skills:{
        type:[String],
        required:true,
    },
    ratings:{
        average:{
            type:Number,
            default:0,
        },
        totalReviews:{
            type:Number,
            default:0,
        },
    },
    image1:{
        type:String,
        default:'/uploads/default.jpg',
        //required:[true,'Please upload an image showcasing your skills'],
        
    },
    image2:{
        type:String,
        default:'/uploads/default.jpg'
    },
    image3:{
        type:String,
        default:'/uploads/default.jpg'
    },
    image4:{
        type:String,
        default:'/uploads/default.jpg'
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
})


module.exports = mongoose.model('Freelancer',freelancerSchema)