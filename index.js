require('./config/db')
require("dotenv").config()


// DEPENDENCIES
const express = require("express")

// VARIABLES
const app = express();
const port = process.env.PORT

// MIDDLEWARES
app.use(express.json())
app.use(express.static('public'))
app.use('/img', express.static('uploads/images'))



// ROUTES
app.use("/user", require("./routes/user-route"))
app.use("/post", require("./routes/post-route"))



// SERVER START
app.listen(port, () => console.log(`Server up and running on port ${port} !`))