const isAuth = require("../util/is-auth-middleware");

const router = (User, Post,Profile, Group,PostFiles, Credential,UserCredential) => { 
    const express = require('express');
    const postsController = require('../controllers/posts')(User, Post, Profile,Group,PostFiles,Credential,UserCredential);
    const usersController = require('../controllers/users');
    const router = express.Router();



    router.get('/create-post-form/:userId',isAuth, postsController.getCreatePost);
    
    router.get('/postservice/:userId', isAuth,  postsController.getCreateServicePost);
    router.get('/postRental/:userId', isAuth, postsController.getCreateRentalPost);
    router.get('/postEvent/:userId', isAuth, postsController.getCreateEventPost);
    router.get('/postAdvisory/:userId', isAuth, postsController.getCreateAdvisoryPost);
    router.get('/postTraining/:userId', isAuth, postsController.getCreateTraingingPost);
   
     //router.get('/postpreview/:id', postsController.getPostPreviewPage)
     //router.post('/postPreview/:userId', postsController.postPreview);
    router.post('/account/:userId', isAuth,  usersController.getAccountPage);
    router.post('/create-post/:userId', isAuth, postsController.postCreateService);

    router.get('/view-post/:postId', postsController.getViewPost);
    router.get('/edit-post/:postId', isAuth,  postsController.getEditPost);
    router.post('/edit-post/:postId', isAuth, postsController.postEdit);
    router.get('/post/:postId/:userId', isAuth, postsController.getPost);
    router.get('/isActive-post/:postId/:userId/:val',postsController.isActivePost);
    
    return router;
}

module.exports = router;