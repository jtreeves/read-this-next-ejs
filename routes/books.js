const express = require('express')
const router = express.Router()
const axios = require('axios').default
const db = require('../models')

const url = 'http://gutendex.com/books?languages=en&copyright=false'

router.get('/', (req, res) => {
    axios
        .get(url)
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

// ORIGINAL PROMISE VERSION
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
//                         .then(final => final.data.results)
//                         .catch(err => res.send(err))
//                 )
//             })
//             Promise
//                 .all(outputs)
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
//                     res.render('books/rated', { books: output })
//                 })
//                 .catch(problem => res.send(problem))
//         })
//         .catch(error => {
//             res.send(error)
//         })
// })

router.get('/rated', (req, res) => {
    db.rating
        // Query database
        .findAll({
            // Find all rows meeting criteria
            where: { userId: res.locals.currentUser.id }
        })
        .then(responses => {
            // Create array that maps over database query array to add object for each row, containing keys of bookId and rating
            // console.log(`RESPONSES: ${responses}`)
            // console.log(`RESPONSES[0]: ${responses[0]}`)
            // console.log(`RESPONSES[0].BOOKID: ${responses[0].bookId}`)
            // console.log(`RESPONSES[0].VALUE: ${responses[0].value}`)
            // let outputs = []
            // for (let i = 0; i < responses.length; i++) {
            //     outputs[i] = {
            //         id: responses[i].bookId,
            //         rating: responses[i].value
            //     }
            // }
            // console.log(`OUTPUTS: ${outputs}`)
            // Iterate through query array to create new array just containing the bookId values
            let idArray = []
            for (let i = 0; i < responses.length; i++) {
                idArray[i] = responses[i].id
            }
            console.log(`IDARRAY: ${idArray}`)
            // Condense array into string in format to run API query
            let idString = idArray.toString()
            let queryString = `&ids=${idString}`
            console.log(`QUERYSTRING: ${queryString}`)
            console.log(`FULL URL STRING: ${url + queryString}`)
            axios
                // Call API with query
                .get(url + queryString)
                .then(bookMaterials => {
                    // Create array that maps over API query array to add object for each book, containing keys for important topics (e.g., id, title, author, subject)
                    console.log(`BOOKMATERIALS: ${bookMaterials}`)
                    console.log(`BOOKMATERIALS.DATA: ${bookMaterials.data}`)
                    console.log(`BOOKMATERIALS.DATA.RESULTS: ${bookMaterials.data.results}`)
                    console.log(`BOOKMATERIALS.DATA.RESULTS.LENGTH: ${bookMaterials.data.results.length}`)
                    console.log(`BOOKMATERIALS.DATA.RESULTS[0]: ${bookMaterials.data.results[0]}`)
                    console.log(`BOOKMATERIALS.DATA.RESULTS[0].TITLE: ${bookMaterials.data.results[0].title}`)
                    // console.log(`BOOKMATERIALS[0]: ${bookMaterials[0]}`)
                    // console.log(`BOOKMATERIALS[0].DATA: ${bookMaterials[0].data}`)
                    // console.log(`BOOKMATERIALS[0].DATA.RESULTS: ${bookMaterials[0].data.results}`)
                    // console.log(`BOOKMATERIALS[0].DATA.RESULTS.TITLE: ${bookMaterials[0].data.results.title}`)
                    // let bookMaterialsResults = bookMaterials.data.results
                    // let allInfo = []
                    // for (let i = 0; i < bookMaterialsResults.length; i++) {
                    //     allInfo[i] = bookMaterialsResults[i]
                    // }
                    // console.log(`ALLINFO: ${allInfo}`)
                    // Iterate over new API array to add the previously created objects as values for a materials key in object from the first ray, based on matching id's
                    // for (let i = 0; i < outputs.length; i++) {
                    //     outputs[i].materials = bookMaterialsResults[bookMaterialsResults.indexOf(outputs[i].id)]
                    //     console.log(`OUTPUTS: ${outputs}`)
                    //     console.log(`OUTPUTS[0]: ${outputs[0]}`)
                    //     console.log(`OUTPUTS[0].ID: ${outputs[0].id}`)
                    //     console.log(`OUTPUTS[0].RATING: ${outputs[0].rating}`)
                    //     console.log(`OUTPUTS[0].MATERIALS.TITLE: ${outputs[0].materials.title}`)
                    // }
                    // Render page with original array fed into it
                    res.render('books/rated', {
                        books: bookMaterials.data.results,
                        ratings: responses
                    })
                })
                .catch(problem => res.send(problem))
        })
        .catch(error => res.send(error))
})

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
//                         .then(final => final.data.results)
//                         .catch(err => res.send(err))
//                 )
//             })
//             Promise
//                 .all(outputs)
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
//                     res.render('books/rated', { books: output })
//                 })
//                 .catch(problem => res.send(problem))
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