const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const async = require('hbs/lib/async')
const bcrypt = require("bcrypt")


///// FUNCTIONS ---------------------------------------------------------

const generateUserToken = (id) =>{
  return jwt.sign({ id }, process.env.JWT_SECRET)
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});
///// Exports ---------------------------------------------------------

    
exports.register = async (req, res) => {
    
      const {username,email,password,gender} = req.body 

      if(!email || !password){
        return res.status(422).json({error:"please add email or password"})
      }      
      else if (await User.findOne({ email })) {
        res.status(403).send({ message: "User already exist !" })
      } else {
        let user = await new User({
              username,
              email,
              password: await bcrypt.hash(password, 10),
              gender,
            }).save()

            // token creation
          const token = generateUserToken(user._id)



          var mailOptions = {
            from: process.env.GMAIL_USER,
            to: user.email,
            subject: 'Confirm your email',
            html:'<h3>' + user.username + ' thank you for registering on our App </h3><h4> Please <a href="http://' +req.headers.host+'/user/verify-email?token='+token+'"> verfiy Your Email</a> </h4>'
          }
          transporter.verify(function (error, success) {
            if (error) {
              console.log(error)
              console.log("Server not ready")
            } else {
              console.log("Server is ready to take our messages")
            }
          })
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
            } else {
              console.log("Email sent to "+ user.email)
            }
          })
          res.status(200).send({
            message: "success !",
            user})
        
          }   
}

exports.verify = async (req, res) => {
  try{
    const token = req.query.token
    const user = await User.findOne({token : token})
    if (!user) {
          console.log(!user)
          return res.status(401).send({ message: "This user doesn't exist, please register !." });
        }
    else{
      if (user.isVerified) {
        return res.status(200).send({ message: 'This user has already been verified, please login' })
      }
      else{
      user.isVerified = true
      await user.save()
      res.send({ message: "Your account has been verified !" })
      console.log(user.email + " has been verified !");
      }
    }
  }
  catch(err){
    console.log(err)
  }
}

exports.login = async (req, res) => {
          const {email,password} = req.body
          if(!email || !password){
             return res.status(422).json({error:"please add email or password"})
          }
          const user = await User.findOne({ email })

          if (user && (await bcrypt.compare(password, user.password))) {

            const token = generateUserToken(user._id)

              res.json({token,user})
              }
              else{
                  return res.status(422).json({error:"Invalid Email or password"})
                      
                  }        
}

exports.get = async (req, res) => {
  const user = await User.findById(req.body._id)
}

exports.getAll = async (req, res) => {
  res.send({ users: await User.find() })
}

exports.deleteAll = async (req, res) => {
  await User.remove({})
  res.send({ message: "All users have been deleted" })
}

exports.forgotPassword = async (req, res) => {

  const user = await User.findOne({ email: req.body.email })

  if (user) {

    var mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Forget Password",
      html: "<h3>We heard that you forget your password</h3><p> Here's your rest password link : <b style='color : blue'><a href='http://" +req.headers.host+"/user/update-password'>Reset Your Password</a></b></p>",}

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error)
        console.log("Server not ready")
      } else {
        console.log("Server is ready to take our messages")
      }
    })
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log("Rest password link sent to "+ user.email)
        res.json({message : "Rest password link sent to "+ user.email})
      }
    })
  } else {
    res.status(404).send({ message: "User dosen't exist !" })
  }
}

exports.updateProfile = async (req, res) => {
  const { email, username, gender } = req.body

await User.findOneAndUpdate(
    { email: email },
    {
      $set: {
        username,
        email,
        gender

      },
    }
  )

  return res.send({ message: "Profile updated successfully"})
}

exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body

  if (newPassword) {
    newPasswordEncrypted = await bcrypt.hash(newPassword, 10)

    let user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password:newPasswordEncrypted,
        },
      }
    )

    return res.send({ message: "Password updated successfully", user })
  }
   
  else if (bcrypt.compare(password, user.password)) {
    res.status(402).send({ message: "it's the same password ! you should choose a new one." })
  }
  else {
     res.status(403).send({ message: "Password should not be empty" })
  }
}

exports.delete = async (req, res) => {
  let user = await User.findById(req.body._id)
  if (user) {
    await user.remove()
    return res.send({ message: user.username +" ( "+ user.email + " ) have been deleted" })
  } else {
    return res.status(404).send({ message: "User does not exist" })
  }
}
