
 const path = require('path');
 const express = require('express');
const isAuth = require("../util/is-auth-middleware");

// const GOOGLE_RECAPTCHA_SITE_KEY =  "6Ld7_J0UAAAAAMMU3cA682Z-5T-hfdYEqO1cVIjz";
// const GOOGLE_RECAPTCHA_SECRET_KEY =  "6Ld7_J0UAAAAAORvffMYL8gDqUsWcz1nzvFQGeij";
// var Recaptcha = require('express-recaptcha').RecaptchaV3;
// var recaptcha = new Recaptcha(GOOGLE_RECAPTCHA_SITE_KEY, GOOGLE_RECAPTCHA_SECRET_KEY, {callback: 'cb'});

var {recaptcha} = require('../configs/config'); //Above commented lines are moved to directory "../configs/config"


const router = (User) => { 
    const router = express.Router();

    const rootDir = require('../util/path');
    const usersController = require('../controllers/users');

    router.get('/user', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'user.html'));
    });
 
    router.get('/index', usersController.getIndexPage);

    router.get('/signup', recaptcha.middleware.render, usersController.getSignUp);
    router.post('/add-user',  usersController.postAddUser);

    router.get('/login', usersController.getLogin);

    router.get('/home/:userId', usersController.getHome);

    router.post('/login', usersController.postLogin);

    router.get('/logout', isAuth, usersController.getLogout);
    
    router.get('/create-group', isAuth, usersController.getGroupPage);

    router.get('/activate/:tokenId', usersController.activateUser);

    router.get('/account/:userId', usersController.getAccountPage);
    router.get('/account/:userId/:isActive', usersController.getAccountPage);

    router.get('/guest-login',  usersController.addGuestUser);

    return router;
}

module.exports = router;