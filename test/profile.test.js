const expect = require('chai').expect
const request = require('supertest')
const app = require('../server')
const db = require('../models')
const agent = request.agent(app)

before(function(done) {
    db.sequelize
        .sync({ force: true })
        .then(function() { done() })
})

describe('GET /profile', function() {
    it('should redirect to /auth/login if not logged in', function(done) {
        request(app)
            .get('/profile')
            .expect('Location', '/auth/login')
            .expect(302, done)
    })

    it('should return a 200 response if logged in', function(done) {
        agent
            .post('/auth/signup')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                email: 'my@user.co',
                name: 'Steve Peters',
                password: 'password'
            })
            .expect(302)
            .expect('Location', '/')
            .end(function(error, res) {
                if (error) {
                    done(error)
                } else {
                    agent
                        .get('/profile')
                        .expect(200, done)
                }
            })
    })
})