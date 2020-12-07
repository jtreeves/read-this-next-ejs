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