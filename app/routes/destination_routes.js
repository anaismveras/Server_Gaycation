require('dotenv').config()
const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
// pull in error types and the logic to handle them and set status codes
const errors = require('../../lib/custom_errors')
const axios = require('axios')
const requireToken = passport.authenticate('bearer', { session: false })

const Destination = require('../models/destination')

const router = express.Router()

// API call to GET one destination based on city/country name
router.get('/destinations/:destinationname', requireToken, (req, res, next) => {
    const key_value = `?q=${req.params.destinationname}`
    axios.get(`https://api.roadgoat.com/api/v2/destinations/auto_complete${key_value}`, {
        headers: { 
            'Authorization': `Basic ${process.env.AUTH_KEY}`
          }
    })
    .then(resp => {
        // console.log('Destination:\n', resp.data)
        res.json(resp.data)
    })
    .catch(next)
})

// GET --> get all destinaitions in db
router.get('/destinations', requireToken, (req, res, next) => {
    Destination.find({
        owner: req.user.id
    })
    .then(des => {
        res.json(des)
    })
    .catch(next)
})

// GET --> get only one destination from the db based on the roatGoatId
router.get('/destinations/gaycations/:destinationId', requireToken, (req, res, next) => {
    Destination.find({
        roadGoatId: req.params.destinationId
    })
    .populate('reviews')
    .then(des => {
        res.json(des)
    })
    .catch(next)
})

// GET --> show ONE destination by ID
router.get('/destination/:destinationId', requireToken, (req, res, next) => {
    const key_value = `${req.params.destinationId}`
    // console.log('this is key value', key_value)
    axios.get(`https://api.roadgoat.com/api/v2/destinations/${key_value}`, {
        headers: { 
            'Authorization': `Basic ${process.env.AUTH_KEY}`
          }
    })
    .then(rest => {
        res.json(rest.data)
    })
    .catch(next)
})

// POST create a destination into database, based on user fave gaycations
router.post('/destinations', requireToken, (req, res, next) => {
    if(req.body.body.imageUrl) {
        // console.log('this is req.body', req.body.body.imageUrl)
        req.body.owner = req.user.id
        Destination.create({
            city:req.body.body.cityName,
            country:req.body.body.cityCountry,
            image_url:req.body.body.imageUrl,
            description:req.body.body.cityDescription,
            owner: req.body.owner,
            buisness:[],
            reviews:[],
            roadGoatId: req.body.body.cityId
        })
        // .then(errors.handle404)
        .then(data => res.status(200).json(data))
        .catch(next)
    } else {
        // console.log('this is req.body', req.body.body.cityImageId)
        req.body.owner = req.user.id
        Destination.create({
            city:req.body.body.cityName,
            country:req.body.body.cityCountry,
            image_url:req.body.body.cityImageId,
            description:req.body.body.cityDescription,
            owner: req.body.owner,
            buisness:[],
            reviews:[],
            roadGoatId: req.body.body.cityId
        })
        // .then(errors.handle404)
        .then(data => res.status(200).json(data))
        .catch(next)
    }
})

// DELETE one destination from db
router.delete('/destination/:destinationId', requireToken, (req, res, next) => {
    Destination.findOneAndDelete({
        _id: req.params.destinationId
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})


module.exports = router