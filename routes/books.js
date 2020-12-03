const express = require('express')
const router = express.Router()
const axios = require('axios').default
const db = require('../models')

router.get('/', (req, res) => {
    // Currently, this query variable doesn't do anything
    const query = req.query
    axios
        .get(`http://gutendex.com/books?languages=en&copyright=false${query}`)
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
            // const outputs = []
            responses.forEach(response => {
                // console.log(`RATINGS RESPONSE VARIABLE: book ${response.bookId} got ${response.value} stars`)
                // const rating = response.value
                // const outputId = response.bookId
                console.log(`RESPONSE BEFORE CHANGE: ${response.bookId}`)
                // response.bookId = 
                axios
                    .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
                    .then(output => {
                        console.log(`OUTPUT: ${output}`)
                        console.log(`OUTPUT DATA: ${output.data.results[0]}`)
                        console.log(`TITLE: ${output.data.results[0].title}`);
                        // response.newThing = output.data.results
                        // console.log(`RESPONSE AFTER CHANGE: ${response.bookId}`)
                        // console.log(`TITLE: ${response.newThing.title}`);
                        // console.log(`FULL RESPONSE MAP: ${response}`)
                        res.render('books/rated', { books: responses })
                    })
                    .catch(problem => {
                        res.send(problem)
                    })
                // outputs.push({
                //     rating: rating,
                //     materials: axios.get(`http://gutendex.com/books?languages=en&copyright=false&ids=${outputId}`).data.results
                // })
            })
            // console.log(`OUTPUTS ARRAY: ${outputs}`)
            // .then(output => {
            // })
            // .catch(problem => {
            //     res.send(problem)
            // })
        })
        .catch(error => {
            res.send(error)
        })
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