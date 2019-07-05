const isAuth = require("../util/is-auth-middleware");

const router = (User,Post,Credential,UserCredential,Group) => { 
    const express = require('express');
    const credentialsController = require('../controllers/credentials')(User,Post,Credential,UserCredential,Group);
    const router = express.Router(); 
   
    router.get('/credentials/:userId', isAuth, credentialsController.getCreateCredentials); 
    router.get('/create-credential/:userId/:groupId', isAuth, credentialsController.createCredential);
    router.post('/create-credential/:userId/:groupId', isAuth, credentialsController.postcreateCredential);
    router.get('/show-certificate/:userId/:postId', credentialsController.showCertificate);     
    router.get('/credential-view/:credentialId/:userId', credentialsController.getCredential);  
    router.get('/credential-add/:credentialId/:userId', isAuth, credentialsController.getupdateCredential); 
    router.get('/manage-credentials/:userId/:credentialId',credentialsController.getManageCredential);
    router.post('/manage-credentials/:userId/:credentialId', isAuth, credentialsController.postManageCredential);

    //Routes for Certificate Verification
    router.post('/getCertificateVerify/:userId/:postId',credentialsController.verifyCredentials);

    return router;
}

module.exports = router;