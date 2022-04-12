const express = require ('express')
const mongoose  = require('mongoose')
const router = express.Router();
const User = mongoose.model("User")

router.post('/signup',(req,res)=>{
    const {name,email,password}= req.body
    if(!email || !password || !name){
        return res.status(422).json({error:"Please add all the fields"})
    }

    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exists with that email !!"})
        }
        const user = new User({
            email,
            password,
            name
            
        })
        user.save()
        .then(user =>{
            res.json({message:"Successfully signed up",})
        })
        .catch(err=>{
            console.log(err)
        })
    })



    .catch(err=>{
        console.log(err)
    })
    console.log(req.body)

})


router.post('/signin',(req,res)=>{
    User.findOne({email:req.body.email,password:req.body.password},(err,user)=>{
        if(err){
            console.log(err)
            res.status(500).json(err)
          
        }else{
            if(user==null){ res.status(401).json({
                message:'Wrong informations'
            })}
            else{
            res.status(200).json(user)  
            console.log(user)
            }
           
        }

    })
}
)

module.exports = router