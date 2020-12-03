const express = require('express')
const router = express.Router()
const axios = require('axios').default
const db = require('../models')

router.get('/', (req, res) => {
    // Currently, this query variable doesn't do anything
    const query = req.query
    axios
        .get(`http://gutendex.com/books?languages=en&copyright=false&${query}`)
        .then(response => {
            res.render('books/index', { books: response.data.results })
        })
        .catch(error => {
            res.send(error)
        })
})

router.get('/rated', (req, res) => {
    db.rating
        .findAll({
            // where: { userId: currentUser.id }
        }).then(response => {
            res.render('books/rated', { ratings: response })
        }).catch(error => {
            res.send(error)
        })
})

router.post('/rated', (req, res) => {
    db.rating
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            value: req.body.value
        })
        .then(response => {
            res.redirect('/books')
        })
        .catch(error => {
            res.send(error)
        })
})

router.post('/read', (req, res) => {
    db.status
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            read: req.body.read
        })
        .then(response => {
            res.redirect('/books')
        })
        .catch(error => {
            res.send(error)
        })
})

module.exports = router