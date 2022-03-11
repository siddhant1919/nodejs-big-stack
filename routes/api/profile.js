const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')
const { off } = require('../../models/Person')

// load person model
const Person = require('../../models/Person')

// load profile model
const Profile = require('../../models/Person')

// @type   GET
// @route  /api/profile/
// @desc   route for individual user profile
// @access PRIVATE
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          return res.status(404).json({ prfilenotfound: "user not found" })
        }
        res.json(profile);
      })
      .catch(err => console.log("got some error in profile" + err))
  })


// @type   POST
// @route  /api/profile/
// @desc   route for Updating/Saving user profile
// @access PRIVATE
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const profileValues = {}
    profileValues.user = req.user.id
    if (req.body.username) profileValues.username = req.body.username
    if (req.body.website) profileValues.website = req.body.website
    if (req.body.country) profileValues.country = req.body.country
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio
    if (typeof req.body.languages !== undefined) profileValues.languages = req.body.languages.split(',')

    // get social links
    profileValues.social = {}
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram

    // Do database stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { mew: true }
          )
            .then((profile) => res.json(profile))
            .catch(err => console.log('Problem in update' + err))
        } else {
          Profile.findOne({ username: profileValues.username })
            .then(profile => {
              // username already exists
              if (profile) {
                res.status(400).json({ username: "Username already exist" })
              }
              // save user
              new Profile(profileValues)
                .save()
                .then(profile => res.json(profile))
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        }
      })
      .catch(err => console.log("Problem in fetching profile" + err))

  }
)

// @type   GET
// @route  /api/profile/:username
// @desc   route for getting user profile based on username
// @access PUBLIC
router.get('/:username', (req, res) => {
  Profile.findOne({ username: req.params.useraname })
    .populate('user', ['name', 'profilepic'])
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "User not found" })
      }
      res.json(profile)
    })
    .catch(err => console.log("error in fetching username" + err));
})


// @type   GET
// @route  /api/profile/find/everyone
// @desc   route for getting user profile of EVERYONE
// @access PUBLIC
router.get('/find/everyone', (req, res) => {
  Profile.find()
    .populate('user', ['name', 'profilepic'])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ usernotfound: "No profile was found" })
      }
      res.json(profiles)
    })
    .catch(err => console.log("error in fetching username" + err));
})

// @type   DELETE
// @route  /api/profile/
// @desc   route for deleting users based on ID
// @access PRIVATE

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      Person.findOneAndRemove({ _id: req.user.id })
        .then(() => res.json({ success: "Delete was success" }))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})


// @type   POST
// @route  /api/profile/workrole
// @desc   route for workprofile of a person
// @access PRIVATE
router.post('/workrole', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      if (!profile) {
        res.status(404).json({ usernotfound: "User not found" })
      }

      const newWork = {
        role: req.body.role,
        company: req.body.company,
        country: req.body.country,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        details: req.body.details
      };
      profile.workrole.unshift(newWork);
      profile
        .save()
        .then(profile => { res.json(profile) })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

// @type   DELETE
// @route  /api/profile/workrole/:w_id
// @desc   route for deleting a speceific workrole 
// @access PRIVATE
router.delete('/workrole/:w_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (!profile) {
        res.status(404).json({ usernotfound: "User not found" })
      }

      const removethis = profile.workrole.map(item => item.id).indexOf(req.params.w_id);

      profile.workrole.splice(removethis, 1)
      profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

module.exports = router