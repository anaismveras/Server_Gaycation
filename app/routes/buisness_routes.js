require('dotenv').config()
const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
// pull in error types and the logic to handle them and set status codes
const router = express.Router()
const Destination = require('../models/destination')
const customErrors = require('../../lib/custom_errors')
const { default: axios } = require('axios')
const handle404 = customErrors.handle404

// GET all "open to all" businesses from YELP Fusion API
router.get('/businesses/:destinationname', (req, res, next) => {
    axios.get(`https://api.yelp.com/v3/businesses/search?location=${req.params.destinationname}&attributes=open_to_all`, {
        headers: {
            "Authorization": `Bearer ${process.env.API_KEY}`
        }
    }).then(resp => {
        // for checking
        // console.log('response\n:', resp.data)
        res.json(resp.data.businesses)
    })
    .catch(next)
})

// GET --> SHOW all "open to all" buisnesses
router.get('/businesses/:destinationId', (req, res, next) => {
    Destination.findById(req.params.destinationId)
    .then(busi => {
        return busi.businesses
    })
    .then(busi => res.status(200).json(busi))
    .catch(next)
})

// POST --> create a buisness put it in db
router.post('/businesses/:destinationId', (req, res, next) => {
    Destination.findById(req.params.destinationId)
    .then(des => {
        des.business.push(req.body.business)
        des.save()
    })
    .then(business => res.status(200).json({ business: business }))
    .catch(next)
})

module.exports = router