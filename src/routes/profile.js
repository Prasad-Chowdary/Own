
const isAuth = require("../util/is-auth-middleware");

const router = (User, Profile, PostType,Post,Group,Credential) => { 
    const express = require('express');
    const profilesController = require('../controllers/profiles')(User, Profile, PostType,Post,Group,Credential);
    const router = express.Router();

    router.get('/show-profiles/:userId', isAuth, profilesController.getShowProfiles);
    router.get('/create-profile/:userId', isAuth, profilesController.getCreateProfile);
    router.get('/create-profile-form/:userId', isAuth, profilesController.getCreateProfile);
    router.post('/create-profile/:userId', isAuth, profilesController.postCreateProfile);
    router.get('/create-profile-group/:userId/:groupId', isAuth, profilesController.getCreateProfile);
    router.post('/create-profile/:userId', isAuth, profilesController.getShowProfiles);
    router.get('/profile-view/:profileId/:userId', isAuth, profilesController.getProfile);
    router.get('/edit-profile/:profileId', isAuth, profilesController.getEditProfile);
    router.post('/edit-profile/:profileId', isAuth, profilesController.PostEditProfile);
    router.get('/inactive-profile/:profileId/:userId', isAuth, profilesController.PostInactiveProfile);
    router.get('/isVisible-profile/:profileId/:userId/:val', isAuth, profilesController.isVisibleProfile);

    return router;
}

module.exports = router;