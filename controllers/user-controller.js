const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const async = require('hbs/lib/async')
const randomstring = require ("randomstring")


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


const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

const decrypt = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};


///// Exports ---------------------------------------------------------

    
exports.register = (req, res) => {
    
      const {username,email,password,gender} = req.body 

      if(!email || !password){
        return res.status(422).json({error:"please add email or password"})
      }      
      User.find({email}).then(result=>{
        if(result.length){
          res.json({
            message:" email already exist !!"
          })
        }
        else{
          const encrypted_text = crypt("salt", password);

            const user = new User({
              username,
              email,
              password:encrypted_text,
              gender,
            })
          user.save()
          const token = generateUserToken(user._id)

          const decrypted_string = decrypt("salt", encrypted_text)

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
              res.json({user,decrypted_string})
            }
          })
        
          }
      })
    

    
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
          User.findOne({email:email})
          .then(user=>{
              if(!user){
                 return res.status(422).json({error:"Invalid Email or password"})
              }
              const decrypted_string = decrypt("salt", user.password)
              if(password == decrypted_string)
              {
                    const {_id,username,email} = user
        
                     const token = generateUserToken(user._id)

                     res.json({token,user})
              }
              else{
                      return res.status(422).json({error:"Invalid Email or password"})
                      
                  }
              })
              .catch(err=>{
                  console.log(err)
              })
          
}

exports.get = async (req, res) => {
  const user = await User.findById(req.body._id)
  if (user) {
    const decrypted_string = decrypt("salt", user.password)
    res.status(200).send({
      message: "password is : " + decrypted_string
    })
  }
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
    const decrypted_string = decrypt("salt", user.password)

    var mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Forget Password",
      html: "<h3>We heard that you forget your password</h3><p> Here's your password : <b style='color : blue'>" +
      decrypted_string 
      +
      "</b></p>",}
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
        console.log("Rest password code sent to "+ user.email)
        res.json({user})
      }
    })

    res.status(200).send({
      message: "Your password sent to " + user.email + "  ------------------------->  " +
      " Your password is : " + decrypted_string
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
    const newPasswordEncrypted = crypt("salt", newPassword);

    let user = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: newPasswordEncrypted,
        },
      }
    )

    return res.send({ message: "Password updated successfully", user })
  }
  // } else if (newPassword == user.password) {
  //   return res.status(402).send({ message: "it's the same password ! you should choose a new one." })
  // }
  else{
    return res.status(403).send({ message: "Password should not be empty" })
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
