module.exports = function(User, Profile, PostType, Post, Group,Credential) {
  var module = {};
  const express = require("express");
  var flash = require("req-flash");
  
  const app = new express();
  app.use(flash());

  module.getShowProfiles = (req, res, next) => {
    const userId = req.params.userId;

    User.findByPk(userId)
      .then(user => {
        user
          .getProfiles()
          .then(profiles => {
            title = "Profiles -" + user.email;
            res.render("profile-list", {
              title: title,
              userId: userId,
              profiles: profiles
            });
          })
          .catch(err => {
            console.log(err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Unable to find user  ", userId);
        console.log(err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.getProfile = (req, res, next) => {
    const userId = req.params.userId;
    const profileId = req.params.profileId;    
    var profiledetail = "no";
    User.findByPk(userId).then(user => {
        Profile.findByPk(profileId).then(profile => {                      
          profile.getCredentials({ through:{ where: {profileId: profileId}}}).then(attachedCredential =>{                  
            var shareLink =
              "http://" +
              req.headers.host +
              "/profile-view/" +
              profile.id + "/" +userId;              
            console.log("Share link is ", shareLink);
            res.render("profilePreview", {
              user: user,
              userId: userId,
              profile: profile,                        
              attachedCredential:attachedCredential,                         
              profiledetail: profiledetail,
              shareLink: shareLink
            });
          })
          .catch(err => {
            console.log("Error where finding the profile", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });              
      })
      .catch(err => {
        console.log("Error where finding the user", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
    }) .catch(err =>{
      console.log("Error where finding the post", err)
    }); 
  };

  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  module.getEditProfile = (req, res, next) => {
    const profileId = req.params.profileId;    
    console.log("edit profile id", profileId);
    Profile.findByPk(profileId).then(profile => {
        var ProfileGroup = [];
        Group.findOne({ where: { id: profile.ssgroupId } }).then(group => {
          if (!group) {
            console.log("Profile is not related to group");
          } else {
            ProfileGroup.push(group);
          }
        });
      
        PostType.findAll().then(postTypes => {          
          const userId = profile.ssuserId;       
          User.findByPk(userId).then(user => {        
            Credential.findAll({ where: {isCredentialAcquired: true}}).then(userCredentials => {                                   
            title = "edit-profile ";
            console.log("group with associated profile", ProfileGroup.length);
            res.render("edit-profile", {
              title: title,
              user:user,
              userId: profile.ssuserId,
              group: ProfileGroup,
              posttypes: postTypes,             
              userCredentials:userCredentials,          
              profile: profile
            });         
          })
          .catch(err => {
            console.log("Unable to find any post types  ");
            console.log(err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
        })        
      })
      })
      .catch(err => {
        console.log(err);
        res.render("index", { errMessage: err, successMessage: "" });
      });    
  };

  module.PostEditProfile = (req, res, next) => {
    const profileId = req.params.profileId;
    const previousImg = req.params.previousUploadImg;
    const name = req.body.Name;
    const goal = req.body.Goal;
    var bussinessUrl = req.body.BussinessUrl;
    const postalCode = req.body.PostalCode;
    const keyWords = req.body.Keywords;
    const description = req.body.Desc;
    const credentialId = req.body.credentialId;
    var imgObject = req.files.find(file => file.fieldname === "image");
    console.log("imgObject : ", imgObject);

    if (imgObject === undefined) {
      var imgUrl = previousImg;
    } else {
      var imgUrl = "/" + imgObject.path;
    }

    if (typeof bussinessUrl === "undefined" || bussinessUrl.length <= 0) {
      bussinessUrl = null;
    } else {
      if (!bussinessUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        bussinessUrl = "http://" + bussinessUrl;
      }
    }
    // Image is okay, check the post types

    var pstTypeNamesArray = [];
    for (var key in req.body) {
      if (key.startsWith("PostType_")) {
        var pstTypeName = key;
        pstTypeName = pstTypeName.replace("PostType_", "");
        pstTypeNamesArray.push(pstTypeName);
      }
    }

    var pstTypeNames = pstTypeNamesArray.join();

    Profile.findByPk(profileId)
      .then(profile => {
        const userId = profile.ssuserId;
        profile.update(
            imgUrl
              ? {
                  name: name,
                  goal: goal,
                  bussinessUrl: bussinessUrl,
                  postalCode: postalCode,
                  keyWords: keyWords,
                  description: description,
                  profileImage: imgUrl,
                  visible: "true",
                  isDelete:"false",
                  postTypes: pstTypeNames
                }
              : {
                  name: name,
                  goal: goal,
                  bussinessUrl: bussinessUrl,
                  postalCode: postalCode,
                  keyWords: keyWords,
                  description: description,
                  visible: "true",
                  isDelete:"false",
                  postTypes: pstTypeNames
                },
            { where: profileId }
          )
          .then(updatedProfile => {
            Credential.findAll({where: {id:credentialId}}).then(attachedCredential => {
            const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);              
            profile.addCredential(attachedCredential, {through : {id: randId} }).then(() => {                         
            if (pstTypeNamesArray.length > 0) {
              pstTypeNamesArray.forEach(eachPostType => {
                Post.findAll({where: { profileId: profile.id, postTypes: eachPostType }}).then(findPost => {                    
                  if (isEmpty(findPost)) {
                      const randId = Math.floor(
                        Math.random() * (10000 - 1 + 1) + 1
                      );
                      draftPostImg = "/images/one-acorn.jpg";
                      Post.create({
                        id: randId,
                        postThumnail: draftPostImg,
                        draftPost: "true",
                        isActive: "true",
                        postTypes: eachPostType
                      }).then(post => {
                          User.findByPk(userId).then(user => {
                              user.addPost(post).then(() => {
                                  profile.addPost(post).then(() => {
                                      Group.findByPk(updatedProfile.ssgroupId)
                                        .then(group => {
                                          group
                                            .addPost(post)
                                            .then(() => {
                                              console.log(
                                                "Successfully associated post to group"
                                              );
                                            })
                                            .catch(err => {
                                              console.log(
                                                "Error when associating post to group",
                                                err
                                              );
                                            });
                                        })
                                        .catch(err => {
                                          console.log(
                                            "Error when finding group to associate post",
                                            err
                                          );
                                        });
                                    })
                                    .catch(err => {
                                      console.log(
                                        "Error when post adding the profil",
                                        err
                                      );
                                    });
                                })
                                .catch(err => {
                                  console.log(
                                    "Error when post adding the user",
                                    err
                                  );
                                });
                            })
                            .catch(err => {
                              console.log("Error when finding the user", err);
                            });
                        })
                        .catch(err => {
                          console.log("Error when creating the post", err);
                        });
                    } else {
                      console.log("Already created for profile");
                    }
                  })
                  .catch(err => {
                    console.log("Error when finding post with profile id", err);
                  });
              });
            }
            
            User.findByPk(userId).then(user => {
              profile.getCredentials({ through:{ where: {profileId: profileId}}}).then(attachedCredential =>{       
                var shareLink =
                  "http://" + req.headers.host + "/view-post/" + profile.id;
                const title = "ProfilePreview";
                var profiledetail = "yes";
                req.flash(
                  "profileSuccessMessage",
                  "Profile Updated Successfully!"
                );
                res.render("profilePreview", {
                  title: title,
                  profileSuccessMessage: req.flash("profileSuccessMessage"),
                  user: user,
                  userId: userId,                 
                  attachedCredential: attachedCredential,
                  profiledetail: profiledetail,
                  profile: profile,                 
                  shareLink: shareLink
                });
              })
              .catch(err => {
                console.log("Error when edit profile ", err);
              });
            }).catch(err => {
            console.log("Error when update the profile", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
        }).catch(err =>{
          console.log("Error while attaching the credential to the profile", err);
        });
      })
        }).catch(err => {
          console.log("Unable to add profile to the credential", err);
        });
      })
      .catch(err => {
        console.log("Error when profile the profile", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.PostInactiveProfile = (req, res, next) => {
    const profileId = req.params.profileId;
    const userId = req.params.userId;
    Profile.findByPk(profileId)
      .then(profile => {
        const userId = profile.ssuserId;
        profile
          .update({ isDelete: "true" }, { where: { profileId: profileId } })
          .then(updatedProfile => {
            
            res.redirect("/account/" + userId)
          })
          .catch(err => {
            console.log("Error when active/inactive profile ", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Error while retrieving profile ", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.isVisibleProfile = (req, res, next) => {
    const profileId = req.params.profileId;
    const userId = req.params.userId;
    const isVisible = req.params.val;

    Profile.findByPk(profileId)
      .then(profile => {
        profile
          .update({ visible: isVisible }, { where: [{ profileId: profileId },{ssuserId:userId}] })
          .then(updatedProfile => {
            
            res.redirect("/account/" + userId)
          })
          .catch(err => {
            console.log("Error when active/inactive profile ", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Error while retrieving profile ", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.getCreateProfile = (req, res, next) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    console.log(groupId);
    User.findByPk(userId).then(user => {
        PostType.findAll().then(postTypes => {          
          Credential.findAll({ where: {isCredentialAcquired: true}}).then(userCredentials => {                    
            title = "Create Profile - " + user.email;
            res.render("create-profile-form", {
              title: title,
              userId: userId,
              groupId:groupId,  
              userCredentials:userCredentials,           
              posttypes: postTypes
            });
          })
          .catch(err => {
            console.log("Unable to find any post types  ");
            console.log(err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
        })
      })
      .catch(err => {
        console.log("Unable to find user  ", userId);
        console.log(err);
        res.render("index", { errMessage: err, successMessage: "" });
      });    
  };

  module.postCreateProfile = (req, res, next) => {
    const userId = req.body.userId;
    const name = req.body.Name;
    const goal = req.body.Goal;
    const credentialId = req.body.credentialId;
    var bussinessUrl = req.body.BussinessUrl;
    const postalCode = req.body.PostalCode;
    const keyWords = req.body.Keywords;
    const description = req.body.Desc;
    var grpId = req.body.GroupID;
    var imgObject = req.files.find(file => file.fieldname === "image");
    console.log("imgObject : ", imgObject);   

    if (imgObject === undefined) {
      var imgUrl = "/images/one-acorn.jpg";
    } else {
      var imgUrl = "/" + imgObject.path;
    }
    // Image is okay, check the post types

    if (typeof bussinessUrl === "undefined" || bussinessUrl.length <= 0) {
      bussinessUrl = null;
    } else {
      if (!bussinessUrl.match(/^(http|https):\/\/[^ "]+$/)) {
        bussinessUrl = "http://" + bussinessUrl;
      }
    }

    if(grpId.length > 0){
          var profileGroupId = grpId;
         console.log("select profile group id",profileGroupId);
        }else{
        var profileGroupId = null;
    }
      

    var pstTypeNamesArray = [];
    for (var key in req.body) {
      if (key.startsWith("PostType_")) {
        var pstTypeName = key;
        pstTypeName = pstTypeName.replace("PostType_", "");
        pstTypeNamesArray.push(pstTypeName);
      }
    }
    var pstTypeNames = pstTypeNamesArray.join();

    const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);

    Profile.create({
      id: randId,
      name: name,
      goal: goal,
      bussinessUrl: bussinessUrl,
      postalCode: postalCode,
      keyWords: keyWords,
      description: description,
      profileImage: imgUrl,
      visible: "true",
      isDelete:"false",
      isDraft: "false",
      ssgroupId: profileGroupId,
      postTypes: pstTypeNames
    }).then(profile => {
        User.findByPk(userId).then(user => {
            const title = "ProfilePreview";
            user.addProfile(profile).then(() => {1
              Credential.findAll({where: {id:credentialId}}).then(attachedCredential => { 
                const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);              
                profile.addCredential(attachedCredential, {through : {id: randId} }).then(() => {
                if (pstTypeNamesArray.length > 0) {
                  pstTypeNamesArray.forEach(eachPostType => {
                    const randId2 = Math.floor(
                      Math.random() * (10000 - 1 + 1) + 1
                    );
                    draftPostImg = "/images/one-acorn.jpg";
                    Post.create({
                      id: randId2,
                      postThumnail: draftPostImg,
                      draftPost: "true",
                      isActive : "true",
                      ssgroupId: profile.ssgroupId,
                      postTypes: eachPostType
                    }).then(post => {
                        user.addPost(post).then(() => {
                            profile.addPost(post).then(() => {})
                              .catch(err => {
                                console.log(
                                  "Error when creating the profile",
                                  err
                                );
                              });
                          })
                          .catch(err => {
                            console.log("Error when post adding the user", err);
                          });
                      })
                      .catch(err => {
                        console.log("Error when creating the post", err);
                      });
                  });
                }
                var shareLink =
                  "http://" + req.headers.host + "/view-post/" + profile.id;
                console.log("Share link is ", shareLink);
                req.flash(
                  "profileSuccessMessage",
                  "Profile Saved Successfully!"
                );
                var profiledetail = "yes";
                res.render("profilePreview", {
                  title: title,
                  profileSuccessMessage: req.flash("profileSuccessMessage"),
                  user: user,
                  userId: userId,                 
                  attachedCredential:attachedCredential,
                  profiledetail: profiledetail,                  
                  profile: profile,
                  shareLink: shareLink
                });
              }).catch(err =>{
                console.log("Unable to add new profile for the user  ", userId);
                console.log(err);
                res.render("index", { errMessage: err, successMessage: "" });             
            })         
              .catch(err => {
                console.log("Unable to add  profile to the credential  ", profileId);
                console.log(err);
                res.render("index", { errMessage: err, successMessage: "" });
              });
          })
          .catch(err => {
            // Unable to find user
            console.log("Unable to find user  ", userId);
            console.log(err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
        })
      })
      .catch(err => {
        // Unable to create new post
        console.log("Unable to create new profile with name ", name);
        res.render("index", { errMessage: err, successMessage: "" });
      });
    })
  };

  return module;
};
