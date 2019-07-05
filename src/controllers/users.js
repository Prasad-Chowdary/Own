// const SENDGRID_API_KEY =  "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";
const {SENDGRID_API_KEY} = require("../configs/config"); 
// const GOOGLE_RECAPTCHA_SECRET_KEY =  "6Le6C6EUAAAAAFFf7lkZVWpFgVO0u7BE8hGJ23Dz";
const { GOOGLE_RECAPTCHA_SECRET_KEY_Verfication } = require("../configs/config"); 

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

var request = require('request');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { User, Post, Profile,Group} = require('../util/database');
var {loggerError,loggerInfo} = require('../util/logConfig');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth : {
        api_key : SENDGRID_API_KEY
    }
}));



module.exports = { 
    dummyTest1 : (req, res, next) => {
        const email = req.body.Email;
        const pswd = req.body.Password;
        req.session.isLoggedIn = false;

        User.findOne()
        .then(user => {
            console.log("Users first name is ", user.firstName);
            if(!user){   // No such user.
               console.log("No such user");
            }
            else {
                console.log(" user found");
            }
        })
        .catch(err => {
            console.log(err);
            //res.render('index', {err : 'No such user account found. Please try again'});
        })
    },

     getNetworkPage: (req, res, next) => {
        res.render('network');     
    },

    getGroupPage: (req, res, next)=> {
        console.log("user entered data");
        res.render('create-group');     
    },

    getIndexPage : (req, res, next) => {
        res.render('index', {errMessage : '', successMessage: ''});
    },

    getLogin : (req, res, next) => {
        res.render('index', {errMessage : '', successMessage: ''});
    },
   
    getAccountPage : (req, res, next) => { 
    const userId = req.params.userId; 
    if(req.params.isActive)
        var switchTab = 'post'; 
    User.findByPk(userId).then(user => { // Get the user 

        console.log("Trying to get the profiles for user with id", userId);
        loggerInfo.info("Trying to get the profiles for user with id", userId);
          user.getProfiles({where:[{isDelete:false}],order : ['createdAt']}).then(profiles => { // Get the profiles that the user created
                    user.getPosts({
                        include:{
                            model:Profile,
                                where:{isDelete:false}
                                },
                                required: false
                            }).then(posts => {
                      user.getGroups().then(groups=>{
                        loggerInfo.info(posts);
                        title = "Accounts -" + user.email;
                        res.render('account', { title : title, userId : userId, profileSuccessMessage:'', user:user, groups:groups, profiles : profiles, posts: posts,switchTab:switchTab});
                        
                      }).catch(err=>{
                        console.log(" unable to get the goups",err);
                        loggerError.error(" unable to loads posts",err);
                        res.render('index', {errMessage : err, successMessage: ''});
                      })
 
                }).catch(err => {
                    console.log(" unable to loads posts",err);
                    loggerError.error(" unable to loads posts",err);
                    res.render('index', {errMessage : err, successMessage: ''});
                    })
             }).catch(err => {
                            console.log(" unable to loads profiles",err);
                            loggerError.error(" unable to loads profiles",err);
                            res.render('index', {errMessage : err, successMessage: ''});
                            })
          }).catch(err => {
                    console.log(err);
                    loggerError.error(err);
                    res.render('index', {errMessage : err, successMessage: ''});
                    })
    },

    getLogout: (req, res, next) => {
        req.session.destroy(err => {
            console.log(err);
            loggerError.error(err);
            res.render('index', {errMessage : err, successMessage: ''});
        });        
    },

    getHome : (req, res, next) => {
        const userId = req.params.userId;
    
    User.findByPk(userId).then(user => { // Get the user 
        if(!user){   // No such user.
            loggerError.error('No such user account found. Please try again');
            var errMessage = 'No such user account found. Please try again';
            res.render('index', {errMessage : errMessage, successMessage: ''});
        }
        else {  // User exists, get all the posts in the system
            const userId = user.id;
                // user.getProfiles().then(userProfiles =>{
            Profile.findAll({where:[{visible:true},{isDelete:false}]}).then(userProfiles =>{
                    // user.getPosts({
                        Post.findAll({
                        include:{
                            model:Profile,
                                where:{isDelete:false}
                                },
                                required: false
                            }).then(allPosts => {
                    Group.findAll().then(userGroups => {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        const title = "Home -" + user.email;
                        req.session.save(err => {
                            res.render('home', { title : title, email : user.email, userId : userId,
                               posts : allPosts,profiles :userProfiles, groups : userGroups, isAuthenticated: req.session.isLoggedIn});
                            });
                    }).catch(err=>{
                        console.log("Error at login home page",err);
                        loggerError.error("Error at login home page",err);
                        res.render('index', {errMessage : errMessage, successMessage: ''});
                    });   
                }).catch(err=>{
                    console.log("Error at login home page",err);
                    loggerError.error("Error at login home page",err);
                    res.render('index', {errMessage : errMessage, successMessage: ''});
                })  ; 
            })
            .catch(err => {
                console.log("Unable to get profiles for user", userId);
                loggerError.error("Unable to get profiles for user", userId);
                console.log(err);
                var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
                res.render('index', {errMessage : errMessage, successMessage: ''});
            });
        }
    })
    .catch(err => {
        console.log(err);
    })
    },

    postLogin : (req, res, next) => {
        const email = req.body.Email;
        const pswd = req.body.Password;
        req.session.isLoggedIn = false;

        User.findOne({where : {email: email}})
        .then(user => {
            if(!user){   // No such user.
                console.log("No such user : ", email);
                loggerError.error("No such user : ", email);
                var errMessage = 'No such user account found. Please try again.';
                res.render('index', {errMessage : errMessage, successMessage: ''});
            }
            else {
                loggerInfo.info("Found user = ", user.firstName);
                console.log("Found user = ", user.firstName);

                bcrypt.compare(pswd, user.password)
                .then(matchedResult => {
                    if(matchedResult){   // User's credentials matched.
                        if(user.activationToken != null){  // User has not activated account yet.
                            console.log("User has not activated account, but is trying to login");
                            loggerInfo.info("User has not activated account, but is trying to login");
                            var errMessage = "You have not activated your account yet. Please check you email " + email 
                            + " and click on the link in the email from Skill Squirrel to activate your account";
                            res.render('index', {errMessage : errMessage, successMessage: ''});
                        }
                        else {  // All good, lets login in the member
                            const userId = user.id;
                            Profile.findAll({where:[{visible:true},{isDelete:false}]}).then(userProfiles =>{
                                var arr = userProfiles.map(profile=>{return profile.id});
                                    // user.getPosts({
                                        Post.findAll({
                                        include:{
                                            model:Profile,
                                                where:{isDelete:false}
                                                },
                                                required: false
                                            }).then(allPosts => {                 
                                    user.getGroups().then(userGroups => {
                                        req.session.isLoggedIn = true;
                                        req.session.user = user;
                                        const title = "Home -" + email;
                                        req.session.save(err => {
                                            res.render('home', {title : title, email : user.email, userId : userId, 
                                               posts : allPosts,profiles : userProfiles, groups : userGroups, isAuthenticated: req.session.isLoggedIn});
                                            });
                                    })  
                                }).catch(err=>{
                                    console.log("Error at login home page",err);
                                    loggerError.error("Error at login home page",err);
                                })  ; 
                            })
                            .catch(err => {
                                console.log("Unable to get profiles for user", userId);
                                loggerError.error("Unable to get profiles for user", userId);
                                console.log(err);
                                var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
                                res.render('index', {errMessage : errMessage, successMessage: ''});
                            });
                        }
                    }
                    else {
                        var errMessage = 'Login credentials failed. Please try again';
                        res.render('index', {errMessage : errMessage, successMessage: ''});
                    }
                })
                .catch(err => {
                    console.log("Unable to validate with encrypted password.");
                    loggerError.error("Unable to validate with encrypted password.");
                    console.log(err);
                    var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
                    res.render('index', {errMessage : errMessage, successMessage: ''});
                });
            }
        })
        .catch(err => {
            console.log(err);
            loggerError.error(err);
            var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
            res.render('index', {errMessage : errMessage, successMessage: ''});
        });
    },

    getSignUp : (req, res, next) => {
        res.render('signup', {
            pageTitle : 'Sign Up',
            path : '/signUp',
            err : undefined,
            captcha : res.recaptcha
        });
    },

    addGuestUser: (req, res, next) => {
        const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
        const email = "guest" + randId + "@skillsquirrel.com";
        bcrypt
          .hash("Guest" + randId, 10)
          .then(hashedPswd => {
            User.create({
              firstName: null,
              lastName: null,
              id: randId,
              email: email,
              password: hashedPswd,
              isCoopMember: false,
              activationToken: null,
              activationTokenExpiration: null,
              isActivated: false,
              isGuest: true
            })
              .then(user => {
                const userId = user.id;
                Post.findAll({include:[{model: Profile}]})
                  .then(allPosts => {
                    Profile.findAll()
                      .then(allProfiles => {
                        Group.findAll()
                          .then(allGroups => {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            const title = "Home -" + email;
                            req.session.save(err => {
                              res.render("home", {
                                title: title,
                                email: email,
                                userId: userId,
                                posts: allPosts,
                                profiles: allProfiles,
                                groups: allGroups,
                                isAuthenticated: req.session.isLoggedIn
                              });
                            });
                          })
                          .catch(err => {
                            console.log("Unable to get profiles for user", userId);
                            loggerError.error(
                              "Unable to get profiles for user",
                              userId
                            );
                            console.log(err);
                            res.render("index", {
                              errMessage: err,
                              successMessage: ""
                            });
                          });
                      })
                      .catch(err => {
                        console.log("Unable to get groups", err);
                        loggerError.error("Unable to get groups", err);
                      });
                  })
                  .catch(err => {
                    console.log("Error at login home page", err);
                    loggerError.error("Error at login home page", err);
                  });
              })
              .catch(err => {
                console.log("Unable to create guest user");
                loggerError.error("Unable to create guest user");
                console.log(err);
                const errMessage =
                  "Skill Squirrel is unable to create this user. Please contact the administrator for assistance.";
                res.render("index", { errMessage: errMessage, successMessage: "" });
              });
          })
          .catch(err => {
            console.log(
              "Unable to bycrypt the password during guest user creation"
            );
            loggerError.error(
              "Unable to bycrypt the password during guest user creation"
            );
            console.log(err);
          });
      },

    postAddUser : (req, res, next) => {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.Email;
        const pswd = req.body.Password;
        const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);

        const captchaResponse = req.body.recaptchaResponse;

        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" 
            + GOOGLE_RECAPTCHA_SECRET_KEY_Verfication + "&response=" + captchaResponse + "&remoteip=" + req.connection.remoteAddress;

        var host = req.headers.host;
        console.log("host : ", captchaResponse);

        request(verificationUrl, function (error, response, body) {
            
            if(error == null && response.statusCode == 200 && body && body != null ) {   // Some error occurred during captcha verification
                console.log(body);
                let captchVerResp = JSON.parse(body);

                if(captchVerResp.success != true || captchVerResp.score < 0.7){  // Captcha verification failed
                    console.log("Captcha verification failed. Success status = " + captchVerResp.success + " and score = " + captchVerResp.score);
                    loggerError.error("Captcha verification failed. Success status = " + captchVerResp.success + " and score = " + captchVerResp.score);
                    const errMessage = "Captcha verification failed. Please contact Skill Squirrel for assistance";
                    res.render('signup', {err: errMessage});
                }
                else {  // Captcha verification succeeed.
                    User.findOne({where: { email: email}})
                    .then(user => {
                        if(!user){
                            console.log("No such user exists, lets create one ");
                            loggerError.error("No such user exists, lets create one ");
                            bcrypt.hash(pswd, 10).then(hashedPswd => {  // Try hashing password first

                                // Create secure, unique token from crypto library to send to user
                                crypto.randomBytes(32, (error, buffer) => {
                                    if(error){
                                        console.log(error);
                                        console.log("Unable to create generate unique token");
                                        loggerError.error("Unable to create generate unique token " +error );
                                        const errMessage = "Skill Squirrel is unable to generate a unique token. Please contact the administrator for assistance.";
                                        res.render('signup', {err: errMessage});
                                    }
                                    else {  // All good, save the new user account now and send activation email
                                        const activationToken = buffer.toString('hex');
                                        const activationTokenExpiration = Date.now() + (2 * 3600 * 1000);  // Two hours
                                                                                
                                        User.create({
                                            firstName : firstname,
                                            lastName : lastname,
                                            id : randId,
                                            email : email,
                                            password : hashedPswd,
                                            isCoopMember : false,
                                            activationToken : activationToken,
                                            activationTokenExpiration : activationTokenExpiration,
                                            isActivated : false,
                                            isGuest : false
                                        }).then(user => {  // User record created successfully. Send email and redirect
                                            const successMessage = "An email has been sent to " + email + ". Please click on the link in that email to help us verify your identity and activate your account.";
                                            res.render('index', {errMessage : '', successMessage: successMessage});
                                                                                      
                                            var html = `
                                                <p><h4> Please click on the following link to confirm your email address and to activate your account. 
                                                </h4> <p><a href="http://${host}/activate/${activationToken}">Activate your account now</a>
                                                `;

                                            return transporter.sendMail({
                                                to : email,
                                                from: 'support@skillsquirrel.com',
                                                subject: 'Welcome to Skill Squirrel! Please Confirm Your Email ',
                                                html: html
                                                });
                                        }).catch(err => {
                                            console.log("Unable to create user");
                                            loggerError.error("Unable to create user "+err);
                                            console.log(err);
                                            const errMessage = "Skill Squirrel is unable to create this user. Please contact the administrator for assistance.";
                                            res.render('signup', {err: errMessage});
                                        });
                                    }
                                });
                            }).catch(err => {  // Unable to hash password ??!!!
                                console.log("Unable to hash password");
                                loggerError.error("Unable to hash password");
                                const errMessage = "Something went wrong. Please contact the administrator for assistance.";
                                res.render('signup', {err: errMessage});
                            });                            
                        }
                        else if(user.isGuest) {
                            crypto.randomBytes(32, (error, buffer) => {
                                if(error){
                                    console.log(error);
                                    console.log("Unable to create generate unique token");
                                    loggerError.error("Unable to create generate unique token " +error );
                                    const errMessage = "Skill Squirrel is unable to generate a unique token. Please contact the administrator for assistance.";
                                    res.render('signup', {err: errMessage});
                                }
                                else { 
                                    const activationToken = buffer.toString('hex');
                                    const activationTokenExpiration = Date.now() + (2 * 3600 * 1000);
                                    user.update({
                                        firstName : firstname,
                                        lastName : lastname,
                                        id : randId,
                                        email : email,
                                        password : bcrypt.hashSync(pswd, 10),
                                        isCoopMember : false,
                                        activationToken : activationToken,
                                        activationTokenExpiration : activationTokenExpiration,
                                        isActivated : false,
                                        isGuest : false
                                    },{where: { email: email}}).then(user => {  // User record created successfully. Send email and redirect
                                        const successMessage = "An email has been sent to " + email + ". Please click on the link in that email to help us verify your identity and activate your account.";
                                        res.render('index', {errMessage : '', successMessage: successMessage});
                                                                                
                                        var html = `
                                            <p><h4> Please click on the following link to confirm your email address and to activate your account..
                                            </h4> <p><a href="http://${host}/activate/${activationToken}">Activate your account now</a>
                                            `;

                                        return transporter.sendMail({
                                            to : email,
                                            from: 'support@skillsquirrel.com',
                                            subject: 'Welcome to Skill Squirrel! Please Confirm Your Email ',
                                            html: html
                                            });
                                    }).catch(err => {
                                        console.log("Unable to create user");
                                        loggerError.error("Unable to create user "+err);
                                        console.log(err);
                                        const errMessage = "Skill Squirrel is unable to create this user. Please contact the administrator for assistance.";
                                        res.render('signup', {err: errMessage});
                                    });
                                }
                            });
                        }
                        else {  // User with same email already exists
                            const errMessage = "User already exists. Please try again with another email account.";
                            console.log("User already exists");
                            res.render('signup', {err: errMessage});
                            return user;
                        }                        
                    })
                    .catch(err => {   // Unable to query DB for user
                        console.log("Unable to query DB for user.");
                        console.log(err);
                        const errMessage = "Something went wrong. Please contact the administrator for assistance.";
                        res.render('signup', {err: errMessage});
                    })
                }
            }
            else {
                console.log("An error occurred during captcha verification. Error = " + error + " and statusCode = " + statusCode);
                loggerError.error("An error occurred during captcha verification. Error = " + error + " and statusCode = " + statusCode);
                const errMessage = "Captcha verification failed. Please contact Skill Squirrel for assistance";
                res.render('signup', {err: errMessage});
            }
        });
    },

    activateUser:  (req, res, next) => {
        let isAuthenticated = false;
        req.session.isLoggedIn = false;
        const token = req.params.tokenId;

        User.findOne({where: { activationToken : token}})
        .then(user => {
            if(!user){   // No such user.
                loggerError.error('No such user found. Please check your email and click on the link to activiate.');
                var errMessage = 'No such user found. Please check your email and click on the link to activiate.';
                res.render('index', {errMessage : errMessage, successMessage: ''});
            }
            else {
                user.activationToken = null;
                user.activationTokenExpiration = null;
                req.session.isLoggedIn = true;
                const userId = user.id;
                const email = user.email;
                user.save().then(result => {
                    user.getPosts().then(userPosts => {                            
                        req.session.isLoggedIn = true;
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        const title = "Home -" + email;
                        req.session.save(err => {
                            res.render('home', { title : title, email : email, userId : userId, 
                                posts : userPosts, isAuthenticated: req.session.isLoggedIn});
                        });
                    })
                    .catch(err => {
                        console.log("Unable to get profiles for user", userId);
                        loggerError.error("Unable to get profiles for user", userId);
                        console.log(err);
                        var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
                        res.render('index', {errMessage : errMessage, successMessage: ''});
                    });
                }).catch(err => {
                        console.log("Unable to update for user activation for user", userId);
                        loggerError.error("Unable to update for user activation for user", userId);
                        console.log(err);
                        var errMessage = 'An error occurred while logging in. Please contact Skill Squirrel';
                        res.render('index', {errMessage : errMessage, successMessage: ''});
                });
            }
        })
        .catch(err => {
            console.log("An error occurred during account activation.");
            loggerError.error("An error occurred during account activation.");
            console.log(err);
            const errMessage = "Activation failed. Please contact Skill Squirrel for assistance";
            res.render('signup', {err: errMessage});
        });
    }
}
