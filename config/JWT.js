const jwt = require('jsonwebtoken')
const async = require('hbs/lib/async')
const User = require('../models/user')

const LoginAuth = async (req,res,next)=>{
    try{
        const authorization = await req.headers
        //authorization === Bearer ewefwegwrherhe
        if(!authorization){
           return res.status(401).json({error:"you must be logged in"})
        }
        const token = authorization.replace("Bearer ","")
        jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
            if(err){
             return   res.status(401).json({error:"you must be logged in"})
            }
    
            const {_id} = payload
            User.findById(_id).then(userdata=>{
                req.user = userdata
                next()
            })
            
            
        })
    }
    catch(err){
        console.log(err)
    }
}


const verifyEmail = async (req , res , next)=>{
    try{
        const user = await User.findOne({email: req.body.email})
        if(user.isVerified){
            next()
        }
        else{
            res.status(422).json({error:"Please check your email to verifie your account !!"})
            console.log("Please check your email to verifie your account !!");
        }
    }
    catch(err){
        console.log(err)
    }
}



module.exports = { verifyEmail,LoginAuth }