const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')


// Bringing all routes
const auth = require('./routes/api/auth')
const profile = require('./routes/api/profile')
const questions = require('./routes/api/questions')


const port = process.env.port || 3000

const app = express()

// Middleware for badyParser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// mongoDB configuration
const db = require('./setup/myurl').mongoURL

// attemp to connect to database
mongoose
  .connect(db)
  .then(() => {
    console.log('MongoDB connected successfully')
  })
  .catch(err => console.log("not connected"))

// Passport middleware
app.use(passport.initialize())

// Config for jwt strategy
require('./strategies/jsonwtStrategy')(passport)

// Just for testing -> routes 
app.get('/',(req, res) => {
  res.send('Hey there big stack')
})

// actual routes
app.use('/api/auth', auth)
app.use('/api/profile', profile)
app.use('/api/questions', questions)

app.listen(port, () => console.log(`app is running at port ${port}`))