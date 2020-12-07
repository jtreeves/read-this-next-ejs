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

function randomIds() {
    const ids = []
    for (let i = 0; i < 5; i++) {
        ids[i] = math.floor(math.random() * 50000)
    }
    console.log(`INITIAL IDS: ${ids}`)
    // const check = []
    // for (let i = 0; i < 10; i++) {
    //     if (check.indexOf(ids[i]) !== -1) {
    //         randomIds()
    //     } else {
    //         check[i] = array[i]
    //     }
    // }
    // console.log(`CHECKED IDS: ${ids}`)
    return ids
}

function checkOverlaps(array1, array2) {
    if (array1.some(element => array2.includes(element))) {
        array1 = randomIds()
    } else {
        return array1
    }
}

function excludeDuplicates(mainTitle, testTitle) {
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
    return !testStripped.includes(mainShort)
}

// function excludeUnoriginals(book, user) {
//     let countFavorites = ''
//     let countPasses = ''
//     let countRatings = ''
//     let countStatuses = ''
//     const criteria = {
//         where: {
//             userId: user,
//             bookId: book
//         }
//     }
//     const checkFavorites = db.favorite
//         .findAndCountAll(criteria)
//         .then(responseFavorites => {
//             countFavorites = responseFavorites.count
//         })
//     const checkPasses = db.pass
//         .findAndCountAll(criteria)
//         .then(responsePasses => {
//             countPasses = responsePasses.count
//         })
//     const checkRatings = db.rating
//         .findAndCountAll(criteria)
//         .then(responseRatings => {
//             countRatings = responseRatings.count
//         })
//     const checkStatuses = db.status
//         .findAndCountAll(criteria)
//         .then(responseStatuses => {
//             countStatuses = responseStatuses.count
//         })
//     Promise
//         .all([checkFavorites, checkPasses, checkRatings, checkStatuses])
//         .then(response => {
//             if (countFavorites === 0 && countPasses === 0 && countRatings === 0 && countStatuses === 0) {
//                 return true
//             } else {
//                 return false
//             }
//         })
// }

// router.get('/test', (req, res) => {
//     let count1 = ''
//     let count2 = ''
//     const testing1 = db.rating.findAndCountAll({
//         where: { userId: res.locals.currentUser.id }
//     }).then(res1 => { count1 = res1.count })
//     const testing2 = db.status.findAndCountAll({
//         where: { userId: res.locals.currentUser.id }
//     }).then(res2 => { count2 = res2.count })
//     Promise.all([testing1, testing2]).then(response => res.send(`COUNT1: ${count1}; COUNT2: ${count2}`))
// })

router.get('/', (req, res) => {
    db.rating
        .findAll({
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            const list = randomIds()
            console.log(`LIST: ${list}`)
            const ids = []
            for (let i = 0; i < responses.length; i++) {
                ids[i] = responses[i].bookId
            }
            console.log(`IDS: ${ids}`)
            // checkOverlaps(list, ids)
            // console.log(`NEW LIST: ${list}`)
            axios
                .get(url + `&ids=${list.toString()}`)
                .then(outputs => {
                    console.log(`OUTPUTS: ${outputs}`)
                    res.render('books/index', {
                        books: outputs.data.results,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(problem => res.send(problem))
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
                        books: outputs.data.results,
                        currentUser: res.locals.currentUser
                    })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/suggestion', (req, res) => {
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
                                                    .catch(flaw => res.send(flaw))
                                            } else {
                                                finalSelection()
                                            }
                                        } else {
                                            finalSelection()
                                        }
                                    })
                                    .catch(discard => res.send(discard))
                            }
                        })
                        .catch(rejection => res.send(rejection))
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

router.get('/text', (req, res) => {
    const id = req.query.id
    console.log(`FULL TEXT ID: ${id}`)
    axios
        .get(url + `&ids=${id}`)
        .then(response => {
            const bookObject = response.data.results[0]
            console.log(`BOOKOBJECT.TITLE: ${bookObject.title}`)
            const bookUrl = bookObject.formats['text/plain; charset=utf-8']
            console.log(`BOOKURL: ${bookUrl}`)
            axios
                .get(bookUrl)
                .then(output => {
                    res.render('books/text', {
                        book: bookObject,
                        text: output.data
                    })
                })
                .catch(problem => res.send(problem))
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
                    res.render('books/rated', {
                        books,
                        currentUser: res.locals.currentUser
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

router.put('/:id', (req, res) => {
    // const id = req.params.id
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
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

router.delete('/:id', (req, res) => {
    db.favorite
        .destroy({
            where: {
                userId: req.body.userId,
                bookId: req.body.bookId
            }
        })
        .then(() => res.redirect('/books'))
        .catch(error => res.send(error))
})

module.exports = router