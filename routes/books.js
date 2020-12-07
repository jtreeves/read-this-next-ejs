// Imports
const express = require('express')
const axios = require('axios').default
const db = require('../models')
const sequelize = require('sequelize')
const math = require('mathjs')
const isLoggedIn = require('../middleware/isLoggedIn')

// Constants
const router = express.Router()
const op = sequelize.Op
const url = 'http://gutendex.com/books?languages=en&copyright=false'

// Chooses a random element from an array
function randomElement(array) {
    return array[math.floor(math.random() * array.length)]
}

// Generates a random array of integers
function randomIds() {
    const ids = []
    for (let i = 0; i < 10; i++) {
        ids[i] = math.floor(math.random() * 10000)
    }
    return ids
}

// Checks for similar titles
function excludeDuplicates(mainTitle, testTitle) {
    const mainStripped = mainTitle.replace(/[^a-zA-Z0-9 ]/g, '')
    const testStripped = testTitle.replace(/[^a-zA-Z0-9 ]/g, '')
    const mainArray = mainStripped.split(' ')
    let mainShort = ''
    if (mainArray.length >= 3) {
        const mainSliced = mainArray.slice(0, 3)
        mainShort = mainSliced.join(' ')
    } else {
        mainShort = mainStripped
    }
    return !testStripped.includes(mainShort)
}

// GET route for index
router.get('/', isLoggedIn, (req, res) => {
    const list = randomIds()
    axios
        .get(url + `&ids=${list.toString()}`)
        .then(responses => {
            res.render('books/index', {
                books: responses.data.results,
                currentUser: res.locals.currentUser
            })
        })
        .catch(() => res.status(400).render('404'))
})

// GET route for favorites
router.get('/favorites', isLoggedIn, (req, res) => {
    db.favorite
        .findAll({
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            const ids = []
            for (let i = 0; i < responses.length; i++) {
                ids[i] = responses[i].bookId
            }
            axios
                .get(url + `&ids=${ids.toString()}`)
                .then(outputs => {
                    res.render('books/favorites', {
                        books: outputs.data.results,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(() => res.status(400).render('404'))
        })
        .catch(() => res.status(400).render('404'))
})

// GET route for suggestion
router.get('/suggestion', isLoggedIn, (req, res) => {
    const user = res.locals.currentUser
    db.rating
        .findAll({
            where: {
                userId: user.id,
                value: 5
            }
        })
        .then(responses => {
            const randomStarredId = randomElement(responses).bookId
            axios
                .get(url + `&ids=${randomStarredId}`)
                .then(output => {
                    const starredBook = output.data.results[0]
                    const starredSubjects = starredBook.subjects
                    const randomStarredSubject = randomElement(starredSubjects).split(' ')[0]
                    axios
                        .get(url + `&topic=${randomStarredSubject}`)
                        .then(elements => {
                            const ids = []
                            const materials = elements.data.results
                            for (let i = 0; i < materials.length; i++) {
                                ids[i] = materials[i].id
                            }
                            finalSelection()
                            function finalSelection() {
                                const randomId = randomElement(ids)
                                const randomBook = materials[materials.findIndex(object => object.id === randomId)]
                                db.pass
                                    .findAndCountAll({
                                        where: {
                                            userId: user.id,
                                            bookId: randomId
                                        }
                                    })
                                    .then(check => {
                                        if (check.count === 0) {
                                            if (excludeDuplicates(starredBook.title, randomBook.title)) {
                                                axios
                                                    .get(url + `&ids=${randomId}`)
                                                    .then(product => {
                                                        res.render('books/suggestion', {
                                                            book: product.data.results[0],
                                                            currentUser:user
                                                        })
                                                    })
                                                    .catch(() => res.status(400).render('404'))
                                            } else {
                                                finalSelection()
                                            }
                                        } else {
                                            finalSelection()
                                        }
                                    })
                                    .catch(() => res.status(400).render('404'))
                            }
                        })
                        .catch(() => res.status(400).render('404'))
                })
                .catch(() => res.status(400).render('404'))
        })
        .catch(() => res.status(400).render('404'))
})

// GET route for text
router.get('/text/:id', isLoggedIn, (req, res) => {
    const id = req.params.id
    axios
        .get(url + `&ids=${id}`)
        .then(response => {
            const bookObject = response.data.results[0]
            const bookUrl = bookObject.formats['text/plain; charset=utf-8']
            axios
                .get(bookUrl)
                .then(output => {
                    res.render('books/text', {
                        book: bookObject,
                        text: output.data,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(() => res.status(400).render('404'))
        })
        .catch(() => res.status(400).render('404'))
})

// GET route for rated
router.get('/rated', isLoggedIn, (req, res) => {
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
                    res.render('books/rated', {
                        books,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(() => res.status(400).render('404'))
        })
        .catch(() => res.status(400).render('404'))
})

// GET route for read
router.get('/read', isLoggedIn, (req, res) => {
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
                        books: outputs.data.results,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(() => res.status(400).render('404'))
        })
        .catch(() => res.status(400).render('404'))
})

// POST route for rated
router.post('/rated', (req, res) => {
    db.rating
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            value: req.body.value
        })
        .then(() => res.redirect('/books/rated'))
        .catch(() => res.status(400).render('404'))
})

// POST route for read
router.post('/read', (req, res) => {
    db.status
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId,
            read: req.body.read
        })
        .then(() => res.redirect('/books/read'))
        .catch(() => res.status(400).render('404'))
})

// POST route for favorites
router.post('/favorites', (req, res) => {
    db.favorite
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId
        })
        .then(() => res.redirect('/books/favorites'))
        .catch(() => res.status(400).render('404'))
})

// POST route for pass
router.post('/pass', (req, res) => {
    db.pass
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId
        })
        .then(() => res.redirect('/books/suggestion'))
        .catch(() => res.status(400).render('404'))
})

// PUT route for ratings
router.put('/:id', (req, res) => {
    db.rating
        .update(
            {
                value: req.body.value
            },
            {
                where: {
                    userId: req.body.userId,
                    bookId: req.body.bookId
                }
            }
        )
        .then(() => res.redirect('/books/rated'))
        .catch(() => res.status(400).render('404'))
})

// DELETE route for favorites
router.delete('/:id', (req, res) => {
    db.favorite
        .destroy({
            where: {
                userId: req.body.userId,
                bookId: req.body.bookId
            }
        })
        .then(() => res.redirect('/books/favorites'))
        .catch(() => res.status(400).render('404'))
})

// Exports
module.exports = router