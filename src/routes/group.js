const isAuth = require("../util/is-auth-middleware");

const router = (User, Group, Profile, Credential) => { 
    const express = require('express');
    const groupsController = require('../controllers/groups')(User, Group, Profile, Credential);
    const router = express.Router();
    const certificateController = require('../controllers/certificates')(Group);
   
    router.get('/create-group/:userId', isAuth, groupsController.getCreateGroup);   
    router.post('/create-group/:userId', isAuth, groupsController.postCreateGroup);    
    router.get('/group/:userId', isAuth, groupsController.getShowGroups);  
    router.post('/group/:userId', isAuth, groupsController.getShowGroups);   
    
    router.get('/group-edit/:userId/:groupId', isAuth, groupsController.getUpdateGroupDetails);
    router.post('/update_group_details/:userId/:groupId', isAuth, groupsController.postUpdateGroupDetails); //EDIT Group details

    router.get('/manage-group/:groupId', isAuth, groupsController.getManageGroup);
    router.post('/import-user-groupMembers/:groupId', isAuth, groupsController.postManageGroupMemebers);
    router.post('/import-user-groupEventAttendees/:groupId', isAuth, groupsController.postManageGroupEventAttendees);
    router.get('/group/:userId/:discover', isAuth, groupsController.getShowGroups);
    router.get('/view-group/:userId/:groupId', isAuth,  groupsController.getGroupDetails);
    router.get('/join-GroupService/:userId/:groupId', isAuth, groupsController.joinGroupService); 

    router.post('/contact_manager/:userId/:groupId', isAuth, groupsController.ContactGroupManager);       

    return router;
}

module.exports = router;