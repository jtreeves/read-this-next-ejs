const express = require('express')
const axios = require('axios').default
const db = require('../models')
const sequelize = require('sequelize')
const math = require('mathjs')
// const regex = require('rejex')

const router = express.Router()
const op = sequelize.Op
const url = 'http://gutendex.com/books?languages=en&copyright=false'

function randomElement(array) {
    return array[math.floor(math.random() * array.length)]
}

function findDuplicates(mainTitle, testTitle) {
    const mainStripped = mainTitle.replace(/[^a-zA-Z0-9 ]/g, '')
    const testStripped = testTitle.replace(/[^a-zA-Z0-9 ]/g, '')
    console.log(`TESTSTRIPPED: ${testStripped}`)
    const mainArray = mainStripped.split(' ')
    let mainShort = ''
    if (mainArray.length >= 3) {
        const mainSliced = mainArray.slice(0, 3)
        mainShort = mainSliced.join(' ')
    } else {
        mainShort = mainStripped
    }
    console.log(`MAINSHORT: ${mainShort}`)
    console.log(`INCLUDES: ${testStripped.includes(mainShort)}`)
    return testStripped.includes(mainShort)
}

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
                        books: outputs.data.results
                    })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/suggestion', (req, res) => {
    db.rating
        .findAll({
            where: {
                userId: res.locals.currentUser.id,
                value: 5
            }
        })
        .then(responses => {
            const randomStarredId = randomElement(responses).bookId
            axios
                .get(url + `&ids=${randomStarredId}`)
                .then(output => {
                    const starredBook = output.data.results[0]
                    console.log(`STARREDBOOK.TITLE: ${starredBook.title}`)
                    const starredSubjects = starredBook.subjects
                    const randomStarredSubject = randomElement(starredSubjects).split(' ')[0]
                    console.log(`RANDOMSTARREDSUBJECT: ${randomStarredSubject}`)
                    axios
                        .get(url + `&topic=${randomStarredSubject}`)
                        .then(elements => {
                            const ids = []
                            const materials = elements.data.results
                            for (let i = 0; i < materials.length; i++) {
                                ids[i] = materials[i].id
                            }
                            console.log(`IDS: ${ids}`)
                            finalSelection()
                            function finalSelection() {
                                const randomId = randomElement(ids)
                                console.log(`RANDOMID: ${randomId}`)
                                const randomBook = materials[materials.findIndex(object => object.id === randomId)]
                                console.log(`RANDOMBOOK.TITLE: ${randomBook.title}`)
                                if (!findDuplicates(starredBook.title, randomBook.title)) {
                                    axios
                                        .get(url + `&ids=${randomId}`)
                                        .then(product => {
                                            res.render('books/suggestion', {
                                                book: product.data.results[0],
                                                currentUser: res.locals.currentUser
                                            })
                                        })
                                        .catch(flaw => res.send(flaw))
                                } else {
                                    finalSelection()
                                }
                            }
                        })
                        .catch(rejection => res.send(rejection))
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/text', (req, res) => {
    const id = req.body.bookId
    axios
        .get(url + `&ids=${id}`)
        .then(response => {
            res.render('books/text', { book: response.data.results[0] })
        })
        .catch(error => res.send(error))
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

router.post('/favorites', (req, res) => {
    db.favorite
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId
        })
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

router.post('/pass', (req, res) => {
    db.pass
        .create({
            userId: req.body.userId,
            bookId: req.body.bookId
        })
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

module.exports = router