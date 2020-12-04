const express = require('express')
const router = express.Router()
const axios = require('axios').default
const db = require('../models')

router.get('/', (req, res) => {
    axios
        .get(`http://gutendex.com/books?languages=en&copyright=false`)
        .then(response => {
            console.log(`RESPONSE: ${response}`)
            console.log(`RESPONSE.DATA: ${response.data}`)
            console.log(`RESPONSE.DATA.RESULTS: ${response.data.results}`)
            console.log(`RESPONSE.DATA.RESULTS[0]: ${response.data.results[0]}`)
            console.log(`RESPONSE KEYS: ${Object.keys(response)}`)
            console.log(`RESPONSE.DATA KEYS: ${Object.keys(response.data)}`)
            console.log(`RESPONSE.DATA.RESULTS KEYS: ${Object.keys(response.data.results)}`)
            console.log(`RESPONSE.DATA.RESULTS[0] KEYS: ${Object.keys(response.data.results[0])}`)
            console.log(`RESPONSE.DATA.RESULTS[0].TITLE: ${response.data.results[0].title}`)
            res.render('books/index', {
                books: response.data.results,
                currentUser: res.locals.currentUser
            })
        })
        .catch(error => {
            res.send(error)
        })
})

function getBooks() {
    return axios
        .get(`http://gutendex.com/books?languages=en&copyright=false`)
        .then(response => {
            console.log(`NEW RAW DATA: ${response}`)
            console.log(`NEW BOOKS: ${response.data.results}`)
            console.log(`NEW FIRST BOOK: ${response.data.results[0]}`)
            console.log(`NEW FIRST TITLE: ${response.data.results[0].title}`)
            response.data.results
        })
        .catch(error => res.send(error))
}

router.get('/favorites', (req, res) => {
    getBooks()
        .then(response => {
            console.log(`DIRECT CALL: ${response}`)
            res.render('books/favorites', { books: response })
        })
        .catch(error => res.send(error))
})

router.get('/suggestion', (req, res) => {
    const axiosBooks = []
    axiosBooks.push(getBooks())
    console.log(`AXIOS BOOKS: ${axiosBooks}`)
    Promise
        .all(axiosBooks)
        .then(response => {
            console.log(`PROMISE CALL: ${response}`)
            res.render('books/suggestion', { books: response })
        })
        .catch(error => res.send(error))
})

// ASYNC VERSION OF FUNCTION
// router.get('/rated', (req, res) => {
//     db.rating
//         .findAll({
//             where: { userId: res.locals.currentUser.id }
//         })
//         .then(responses => {
//             const outputs = []
            
            
            
//             for (let i = 0; i < responses.length; i++) {
                
//             }
            
            
            
            
//             responses.forEach(response => {
//                 outputs.push(
//                     axios
//                         .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
//                 )
//             })
//             Promise
//                 .all(outputs)
//                 .then(output => {
//                     console.log(`OUTPUT: ${output}`)
//                     console.log(`OUTPUT[0]: ${output[0]}`)
//                     console.log(`OUTPUT[0].DATA: ${output[0].data}`)
//                     console.log(`OUTPUT[0].DATA.RESULTS: ${output[0].data.results}`)
//                     console.log(`OUTPUT KEYS: ${Object.keys(output)}`)
//                     console.log(`OUTPUT[0] KEYS: ${Object.keys(output[0])}`)
//                     console.log(`OUTPUT[0].DATA KEYS: ${Object.keys(output[0].data)}`)
//                     console.log(`OUTPUT[0].DATA.RESULTS KEYS: ${Object.keys(output[0].data.results)}`)
//                     res.render('books/rated', {
//                         books: output
//                     })
//                 })
//                 .catch(problem => res.send(problem))
//         })
//         .catch(error => {
//             res.send(error)
//         })
// })


// AXIOS ALL ATTEMPT
// router.get('/rated', (req, res) => {
//     db.rating
//         .findAll({
//             where: { userId: res.locals.currentUser.id }
//         })
//         .then(responses => {
//             const outputs = []
//             responses.forEach(response => {
//                 outputs.push(
//                     axios
//                         .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
//                 )
//             })
//             axios
//                 .all(outputs)
//                 .then(axios.spread((...outputs) => {
//                     outputs.forEach((output, index) => {
//                         let output = output[index]
//                     })
//                 })
                    
                    
                    
                    
                    
                    
//                     output => {
                    
                    
                    
//                     console.log(`OUTPUT: ${output}`)
//                     console.log(`OUTPUT[0]: ${output[0]}`)
//                     console.log(`OUTPUT[0].DATA: ${output[0].data}`)
//                     console.log(`OUTPUT[0].DATA.RESULTS: ${output[0].data.results}`)
//                     console.log(`OUTPUT KEYS: ${Object.keys(output)}`)
//                     console.log(`OUTPUT[0] KEYS: ${Object.keys(output[0])}`)
//                     console.log(`OUTPUT[0].DATA KEYS: ${Object.keys(output[0].data)}`)
//                     console.log(`OUTPUT[0].DATA.RESULTS KEYS: ${Object.keys(output[0].data.results)}`)
//                     res.render('books/rated', {
//                         books: output
//                     })
//                 })
//                 .catch(problem => res.send(problem))
//         })
//         .catch(error => {
//             res.send(error)
//         })
// })

router.get('/rated', (req, res) => {
    db.rating
        .findAll({
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            const outputs = []
            responses.forEach(response => {
                outputs.push(
                    axios
                        .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
                        .then(final => final.data.results)
                        .catch(err => res.send(err))
                )
            })
            Promise
                .all(outputs)
                .then(output => {
                    console.log(`OUTPUT: ${output}`)
                    console.log(`OUTPUT.DATA: ${output.data}`)
                    console.log(`OUTPUT.DATA.RESULTS: ${output.data.results}`)
                    console.log(`OUTPUT.DATA.RESULTS[0]: ${output.data.results[0]}`)
                    console.log(`OUTPUT KEYS: ${Object.keys(output)}`)
                    console.log(`OUTPUT.DATA KEYS: ${Object.keys(output.data)}`)
                    console.log(`OUTPUT.DATA.RESULTS KEYS: ${Object.keys(output.data.results)}`)
                    console.log(`OUTPUT.DATA.RESULTS[0] KEYS: ${Object.keys(output.data.results[0])}`)
                    console.log(`OUTPUT.DATA.RESULTS[0].TITLE: ${output.data.results[0].title}`)
                    res.render('books/rated', { books: output })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => {
            res.send(error)
        })
})

// router.get('/rated', (req, res) => {
//     db.rating
//         .findAll({
//             where: { userId: res.locals.currentUser.id }
//         })
//         .then(responses => {
//             const bookIds = responses.map(response => response.bookId)
//             axios
//                 .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${bookIds}`)
//                 .then(output => {
//                     console.log(`OUTPUT: ${output}`)
//                     console.log(`OUTPUT.DATA: ${output.data}`)
//                     console.log(`OUTPUT.DATA.RESULTS: ${output.data.results}`)
//                     console.log(`OUTPUT.DATA.RESULTS[0]: ${output.data.results[0]}`)
//                     console.log(`OUTPUT KEYS: ${Object.keys(output)}`)
//                     console.log(`OUTPUT.DATA KEYS: ${Object.keys(output.data)}`)
//                     console.log(`OUTPUT.DATA.RESULTS KEYS: ${Object.keys(output.data.results)}`)
//                     console.log(`OUTPUT.DATA.RESULTS[0] KEYS: ${Object.keys(output.data.results[0])}`)
//                     console.log(`OUTPUT.DATA.RESULTS[0].TITLE: ${output.data.results[0].title}`)
//                     res.render('books/rated', {
//                         books: output.data.result
//                     })
//                 })
//                 .catch(problem => res.send(problem))
//         })
//         .catch(error => res.send(error))
// })

router.get('/text', (req, res) => {
    res.render('books/text')
})

// router.get('/rated', (req, res) => {
//     db.rating
//         .findAll({
//             where: { userId: res.locals.currentUser.id }
//         })
//         .then(responses => {
//             const outputs = []
//             responses.forEach(addCat => {
//                 axios
//                     .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
//                     .then(output => {
//                         outputs.push({
//                             materials: output,
//                             rating: response.value
//                         })
//                         Promise.all(makeCategories).then(() => {
//                             res.redirect(`/projects/${id}`)
//                         outputs.Promise.all().then(
//                             res.render('books/rated', { books: outputs })
//                         )
//                     })
//                     })
//                     .then(newThing => {
//                     })
//                     .catch(problem => {
//                         res.send(problem)
//                     })
//             })
//         })
//         .catch(error => {
//             res.send(error)
//         })
// })

// router.get('/rated', (req, res) => {
//     db.rating
//         .findAll({
//             where: { userId: res.locals.currentUser.id }
//         })
//         .then(responses => {
//             const outputs = []
//             responses.forEach(response => {
//                 // console.log(`RATINGS RESPONSE VARIABLE: book ${response.bookId} got ${response.value} stars`)
//                 // const rating = response.value
//                 // const outputId = response.bookId
//                 // console.log(`RESPONSE BEFORE CHANGE: ${response.bookId}`)
//                 // response.bookId = 
//                 axios
//                     .get(`http://gutendex.com/books?languages=en&copyright=false&ids=${response.bookId}`)
//                     .then(output => {
//                         // console.log(`OUTPUT: ${output}`)
//                         // console.log(`OUTPUT DATA: ${output.data.results[0]}`)
//                         // console.log(`TITLE: ${output.data.results[0].title}`);
//                         // response.newThing = output.data.results
//                         // console.log(`RESPONSE AFTER CHANGE: ${response.bookId}`)
//                         // console.log(`TITLE: ${response.newThing.title}`);
//                         // console.log(`FULL RESPONSE MAP: ${response}`)
//                         outputs.push({
//                             materials: output,
//                             rating: response.value
//                         })
//                         // res.render('books/rated', {
//                         //     // ratings: responses,
//                         //     // This is a map that works
//                         //     books: responses
//                         //     // This is not a map that works
//                         //     // books: output
//                         // })
//                     })
//                     .then(newThing => {
//                         res.render('books/rated', { books: outputs })
//                     })
//                     .catch(problem => {
//                         res.send(problem)
//                     })
//                 // outputs.push({
//                 //     rating: rating,
//                 //     materials: axios.get(`http://gutendex.com/books?languages=en&copyright=false&ids=${outputId}`).data.results
//                 // })
//             })
//             // console.log(`OUTPUTS ARRAY: ${outputs}`)
//             // .then(output => {
//             // })
//             // .catch(problem => {
//             //     res.send(problem)
//             // })
//         })
//         .catch(error => {
//             res.send(error)
//         })
// })

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