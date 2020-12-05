const express = require('express')
const router = express.Router()
const axios = require('axios').default
const db = require('../models')

const url = 'http://gutendex.com/books?languages=en&copyright=false'

router.get('/', (req, res) => {
    axios
        .get(url)
        .then(response => {
            res.render('books/index', {
                books: response.data.results,
                currentUser: res.locals.currentUser
            })
        })
        .catch(error => {
            res.send(error)
        })
})

router.get('/rated', (req, res) => {
    db.rating
        .findAll({
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            let outputs = []
            for (let i = 0; i < responses.length; i++) {
                outputs[i] = {
                    id: responses[i].bookId,
                    rating: responses[i].value
                }
            }
            let idArray = []
            for (let i = 0; i < outputs.length; i++) {
                idArray[i] = outputs[i].id
            }
            console.log(`IDARRAY: ${idArray}`)
            let idString = idArray.toString()
            let queryString = `&ids=${idString}`
            console.log(`QUERYSTRING: ${queryString}`)
            console.log(`FULL URL STRING: ${url + queryString}`)
            axios
                .get(url + queryString)
                .then(bookMaterials => {
                    res.render('books/rated', {
                        books: bookMaterials.data.results
                    })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/read', (req, res) => {
    db.status
        .findAll({
            where: {
                userId: res.locals.currentUser.id,
                read: true
            }
        })
        .then(response => {
            console.log(`STATUSES RESPONSE VARIABLE: ${response}`)
            res.render('books/read', { statuses: response })
        })
        .catch(error => {
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