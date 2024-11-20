const mongoose = require('mongoose')
const validator = require('validator')
const clientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true,
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        validate: {
            validator:validator.isEmail,
            message: 'Please provide valid email',
          },
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:6,
        trim:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
})

module.exports = mongoose.model('Client',clientSchema);