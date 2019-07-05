module.exports = function(User, Post, Profile, Group, PostFiles,Credential,UserCredential) {
  var module = {};
  const express = require("express");
  var flash = require("req-flash");
  var moment = require("moment");

  const app = new express();
  app.use(flash());

  module.getCreatePost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    res.render("create-post-form", { userId: ownerUserId });
  };

  module.getPost = (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
    Post.findByPk(postId).then(post => {
      post.getSsuser().then(user =>{
        post.getProfile().then(attachedProfile=>{
          Group.findByPk(post.ssgroupId).then(group => {
            if (!group) {
              var shareLink =
              "http://" + req.headers.host + "/view-post/" + postId;
              res.render("postView", {
              title: "Post",
              welcome: "",
              user: user,
              userId: userId,
              post: post,
              profiles: attachedProfile,
              moment: moment,
              attachedcredentials : null,
              credentials: null,
              groupUser: null,
              shareLink: shareLink
              });
              }else{
                group.getUsers({through: {where: { isParticipant: true}}}).then(groupUser => {
                 var groupParticipants =[];
                 groupUser.forEach( gu => { 
                   if(gu.id  == userId){
                    groupParticipants.push(gu);
                   }
                 });
                  console.log("groupParticipants ******", groupParticipants.length);
                  post.getUserCredential().then(attachedcredentials=>{
                  if (groupUser.length <= 0) {
                   
                    var shareLink =
                      "http://" +
                      req.headers.host +
                      "/view-post/" +
                      postId;
                    res.render("postView", {
                      title: "Post",
                      welcome: "",
                      user: user,
                      userId: userId,
                      post: post,
                      attachedcredentials : attachedcredentials,
                      credentials: null,
                      profiles: attachedProfile,
                      groupUser: groupUser,
                      moment: moment,
                      shareLink: shareLink
                    });
                  } else{
                    post.getCredentials().then(credentials=>{
                      console.log("print credential",credentials);
                      var shareLink =
                        "http://" +
                        req.headers.host +
                        "/view-post/" +
                        postId;
                        res.render("postView", {
                        title: "Post",
                        welcome: "",
                        user: user,
                        userId: userId,
                        post: post,
                        moment: moment,
                        attachedcredentials : attachedcredentials,
                        credentials : credentials,
                        profiles: attachedProfile,
                        groupUser: groupParticipants,
                        shareLink: shareLink
                        });
                    }).catch(err=>{
                      console.log("Unable to find certificate generate for post  ",err);
                      res.render("index", { errMessage: errMessage, successMessage: "" });
                    })
                   
                  } }).catch(err=>{
                    console.log("Unable to find attached credentials post  ",err);
                    res.render("index", { errMessage: errMessage, successMessage: "" });
                  })
                }).catch(err=>{
                  console.log("Unable to find group paticipates  ",err);
                  res.render("index", { errMessage: errMessage, successMessage: "" });
                })
              }
          }).catch(err => {
            console.log("while getting group", err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          }); 
        }) .catch(err => {
          console.log("while getting attached profile", err);
          res.render("index", { errMessage: errMessage, successMessage: "" });
        });   
      }) .catch(err => {
          console.log("while getting user info", err);
          res.render("index", { errMessage: errMessage, successMessage: "" });
        });
    }).catch(err => {
      console.log("while finding post", err);
      res.render("index", { errMessage: errMessage, successMessage: "" });
    });
  };

  module.getEditPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findByPk(postId)
      .then(post => {
        post
          .getPostFiles()
          .then(postFiles => {
            const userId = post.ssuserId;
            User.findByPk(userId)
              .then(user => {
                user
                  .getProfiles()
                  .then(userProfiles => {
                    user.getUserCredentials({where:{ssgroupId:post.ssgroupId}}).then(userCredentials=>{
                      title = "Post Edit";
                      res.render("post-edit", {
                        userId: userId,
                        profiles: userProfiles,
                        title: title,
                        post: post,
                        userCredentials:userCredentials,
                        postFiles: postFiles,
                        moment: moment
                      });
                    }).catch(err=>{
                      console.log("Unable to find any post types  ");
                      console.log(err);
                      res.render("index", {
                        errMessage: errMessage,
                        successMessage: ""
                      });
                    })  
                  })
                  .catch(err => {
                    console.log("Unable to find any post types  ");
                    console.log(err);
                    res.render("index", {
                      errMessage: errMessage,
                      successMessage: ""
                    });
                  });
              })
              .catch(err => {
                console.log("Unable to find user  ", userId);
                console.log(err);
                res.render("index", {
                  errMessage: errMessage,
                  successMessage: ""
                });
              });
          })
          .catch(err => {
            console.log("Unable to find post files related to the post");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      })
      .catch(err => {
        console.log(
          "Error when finding the post when enter to edit post ",
          postId
        );
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };


  module.postEdit = (req, res, next) => {
    const postId = req.params.postId;
    const previousImg = req.body.previousUploadImg;
    const userId = req.body.userId;
    const name = req.body.Name;
    var imgObject = req.files.find(file => file.fieldname === "image");
    var galleryObj = req.files.filter(file => file.fieldname === "gallery");
    const profileId = req.body.AttachedProfileLink;
    const postDescription = req.body.PDesc;
    const postalCode = req.body.PostalCode;
    const promotionType = req.body.PromotionType;
    const description = req.body.Desc;
    const fromDate = req.body.FromDate;
    const toDate = req.body.ToDate;
    const postType = req.body.PostType;
    const directMessage = req.body.DirectMessage;
    const postPromotion = req.body.PostPromotion;
    const rentalRate = req.body.RentalRate;
    const rentalRules = req.body.RentalRules;
    const rentalPolicy = req.body.RentalPolicy;
    var eventUrl = req.body.EventUrl;
    const eventEnrollmentLimit = req.body.EventEnrollmentLimit;
    const eventPrice = req.body.EventPrice;
    const webPageUrl = req.body.WebpageUrl;
    const hashTag = req.body.HashTag;
    var jobPostingUrl = req.body.JobPostingUrl;
    var reserveTicketUrl = req.body.ReserveticketsUrl;
    const advisoryType = req.body.AdvisoryType;
    const compensation = req.body.Compensation;
    const address = req.body.Addresss;
    const address2 = req.body.Addresss2;
    const city = req.body.City;
    const province = req.body.Province;
    const country = req.body.Country;
    const paymentTerms = req.body.Paymentterms;
    const credentialOffer = req.body.CredentialOffer;
    const credentialExpiration = req.body.CredentialExpiration;
    const advisoryQuestion1 = req.body.AdvisoryQuestion1;
    const advisoryQuestion2 = req.body.AdvisoryQuestion2;
    const advisoryQuestion3 = req.body.AdvisoryQuestion3;

    if ((fromDate.length <= 0) | (toDate.length <= 0)) {
      var startDate = null;
      var endDate = null;
    } else {
      var startDate = fromDate;
      var endDate = toDate;
    }

    if (
      typeof reserveTicketUrl === "undefined" ||
      reserveTicketUrl.length <= 0
    ) {
      reserveTicketUrl = null;
    } else {
      if (!reserveTicketUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        reserveTicketUrl = "http://" + reserveTicketUrl;
      }
    }
    if (typeof eventUrl === "undefined" || eventUrl.length <= 0) {
      eventUrl = null;
    } else {
      if (!eventUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        eventUrl = "http://" + eventUrl;
      }
    }
    if (typeof jobPostingUrl === "undefined" || jobPostingUrl.length <= 0) {
      jobPostingUrl = null;
    } else {
      if (!jobPostingUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        jobPostingUrl = "http://" + jobPostingUrl;
      }
    }

    if (
      (credentialOffer === "false") |
      (typeof credentialOffer === "undefined")
    ) {
      var credentialSkill = null;
      var credentialId = null;
      var expirationDate = null;
    } else {
      var credentialSkill = req.body.CredentialSkill;
      var credentialId = req.body.credentialId;
      if (
        (credentialExpiration === "false") |
        (typeof credentialExpiration === "undefined")
      ) {
        var expirationDate = null;
      } else {
        var expirationDate = req.body.ExpirationDate;
      }
    }
    if (imgObject === undefined) {
      var imgUrl = previousImg;
    } else {
      var imgUrl = "/" + imgObject.path;
    }

    if (credentialId != null){
          var template;
          console.log("credential id''''''''''",credentialId);
           UserCredential.findByPk(credentialId).then(attachedCredential=>{
             console.log("********** attached credentials.",attachedCredential);
               template = createTemplate(attachedCredential.credentialImage, attachedCredential.credentialName, attachedCredential.credentialDescription);
            }).catch(err=>{
              console.log("while finding att",err)
            })
          }else{
            var template = null;
         }
      
    Post.findByPk(postId)
      .then(post => {
        post
          .update({
            name: name,
            description: description,
            postThumnail: imgUrl,
            postDescription: postDescription,
            postalCode: postalCode,
            promotionType: promotionType,
            fromDate: startDate,
            toDate: endDate,
            rentalRate: rentalRate,
            rentalRules: rentalRules,
            rentalPolicy: rentalPolicy,
            directMessage: directMessage,
            postPromotion: postPromotion,
            eventEnrollmentLimit: eventEnrollmentLimit,
            eventPrice: eventPrice,
            advisoryType: advisoryType,
            eventUrl: eventUrl,
            webPageUrl: webPageUrl,
            hashTag: hashTag,
            jobPostingUrl: jobPostingUrl,
            reserveTicketUrl: reserveTicketUrl,
            advisoryCompensation: compensation,
            advisoryQuestion1: advisoryQuestion1,
            advisoryQuestion2: advisoryQuestion2,
            advisoryQuestion3: advisoryQuestion3,
            address: address,
            address2: address2,
            city: city,
            province: province,
            country: country,
            paymentTerms: paymentTerms,
            credentialSkill: credentialSkill,
            credentialOffer :credentialOffer,
            expirationDate: expirationDate,
            postTypes: postType,
            userCredentialId : credentialId,
            postCertificateTemplate: template
          })
          .then(updatedPost => {
            User.findByPk(userId)
              .then(user => {
                // Get the user
                user
                  .addPost(updatedPost)
                  .then(() => {
                    // Associate this post with the user
                    if (profileId.length <= 0) {
                      title = "Post";
                      console.log(
                        "Seems to be okay for post create... go to accounts page"
                      );
                      var shareLink =
                        "http://" + req.headers.host + "/view-post/" + post.id;
                      console.log("Share link is ", shareLink);
                      req.flash(
                        "postSuccessMessage",
                        "Post Saved Successfully!"
                      );
                      res.render("postPreview", {
                        title: title,
                        postSuccessMessage: req.flash("postSuccessMessage"),
                        user: user,
                        userId: userId,
                        post: post,
                        profile: null,
                        attachedcredentials: null,
                        shareLink: shareLink,
                        moment: moment
                      });
                    } else {
                      Profile.findByPk(profileId)
                        .then(profile => {
                          // Get the profile id associated with this post
                          profile
                            .addPost(post)
                            .then(() => {
                              UserCredential.findByPk(credentialId).then(attachedCredential=>{
                              // Associate this post with the chosen profile
                              title = "Post";
                              console.log(
                                "Seems to be okay for post create... go to accounts page"
                              );
                              var shareLink =
                                "http://" +
                                req.headers.host +
                                "/view-post/" +
                                post.id;
                              console.log("Share link is ", shareLink);
                              req.flash(
                                "postSuccessMessage",
                                "Post Saved Successfully!"
                              );
                              res.render("postPreview", {
                                title: title,
                                postSuccessMessage: req.flash(
                                  "postSuccessMessage"
                                ),
                                user: user,
                                userId: userId,
                                post: post,
                                profile: profile,
                                attachedcredentials: attachedCredential,
                                shareLink: shareLink,
                                moment: moment
                              });
                            }) }).catch(err => {
                              console.log(
                                "Error associating credential with the profile",
                                err
                              );
                            })
                            .catch(err => {
                              // TODO Redirect to home page if there errors
                              console.log(
                                "Error associating post with the profile",
                                err
                              );
                            });
                        })
                        .catch(err => {
                          console.log("Error finding the profile", err);
                          res.render("index", {
                            errMessage: errMessage,
                            successMessage: ""
                          });
                        });
                    }
                  })
                  .catch(err => {
                    console.log("Error associating the user and post", err);
                    res.render("index", {
                      errMessage: errMessage,
                      successMessage: ""
                    });
                  });
              })
              .catch(err => {
                // Unable to find user
                console.log("Unable to find user  ", userId);
                console.log(err);
                res.render("index", {
                  errMessage: errMessage,
                  successMessage: ""
                });
              });
          })
          .catch(err => {
            console.log("Error while updating profile", err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Error while getting paticular post to update", err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };
  module.getCreateServicePost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    User.findByPk(ownerUserId)
      .then(user => {
        user
          .getProfiles()
          .then(userProfiles => {
            title = "Post service";
            res.render("postservice", {
              userId: ownerUserId,
              profiles: userProfiles,
              title: title
            });
          })
          .catch(err => {
            console.log("Unable to find any post types  ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Unable to find user  ", ownerUserId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.getCreateRentalPost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    User.findByPk(ownerUserId)
      .then(user => {
        user
          .getProfiles()
          .then(userProfiles => {
            res.render("postRental", {
              userId: ownerUserId,
              profiles: userProfiles
            });
          })
          .catch(err => {
            console.log("Unable to find any post types  ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Unable to find user  ", userId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.getCreateEventPost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    User.findByPk(ownerUserId).then(user => {
        user.getProfiles().then(userProfiles => {
          user.getGroups().then(userGroups=>{
          user.getUserCredentials().then(userCreateCredentials=>{
            console.log(userGroups);
            res.render("postEvent", {
              userId: ownerUserId,
              profiles: userProfiles,
              groups : userGroups,
              userCreateCredentials:userCreateCredentials,
              user:user
            });
          }).catch(err => {
            console.log("Unable to find credential for user ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          })
         }) .catch(err => {
            console.log("Unable to find Group for user ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      }).catch(err => {
        console.log("Unable to find profile for user ");
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      })
    }).catch(err => {
        console.log("Unable to find user  ", ownerUserId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.getCreateAdvisoryPost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    User.findByPk(ownerUserId)
      .then(user => {
        user
          .getProfiles()
          .then(userProfiles => {
            res.render("postAdvisory", {
              userId: ownerUserId,
              profiles: userProfiles
            });
          })
          .catch(err => {
            console.log("Unable to find any post types  ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Unable to find user  ", ownerUserId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.getCreateTraingingPost = (req, res, next) => {
    const ownerUserId = req.params.userId;
    User.findByPk(ownerUserId).then(user => {
        user.getProfiles().then(userProfiles => {
          user.getGroups().then(userGroups=>{
          user.getUserCredentials().then(userCreateCredentials=>{
            res.render("postTraining", {
              userId: ownerUserId,
              profiles: userProfiles,
              groups : userGroups,
              userCreateCredentials:userCreateCredentials,
              user:user
            });
          }).catch(err => {
            console.log("Unable to find credential for user ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          })
         }) .catch(err => {
            console.log("Unable to find Group for user ");
            console.log(err);
            res.render("index", { errMessage: errMessage, successMessage: "" });
          });
      }).catch(err => {
        console.log("Unable to find profile for user ");
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      })
    }).catch(err => {
        console.log("Unable to find user  ", ownerUserId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.postCreateService = (req, res, next) => {
    const userId = req.body.userId;
    const name = req.body.Name;
    var imgObject = req.files.find(file => file.fieldname === "image");
    var galleryObj = req.files.filter(file => file.fieldname === "gallery");
    const profileId = req.body.AttachedProfileLink;
    const postDescription = req.body.PDesc;
    const postalCode = req.body.PostalCode;
    const promotionType = req.body.PromotionType;
    const description = req.body.Desc;
    const fromDate = req.body.FromDate;
    const toDate = req.body.ToDate;
    const postType = req.body.PostType;
    const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
    const directMessage = req.body.DirectMessage;
    const postPromotion = req.body.PostPromotion;
    const rentalRate = req.body.RentalRate;
    const rentalRules = req.body.RentalRules;
    const rentalPolicy = req.body.RentalPolicy;
    var eventUrl = req.body.EventUrl;
    const eventEnrollmentLimit = req.body.EventEnrollmentLimit;
    const eventPrice = req.body.EventPrice;
    const webPageUrl = req.body.WebpageUrl;
    const hashTag = req.body.HashTag;
    var jobPostingUrl = req.body.JobPostingUrl;
    var reserveTicketUrl = req.body.ReserveticketsUrl;
    const advisoryType = req.body.AdvisoryType;
    const compensation = req.body.Compensation;
    const address = req.body.Addresss;
    const address2 = req.body.Addresss2;
    const city = req.body.City;
    const province = req.body.Province;
    const country = req.body.Country;
    const paymentTerms = req.body.Paymentterms;
    const credentialOffer = req.body.CredentialOffer;
    const credentialExpiration = req.body.CredentialExpiration;
    const advisoryQuestion1 = req.body.AdvisoryQuestion1;
    const advisoryQuestion2 = req.body.AdvisoryQuestion2;
    const advisoryQuestion3 = req.body.AdvisoryQuestion3;
    const draftPost = "false";

    console.log("Selected postType ----", postType);

    if (imgObject === undefined) {
      var imgUrl = "/images/Post-icon.png";
    } else {
      var imgUrl = "/" + imgObject.path;
    }

    if (typeof eventUrl === "undefined" || eventUrl.length <= 0) {
      eventUrl = null;
    } else {
      if (!eventUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        eventUrl = "http://" + eventUrl;
      }
    }
    if ((fromDate.length <= 0) | (toDate.length <= 0)) {
      var startDate = null;
      var endDate = null;
    } else {
      var startDate = fromDate;
      var endDate = toDate;
    }

    if (
      typeof reserveTicketUrl === "undefined" ||
      reserveTicketUrl.length <= 0
    ) {
      reserveTicketUrl = null;
    } else {
      if (!reserveTicketUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        reserveTicketUrl = "http://" + reserveTicketUrl;
      }
    }
    if (typeof jobPostingUrl === "undefined" || jobPostingUrl.length <= 0) {
      jobPostingUrl = null;
    } else {
      if (!jobPostingUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        jobPostingUrl = "http://" + jobPostingUrl;
      }
    }

    if (
      (credentialOffer === "false") |
      (typeof credentialOffer === "undefined")
    ) {
      var credentialSkill = null;
      var credentialId = null;
      var expirationDate = null;
    } else {
      var credentialSkill = req.body.CredentialSkill;
      var credentialId = req.body.credentialId;
      if (
        (credentialExpiration === "false") |
        (typeof credentialExpiration === "undefined")
      ) {
        var expirationDate = null;
      } else {
        var expirationDate = req.body.ExpirationDate;
      }
    }

    Post.create({
      id: randId,
      name: name,
      description: description,
      postThumnail: imgUrl,
      postDescription: postDescription,
      postalCode: postalCode,
      promotionType: promotionType,
      fromDate: startDate,
      toDate: endDate,
      rentalRate: rentalRate,
      rentalRules: rentalRules,
      rentalPolicy: rentalPolicy,
      directMessage: directMessage,
      postPromotion: postPromotion,
      eventUrl: eventUrl,
      eventEnrollmentLimit: eventEnrollmentLimit,
      eventPrice: eventPrice,
      webPageUrl: webPageUrl,
      reserveTicketUrl: reserveTicketUrl,
      jobPostingUrl: jobPostingUrl,
      hashTag: hashTag,
      advisoryType: advisoryType,
      advisoryCompensation: compensation,
      advisoryQuestion1: advisoryQuestion1,
      advisoryQuestion2: advisoryQuestion2,
      advisoryQuestion3: advisoryQuestion3,
      address: address,
      address2: address2,
      city: city,
      province: province,
      country: country,
      paymentTerms: paymentTerms,
      credentialOffer: credentialOffer,
      credentialSkill: credentialSkill,
      expirationDate: expirationDate,
      draftPost: draftPost,
      userCredentialId : credentialId,
      postTypes: postType,
      isActive:true
    })
      .then(post => {
        console.log("entered to post creation");
        var postFiledata = [];
        if (galleryObj.length > 0) {
          galleryObj.map(gallery => {
            var galleryData = {
              id: Math.floor(Math.random() * (1000 - 1 + 1) + 1),
              postId: post.id,
              gallery: "/" + gallery.path
            };
            postFiledata.push(galleryData);
          });
        }
        PostFiles.bulkCreate(postFiledata, {
          returning: true,
          hooks: true,
          individualHooks: false,
          ignoreDuplicates: false
        }).then(postFile => {
          console.log("Bulk created post files for posts gallery " + postFile);
          User.findByPk(userId)
            .then(user => {
              user
                .getProfiles()
                .then(userProfiles => {
                  // Get the user
                  user
                    .addPost(post)
                    .then(() => {
                      // Associate this post with the user
                      console.log(profileId);
                      if (profileId.length <= 0) {
                        title = "Post";
                        console.log(
                          "Seems to be okay for post create without profile associaton"
                        );
                        var shareLink =
                          "http://" +
                          req.headers.host +
                          "/view-post/" +
                          post.id;
                        console.log("Share link is ", shareLink);
                        req.flash(
                          "postSuccessMessage",
                          "Post Created Successfully!"
                        );
                        res.render("postPreview", {
                          title: title,
                          postSuccessMessage: req.flash("postSuccessMessage"),
                          user: user,
                          profile: null,
                          userId: userId,
                          post: post,
                          attachedcredentials: null,
                          shareLink: shareLink,
                          moment: moment
                        });
                      } else {
                        Profile.findByPk(profileId)
                          .then(profile => {
                            profile
                              .addPost(post)
                              .then(() => {
                                post.update({ssgroupId : profile.ssgroupId}).then(updatedPost=>{
                                UserCredential.findByPk(credentialId).then(attachedCredential=>{
                                // Associate this post with the chosen profile
                                title = "Post";
                                console.log(
                                  "Seems to be okay for post create... go to accounts page"
                                );
                                var shareLink =
                                  "http://" +
                                  req.headers.host +
                                  "/view-post/" +
                                  post.id;
                                console.log("Share link is ", shareLink);
                                req.flash(
                                  "postSuccessMessage",
                                  "Post Created Successfully!"
                                );
                                res.render("postPreview", {
                                  title: title,
                                  postSuccessMessage: req.flash(
                                    "postSuccessMessage"
                                  ),
                                  user: user,
                                  userId: userId,
                                  post: updatedPost,
                                  profile: profile,
                                  profiles: profile,
                                  attachedcredentials:attachedCredential,
                                  shareLink: shareLink,
                                  moment: moment
                                });
                               }).catch(err => {
                                console.log(
                                  "Error associating credential with the profile",
                                  err
                                );
                              }) }).catch(err => {
                                console.log(
                                  "Error while update post with profile groupid",
                                  err
                                );
                              })
                            })  .catch(err => {
                                // TODO Redirect to home page if there errors
                                console.log(
                                  "Error associating post with the profile",
                                  err
                                );
                                res.render("index", {
                                  errMessage: errMessage,
                                  successMessage: ""
                                });
                              });
                          })
                          .catch(err => {
                            console.log("Error finding the profile", err);
                            res.render("index", {
                              errMessage: errMessage,
                              successMessage: ""
                            });
                          })
                      }
                    })
                    .catch(err => {
                      console.log("Error associating the user and post", err);
                      res.render("index", {
                        errMessage: errMessage,
                        successMessage: ""
                      });
                    });
                })
                .catch(err => {
                  // Unable to find user
                  console.log("Unable to find user  ", userId);
                  console.log(err);
                  res.render("index", {
                    errMessage: errMessage,
                    successMessage: ""
                  });
                });
            })
            .catch(err => {
              // Unable to create new post
              console.log("Unable to create BULK post files for post ", name);
              res.render("index", {
                errMessage: errMessage,
                successMessage: ""
              });
            })
            .catch(err => {
              // Unable to find user
              console.log("Unable to find user  ", userId);
              console.log(err);
              res.render("index", {
                errMessage: errMessage,
                successMessage: ""
              });
            });
        });
      })
      .catch(err => {
        // Unable to create new post
        console.log("Unable to create new post with name ", name);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  module.isActivePost = (req, res, next) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const isActive = req.params.val;

    Post.findByPk(postId)
      .then(post => {
        post
          .update({ isActive: isActive }, { where: [{ id: postId },{ssuserId:userId}] })
          .then(updatedPost => {
            res.redirect("/account/" + userId+"/true");
          })
          .catch(err => {
            console.log("Error when active/inactive Post ", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Error while retrieving post ", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.getViewPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findByPk(postId).then(post => {
      post.getSsuser().then(user => {
                post.getProfile().then(attachedProfile=>{
                post.getUserCredential().then(attachedcredentials=>{
                var shareLink =
                  "http://" + req.headers.host + "/view-post/" + postId;
                console.log("Share link is ", shareLink);
                res.render("postView", {
                  title: "Post",
                  welcome: "",
                  user: user,
                  userId: '',
                  post: post,
                  attachedcredentials:attachedcredentials,
                  profiles: attachedProfile,
                  shareLink: shareLink,
                  moment: moment
                });
              }).catch(err=>{
                console.log("Unable to find attached credentials for the post", err);
                res.render("index", {
                  errMessage: errMessage,
                  successMessage: ""
                });
              })
            }).catch(err=>{
              console.log("Unable to find attached profile for the post", err);
              res.render("index", {
                errMessage: errMessage,
                successMessage: ""
              });
            })
            })
            .catch(err => {
              console.log("Unable to find user for the post  ", err);
              console.log(err);
              res.render("index", {
                errMessage: errMessage,
                successMessage: ""
              });
            });
      })
      .catch(err => {
        console.log("Unable to find post  ", postId);
        console.log(err);
        res.render("index", { errMessage: errMessage, successMessage: "" });
      });
  };

  return module;
};

var { finalConfig } = require("../configs/config");

var createTemplate = function(imgUrl, name, postDescription) {
  var propertyMap = new Map();
  if (imgUrl !== null && imgUrl !== "undefined" && imgUrl.length != 0) {
    propertyMap.set(
      "issuer_logo_file",
      finalConfig.certsPaths.pathToSkillSquirrelCodebase + imgUrl
    );
  } else {
    propertyMap.set("issuer_logo_file", "");
  }

  if (name !== null && name !== "undefined" && name.length != 0) {
    propertyMap.set("certificate_title", name);
  } else {
    propertyMap.set("certificate_title", "");
  }

  if (
    postDescription !== null &&
    postDescription !== "undefined" &&
    postDescription.length != 0
  ) {
    propertyMap.set("certificate_description", postDescription);
  } else {
    propertyMap.set("certificate_description", "");
  }

  var fs = require("fs");
  if (propertyMap.size > 0) {
    var confFilePath = finalConfig.certsPaths.pathToCertToolsConfFile;
    var confFile = fs.readFileSync(confFilePath, "utf-8");
    var lines = confFile.split("\n");
    var updatedProperties = "";

    lines.forEach(line => {
      var tokens = line.split("=");
      var propertyName = tokens[0].trim();
      var value = propertyMap.get(propertyName);
      if (value === undefined) {
        updatedProperties = updatedProperties + line + "\n";
      } else {
        var property = propertyName + "=" + value;
        updatedProperties = updatedProperties + property + "\n";
      }
    });

    fs.writeFileSync(confFilePath, updatedProperties, "utf-8");
  }

  const cmd = require("child_process");
  var bashCmdToCreateTemplate =
    "bash " +
    finalConfig.certsPaths.pathToSkillSquirrelCodebase +
    "/sh/certificateTemplate.sh";
  cmd.execSync(bashCmdToCreateTemplate, (error, stdout, stderr) => {
    if (error) {
      console.error(`execSync error with certificateTemplate.sh: ${error}`);
      return;
    }
  });

  console.log("Successfully created the certificate template.");

  var template = fs.readFileSync(
    finalConfig.certsPaths.pathToCertTemplate,
    "utf-8"
  );
  return template;
};
