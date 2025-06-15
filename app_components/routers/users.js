const express = require('express');
const router = express.Router();

const signUp = require('./controllers/signUp');
const signIn = require('./controllers/signIn');
const checkUser = require('./controllers/checkUser');
const userConsent = require('./controllers/userConsent');
const singOut = require('./controllers/singOut');

router.get('/', (req, res) => {
    res.render("login");
    res.end();
});

router.post('/:n', (req, res) => {
    const { n } = req.params;
    if (n === 'up') {
        // Handle sign up;
        signUp(req, res);

    } else if (n === 'in') {
        // Handle sign in;
        signIn(req, res);

    } else if (n === 'check') {
        // Handle check user;
        checkUser(req, res);

    } else if (n === 'consent') {
        // Handle user confirmation
        userConsent(req, res);

    } else if (n === 'out') {
        // Handle user sign out
        singOut(req, res);
    }

});

module.exports = router;