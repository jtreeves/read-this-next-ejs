const express = require('express')
const axios = require('axios').default
const db = require('../models')
const sequelize = require('sequelize')

const router = express.Router()
const op = sequelize.Op
const url = 'http://gutendex.com/books?languages=en&copyright=false'

router.get('/', (req, res) => {
    axios
        .get(url)
        .then(responses => {
            res.render('books/index', {
                books: responses.data.results,
                currentUser: res.locals.currentUser
            })
        })
        .catch(error => res.send(error))
})

router.get('/favorites', (req, res) => {
    res.render('books/favorites')
})

router.get('/suggestion', (req, res) => {
    db.rating
        .findAll({
            where: {
                userId: res.locals.currentUser.id,
                value: 5
            },
            limit: 1
        })
        .then(response => {
            axios
                .get(url + `&ids=${response[0].bookId}`)
                .then(output => {
                    axios
                        .get(url + `&topic=${output.data.results[0].subjects[0].split(' ')[0]}`)
                        .then(elements => {
                            res.render('books/suggestion', {
                                books: elements.data.results
                            })
                        })
                        .catch(rejection => res.send(rejection))
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/text', (req, res) => {
    res.render('books/text')
})

router.get('/rated', (req, res) => {
    db.rating
        .findAll({
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            const books = []
            for (let i = 0; i < responses.length; i++) {
                books[i] = {
                    id: responses[i].bookId,
                    rating: responses[i].value
                }
            }
            const ids = []
            for (let i = 0; i < books.length; i++) {
                ids[i] = books[i].id
            }
            axios
                .get(url + `&ids=${ids.toString()}`)
                .then(outputs => {
                    const materials = outputs.data.results
                    for (let i = 0; i < books.length; i++) {
                        for (let j = 0; j < materials.length; j++) {
                            if (books[i].id === materials[j].id) {
                                books[i].materials = materials[j]
                            }
                        }
                    }
                    res.render('books/rated', { books })
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
        .then(responses => {
            const ids = []
            for (let i = 0; i < responses.length; i++) {
                ids[i] = responses[i].bookId
            }
            axios
                .get(url + `&ids=${ids.toString()}`)
                .then(outputs => {
                    res.render('books/read', {
                        books: outputs.data.results
                    })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.post('/rated', (req, res) => {
    db.rating
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            value: req.body.value
        })
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

router.post('/read', (req, res) => {
    db.status
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            read: req.body.read
        })
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

module.exports = router