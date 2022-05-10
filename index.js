require('./config/db')
require("dotenv").config()


// DEPENDENCIES
const express = require("express")

// VARIABLES
const app = express();
const port = 7777

// MIDDLEWARES
app.use(express.json())



// ROUTES
app.use("/user", require("./routes/user-route"))



// SERVER START
app.listen(port, () => console.log(`Server up and running on port ${port} !`))