require('./config/db')
const app = require('express')()
const port = 3000
const express = require('express')

app.use(express.json())
require('./models/user.model')
app.use(require('./controllers/user.controller'))



app.listen(port, ()=>{

    console.log('Server running on port ', port);
})