# Read This Next

An app for getting book recommendations based on your preferences

## Visit Site

You can view a live version of this app on Heroku:
[Read This Next](https://read-this-next.herokuapp.com/)

## Installation

### Download

1. Fork and clone this directory to your local computer
2. Run `npm install` to get the necessary dependencies

### Set Up

1. Set up your `.env` file with a secret session key
2. Run `sequelize db:create readnext_development` to add the a database to your Postgres that will interact with the app
3. Migrate the models with `sequelize db:migrate`

### Run Locally

1. Run `nodemon` when in your local directory
2. Access the site on your browser at `localhost:3000`

## ERD

![Database](/images/reading.png)

## User Stories

1. A user can use the app by visiting the site, creating an account, and logging into their account.
2. A user can rate random books from a database of more than 50,000 books on a scale from 1 to 5.
3. A user can receive random book recommendations based on how they rated previous books.
4. A user can pass on random book recommendations if they have no desire to have that particular book recommended to them again, or a user can add random book recommendations to their reading list if they want to read that book at a later point in time.
5. A user can view a list of all the books they have previously rated, and the user can view a list of all the books they have previously added to their reading list.
6. A user can change their rating of any book.
7. A user can remove a book from their reading list.
8. A user can mark books as read.
9. A user can view a list of all the books they have marked as read.

## Wireframes

![Homepage](/images/homepage.png)
![Create Account](/images/create-account.png)
![Unrated Books](/images/unrated-books.png)
![Book Suggestion](/images/book-suggestion.png)
![Reading List](/images/reading-list.png)

## Code Snippet

This code block involves five nested promises, including two database queries and three API calls, to provide the user with a random book recommendation based on the information they have previously provided to the app.

**Suggestion Route**
```javascript
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
```