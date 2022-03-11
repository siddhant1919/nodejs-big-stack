const express = require('express')

const bcrypt = require('bcrypt')
const jsonwt = require('jsonwebtoken')
const passport = require('passport')
const key = require('../../setup/myurl')

const router = express.Router()


// @type   GET
// @route  /api/auth
// @desc   just for testing
// @access PUBLIC
router.get('/', (req, res) => res.json({ test: 'Auth is being tested' }))

// Import schema for person to register
const Person = require('../../models/Person')
const { secret } = require('../../setup/myurl')

// @type   POST
// @route  /api/auth/register
// @desc   route for registration of user
// @access PUBLIC
router.post('/register', (req, res) => {
  Person.findOne({ email: req.body.email })
    .then((person) => {
      if (person) {
        return res.status(400).json({ emailerr: "email is already register in our system" })
      } else {
        const newPerson = new Person({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        })

        // Encrypting password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err) throw err;
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => res.json(person))
              .catch(err => console.log(err))
          });
        });
      }
    })
    .catch(err => console.log(err))
})

// @type   POST
// @route  /api/auth/login
// @desc   route for login of user
// @access PUBLIC
router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res.status(404).json({ emailerror: "user not found with this email" })
      }
      bcrypt.compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            // res.json({success: "login success"})

            // use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jsonwt.sign(
              payload,
              key.secret,
              { expriresIn: 3600 },
              (err, token) => {
                res.json({ 
                  success: true,
                  token: "Bearer "+ token
                })
              }
            )

          } else {
            res.status(400).json({ passworderror: "incorrect password" })
          }
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})

// @type   GET
// @route  /api/auth/profile
// @desc   route for user pofile
// @access PRIVATE

router.get('/profile', passport.authenticate('jwt',{session: false}), (req, res) => {
  // console.log(req)

  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    profilepic: req.user.profilepic
  })
})


module.exports = router

