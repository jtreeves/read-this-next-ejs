const express = require('express')
const router = express.Router()
const db = require('../models')
const axios = require('axios').default

router.get('/index', (req, res) => {
    // Currently, this query variable doesn't do anything
    const query = req.query
    axios
        .get(`http://gutendex.com/books?languages=en&copyright=false&${query}`)
        .then(response => {
            res.render('books/index', { results: response.data.results })
        })
        .catch(error => {
            res.send(error)
        })
})

// router.post()

module.exports = router