const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    username: {
        type:String,
        require:true},
        
    email: {
        type:String,
        require:true},

    password: {
        type:String,
        require:true
        },

    gender: {
        type:String,
        require:true},
    
    isVerified: {
        type:Boolean,
        default:false
        
    },



 })

 module.exports = mongoose.model("User", userSchema)
