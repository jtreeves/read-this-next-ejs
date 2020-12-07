// Imports
require('dotenv').config()
const express = require('express')
const layouts = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const isLoggedIn = require('./middleware/isLoggedIn')

const app = express()
const SECRET_SESSION = process.env.SECRET_SESSION

app.set('view engine', 'ejs')

app.use(methodOverride('_method'))
app.use(require('morgan')('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))
app.use(layouts)

const sessionObject = {
    // What we actually will be giving the user on our site as a session cookie
    secret: SECRET_SESSION,
    // Save the session, even if it's modified (so we make it false)
    resave: false,
    // If we have a new session, we save it (so we make it true)
    saveUninitialized: true
}

app.use(session(sessionObject))

// Initialize passport and run through middleware
app.use(passport.initialize())
app.use(passport.session())

// Flash
// Using flash throughout app to send temporary messages to user
app.use(flash())

// Messages that will be accessible to every view
app.use((req, res, next) => {
    // Before every route, we attach a user to res.local
    res.locals.alerts = req.flash()
    res.locals.currentUser = req.user
    next()
})

app.get('/', (req, res) => {
    console.log(res.locals.alerts)
    res.render('index', { alerts: res.locals.alerts })
})

app.get('/profile', isLoggedIn, (req, res) => {
    db.user
        .findAll({
            where: { id: res.locals.currentUser.id }
        })
        .then(response => {
            res.render('profile', { user: response })
        })
        .catch(() => res.status(400).render('404'))
})

app.use('/auth', require('./routes/auth'))
app.use('/books', require('./routes/books'))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(`You are running port ${PORT}`)
})

module.exports = server