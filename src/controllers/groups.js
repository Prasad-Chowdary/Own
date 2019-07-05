module.exports = function (User, Group, Profile, Credential) {
  var module = {};
  const express = require("express");
  var flash = require("req-flash");
  var moment = require("moment");
  var fs = require("fs");
  const csv = require("csv-parser");
  const bcrypt = require("bcryptjs");
  const certificates = require("./certificates");
  const nodemailer = require('nodemailer');
  const {
    SENDGRID_API_KEY
  } = require("../configs/config");
  const sendgridTransport = require('nodemailer-sendgrid-transport');
  const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: SENDGRID_API_KEY
    }
  }));

  const app = new express();
  app.use(flash());

  module.getShowGroups = (req, res, next) => {
    const userId = req.params.userId;

    User.findByPk(userId)
      .then(user => {
        user.getGroups({through: {where: { isMember: true }},
            order: ["createdAt"]
          }).then(groups => {
            Group.findAll().then(allGroups => {
                Profile.findAll().then(allProfiles => {
                  title = "groups -" + user.email;
                  res.render("group", {
                    previousPage: req.params.discover,
                    title: title,
                    userId: userId,
                    user: user,
                    groups: groups,
                    allProfiles: allProfiles,
                    allGroups: allGroups
                  });
                })
              })
              .catch(err => {
                console.log(err);
                res.render('index', {
                  errMessage: err,
                  successMessage: ''
                });
              });
          })
          .catch(err => {
            console.log(err);
            res.render('index', {
              errMessage: err,
              successMessage: ''
            });
          });
      })
      .catch(err => {
        console.log("Unable to find user  ", userId);
        console.log(err);
        res.render('index', {
          errMessage: err,
          successMessage: ''
        });
      });
  };

  module.getManageGroup = (req, res, next) => {
    const groupId = req.params.groupId;

    console.log(groupId);

    Group.findByPk(groupId)
      .then(group => {
        if (group === undefined || group === null) {
          // No such group,
          console.log("No such group with id  ", groupId);
        } else {
          const userId = group.ownerId;
          console.log(userId);
          group
            .getUsers()
            .then(groupUsers => {
              res.render("manageGroup", {
                title: "GroupManage",
                welcome: "",
                moment: moment,
                groupUsers: groupUsers,
                userId: userId,
                group: group
              });
            })
            .catch(err => {
              console.log("Error finding all users accociated with group", err);
              res.redirect("/index");
            });
        }
      })
      .catch(err => {
        console.log("Unable to find group ", groupId);
        console.log(err);
        res.redirect("/index");
      });
  };

  module.postManageGroupMemebers = (req, res, next) => {
    const uploadfile = req.files.find(file => file.fieldname === "image");
    const groupId = req.params.groupId;
    const firstName = req.body.Firstname;
    const lastName = req.body.Lastname;
    const email = req.body.Email;

    console.log(firstName, lastName);

    if (uploadfile === undefined || uploadfile === null) {
      User.findOne({
          where: {
            firstName: firstName,
            lastName: lastName,
            email: email
          }
        })
        .then(user => {
          if (!user) {
            Group.findByPk(groupId)
              .then(group => {
                const userId = group.ownerId;
                console.log("User not available with given data");
                res.redirect("/group/" + userId);
              })
              .catch(err => {
                console.log("Error where finding group", err);
                res.redirect("/index");
              });
          } else {
            Group.findByPk(groupId)
              .then(group => {
                const userId = group.ownerId;
                const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
                group
                  .addUser(user, {
                    through: {
                      id: randId,
                      isMember: true
                    }
                  })
                  .then(() => {
                    console.log(
                      "Association created for group with user successfully"
                    );
                    const randId2 = Math.floor(
                      Math.random() * (10000 - 1 + 1) + 1
                    );
                    Profile.create({
                        id: randId2,
                        name: group.name,
                        goal: group.description,
                        bussinessUrl: group.webSiteURL,
                        postalCode: group.postalCode,
                        keyWords: group.name,
                        description: group.description,
                        profileImage: group.groupImage,
                        ssgroupId: group.id,
                        visible: "false",
                        isDraft: "false",
                        isDelete: "false",
                        postTypes: "Event"
                      })
                      .then(profile => {
                        user
                          .addProfile(profile)
                          .then(() => {
                            console.log("Created draft profile successfully");
                            res.redirect("/manage-group/" + groupId);
                          })
                          .catch(err => {
                            // TODO Redirect to home page if there errors
                            console.log(
                              "Error while adding draft profile to user account",
                              err
                            );
                            res.redirect("/index");
                          });
                      })
                      .catch(err => {
                        // TODO Redirect to home page if there errors
                        console.log("Error creating draft profile", err);
                        res.redirect("/index");
                      });
                    // res.redirect('/group/'+userId);
                  })
                  .catch(err => {
                    console.log("Error associating group with the users", err);
                    res.redirect("/index");
                  });
              })
              .catch(err => {
                console.log("Error where finding group", err);
                res.redirect("/index");
              });
          }
        })
        .catch(err => {
          console.log("Error where finding user with first and last name", err);
          res.redirect("/index");
        });
    } else {
      var fileUrl = uploadfile.path;
      var count = 1;
      var allUser = [];
      var isMember = true;
      var issueCertificate = false;
      console.log("information about groupId", groupId);

      fs.createReadStream(fileUrl)
        .pipe(csv())
        .on("data", row => {
          companyName = row.companyName;
          User.findOne({
              where: {
                email: row.email
              }
            })
            .then(user => {
              allUser.push(row.email);
              if (!user) {
                console.log("User not available so creating guest");
                const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
                hashedPswd = bcrypt.hashSync("Guest" + randId, 10);
                User.create({
                  firstName: row.firstName,
                  lastName: row.lastName,
                  id: randId,
                  email: row.email,
                  password: hashedPswd,
                  isCoopMember: false,
                  activationToken: null,
                  activationTokenExpiration: null,
                  isActivated: false,
                  isGuest: true
                }).then(gUser => {
                  createDraftProfileAndAssignCertificates(Group, Profile, User, Credential, groupId, gUser, allUser, count, res, isMember, issueCertificate);
                  count++;
                });
              } else {
                createDraftProfileAndAssignCertificates(Group, Profile, User, Credential, groupId, user, allUser, count, res, isMember, issueCertificate);
                count++;
              }
            })
            .catch(err => {
              console.log("Error where finding user with email", err);
              res.redirect("/index");
            });
        })
        .on("end", () => {
          console.log("CSV file successfully Read all uploaded user email");
        });
    }
  };

  module.getCreateGroup = (req, res, next) => {
    const ownerUserId = req.params.userId;
    res.render("create-group", {
      userId: ownerUserId
    });
  };

  module.postCreateGroup = (req, res, next) => {
    const name = req.body.Name;
    const tradename = req.body.TradeName;
    const userId = req.body.userId;
    var webSiteURL = req.body.webSiteURL;
    const postalCode = req.body.PostalCode;
    var imgObject = req.files.find(file => file.fieldname === "image");
    const description = req.body.description;
    const groupType = req.body.groupType;
    const groupJoinCriteria = req.body.groupJoinCriteria;
    const draftgroup = "true";

    if (imgObject === undefined) {
      var imgUrl = "/images/two-acorn.png";
    } else {
      var imgUrl = "/" + imgObject.path;
    }

    if (typeof webSiteURL === "undefined" || webSiteURL.length <= 0) {
      webSiteURL = null;
    } else {
      if (!webSiteURL.match(/^(http|https):\/\/[^ "]+$/)) {
        webSiteURL = 'http://' + webSiteURL;
      }
    }

    const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);

    Group.create({
        id: randId,
        ownerId: userId,
        name: name,
        tradename: tradename,
        webSiteURL: webSiteURL,
        postalCode: postalCode,
        description: description,
        groupType: groupType,
        groupImage: imgUrl,
        groupJoinCriteria: groupJoinCriteria,
        draftgroup: draftgroup
      })
      .then(group => {
        User.findByPk(userId)
          .then(user => {
            console.log("the user id is", userId);
            console.log("entered into the group");
            const title = "Groups";
            const randId2 = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
            draftProfileImg = "/images/one-acorn.jpg";
            group
              .addUser(user, {
                through: {
                  id: randId2,
                  isMember: true,
                  isParticipant: true
                }
              })
              .then(() => {
                Profile.create({
                    id: randId2,
                    profileImage: draftProfileImg,
                    visible: "true",
                    isDraft: "true",
                    isDelete: "false",
                    ssgroupId: randId,
                    postTypes: "Event"
                  })
                  .then(profile => {
                    user
                      .addProfile(profile)
                      .then(() => {
                        var shareLink =
                          "http://" +
                          req.headers.host +
                          "/view-group/" +
                          randId;
                        req.flash(
                          "groupSuccessMessage",
                          "Group Saved Successfully!"
                        );
                        res.render("groupPreview", {
                          userId: userId,
                          user: user,
                          groupSuccessMessage: req.flash("groupSuccessMessage"),
                          group: group,
                          randId: randId,
                          shareLink: shareLink,
                          error: "Succesfully saved the group",
                          title: "Groups list"
                        });
                      })
                      .catch(err => {
                        console.log(
                          " Error while creating draft profile for user in group",
                          err
                        );
                        res.render('index', {
                          errMessage: err,
                          successMessage: ''
                        });
                      });
                  })
                  .catch(err => {
                    console.log(
                      " Error while creating draft profile for group",
                      err
                    );
                    res.render('index', {
                      errMessage: err,
                      successMessage: ''
                    });
                  });
              })
              .catch(err => {
                console.log("Unable to add new group for the user  ", userId);
                console.log(err);
                res.render('index', {
                  errMessage: err,
                  successMessage: ''
                });
              });
          })
          .catch(err => {
            // Unable to find user
            console.log("Unable to find user  ", userId);
            console.log(err);
            res.render('index', {
              errMessage: err,
              successMessage: ''
            });
          });
      })
      .catch(err => {
        // Unable to create new group
        console.log("Unable to create new group with name ", name);
        console.log(err);
        res.render('index', {
          errMessage: err,
          successMessage: ''
        });
      });
  };

  module.getUserGroups = (req, res, next) => {
    const currUserId = req.params.userId;
    console.log("User id in getUserGroups is", currUserId);
    User.findByPk(currUserId)
      .then(user => {
        user.getGroups()
          .then(groups => {
            title = user.email + "-" + "Goups";
            res.render("group-list", {
              userId: currUserId,
              groups: groups,
              title: title
            });
          })
          .catch(err => {
            console.log(err);
            const errMsg = "Unable to get groups";
            res.render("group-list", {
              userId: currUserId,
              error: errMsg,
              title: errMsg
            });
          });
      })
      .catch(err => {
        console.log(err);
        const errMsg = "Uknown user";
        res.render("group-list", {
          userId: currUserId,
          error: errMsg,
          title: errMsg
        });
      });
  };

  module.getGroupDetails = (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    var groupUserArray = [];

    Group.findByPk(groupId)
      .then(grp => {
        if (grp === undefined || grp === null) {
          // No such group, redirect to
          console.log("No such group with id  ", groupId);
          console.log(err);
          //TODO : may be we should redirect to some other page -discuss
          res.render('index', {
            errMessage: err,
            successMessage: ''
          });
        } else {
          User.findByPk(userId)
            .then(user => {
              grp.getUsers({through: {where: { isMember: true }}
              }).then(groupUsers => {
                  groupUsers.forEach(gu => {
                    groupUserArray.push(parseInt(gu.id, 10));
                    if (groupUsers.length === groupUserArray.length) {
                      if (groupUserArray.includes(parseInt(userId, 10))) {
                        grp.getPosts().then(groupPosts => {
                          grp.getProfiles().then(groupProfiles => {
                            res.render("groupDetailsWithPosts", {
                              title: "Group-Details-Posts",
                              group: grp,
                              groupId: groupId,
                              userId: userId,
                              user: user,
                              groupProfiles: groupProfiles,
                              groupPosts: groupPosts
                            });
                          })

                        })
                      } else {
                        grp.getProfiles().then(groupProfiles => {
                          res.render("groupDetails", {
                            title: "Group-Details",
                            group: grp,
                            groupProfiles: groupProfiles,
                            groupId: groupId,
                            userId: userId,
                            user: user,
                            isAlreadyMemeber: "false"
                          })
                        });
                      }
                    }
                  });
                })
                .catch(err => {
                  console.log("Unable to find groupUsers  ", err);
                  console.log(err);
                  res.render('index', {
                    errMessage: err,
                    successMessage: ''
                  });
                });
            })
            .catch(err => {
              console.log("Unable to find user ", userId);
              console.log(err);
              res.render('index', {
                errMessage: err,
                successMessage: ''
              });
            });
          // Found a group object
        }
      })
      .catch(err => {
        console.log("Unable to find Group  ", groupId);
        console.log(err);
        res.render('index', {
          errMessage: err,
          successMessage: ''
        });
      });
  };

  module.joinGroupService = (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    Group.findByPk(groupId).then(grp => {
        // Get the Group
        User.findByPk(userId).then(user => {
            //Get the user
            const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
            grp.addUser(user, {
                through: {
                  id: randId,
                  isMember: true
                }
              }).then(() => {
                const randId2 = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
                draftProfileImg = "/images/one-acorn.jpg";
                Profile.create({
                    id: randId2,
                    profileImage: draftProfileImg,
                    ssgroupId: grp.id,
                    isDraft: "true",
                    visible: "true",
                    isDelete: "false",
                    postTypes: "Service"
                  })
                  .then(profile => {
                    user.addProfile(profile).then(() => {
                        grp.getProfiles().then(groupProfiles => {
                          grp.getPosts().then(groupPosts => {
                            console.log("Created draft profile successfully");
                            res.render("groupDetailsWithPosts", {
                              title: "Group-Details-Posts",
                              group: grp,
                              groupId: groupId,
                              groupProfiles: groupProfiles,
                              user:user,
                              userId: userId,
                              groupPosts: groupPosts
                            })
                          }).catch(err => {
                            // TODO Redirect to home page if there errors
                            console.log("Error when finding group posts", err);
                          });
                        }).catch(err => {
                          // TODO Redirect to home page if there errors
                          console.log("Error when finding group profiles", err);
                        });
                      })
                      .catch(err => {
                        // TODO Redirect to home page if there errors
                        console.log(
                          "Error while adding draft profile to user account",
                          err
                        );
                      });
                  })
                  .catch(err => {
                    // TODO Redirect to home page if there errors
                    console.log("Error creating draft profile", err);
                  });
              })
              .catch(err => {
                // TODO Redirect to home page if there errors
                console.log("Error associating User with the Group", err);
              });
          })
          .catch(err => {
            console.log("Error finding the user", err);
          });
      })
      .catch(err => {
        console.log("Error finding the group", err);
      });
  };

  module.getUpdateGroupDetails = (req, res, next) => {
    const ownerUserId = req.params.userId;
    const groupId = req.params.groupId;

    User.findByPk(ownerUserId)
      .then(user => {
        console.log("the user id is", user.id);
        Group.findByPk(groupId)
          .then(group => {
            const userId = group.ownerId;
            res.render("group-edit", {
              userId: userId,
              user: user,
              group: group,
              randId: groupId,
              title: "Edit Group"
            });
          })
          .catch(err => {
            console.log("Error where finding group", err);
            res.redirect("/index");
          });
      })
      .catch(err => {
        console.log("Error where finding User", err);
        res.redirect("/index");
      });
  };

  module.postUpdateGroupDetails = (req, res, next) => {
    const name = req.body.Name;
    const tradename = req.body.TradeName;
    const userId = req.body.userId;
    const groupId = req.params.groupId;
    var webSiteURL = req.body.webSiteURL;
    const postalCode = req.body.PostalCode;
    var imgObject = req.files.find(file => file.fieldname === "image");
    const description = req.body.description;
    const groupType = req.body.groupType;
    const groupJoinCriteria = req.body.groupJoinCriteria;
    const draftgroup = "true";

    if (imgObject) {
      var imgUrl = "/" + imgObject.path;
    }

    Group.update(
        imgUrl ?
        {
          name: name,
          tradename: tradename,
          webSiteURL: webSiteURL,
          postalCode: postalCode,
          description: description,
          groupType: groupType,
          groupImage: imgUrl,
          groupJoinCriteria: groupJoinCriteria,
          draftgroup: draftgroup
        } :
        {
          name: name,
          tradename: tradename,
          webSiteURL: webSiteURL,
          postalCode: postalCode,
          description: description,
          groupType: groupType,
          groupJoinCriteria: groupJoinCriteria,
          draftgroup: draftgroup
        }, {
          where: {
            id: groupId,
            ownerId: userId
          }
        }
      )
      .then(result => {
        console.log(result);
        Group.findByPk(groupId)
          .then(group => {
            User.findByPk(userId)
              .then(user => {
                console.log("the user id is", userId);
                console.log("entered into the group");
                var shareLink =
                  "http://" + req.headers.host + "/view-group/" + groupId;
                req.flash(
                  "groupUpdateSuccessMessage",
                  "Group Details Updated Successfully!"
                );
                res.render("groupPreview", {
                  userId: userId,
                  user: user,
                  groupSuccessMessage: req.flash("groupUpdateSuccessMessage"),
                  group: group,
                  randId: groupId,
                  shareLink: shareLink,
                  error: "Succesfully updated the group",
                  title: "Groups list"
                });
              })
              .catch(err => {
                // Unable to find user
                console.log("Unable to find user  ", groupId);
                console.log(err);
                res.render('index', {
                  errMessage: err,
                  successMessage: ''
                });
              });
          })
          .catch(err => {
            // Unable to find user
            console.log("Unable to find the group  ", userId);
            console.log(err);
            res.render('index', {
              errMessage: err,
              successMessage: ''
            });
          });
      })
      .catch(err => {
        // Unable to create new group
        console.log("Unable to create new group with name ", name);
        console.log(err);
        res.render('index', {
          errMessage: err,
          successMessage: ''
        });
      });
  };

  module.ContactGroupManager = (req, res, next) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    const from_mail = req.body.from_mail_id;
    const subject = req.body.subject;
    var mail_body = req.body.mail_body;
    const to_Id = req.body.to_id;

    User.findByPk(to_Id)
      .then(user => {
        console.log("the user id is", user);
        var to_mail = user.email;
        if (from_mail && to_mail && mail_body) {
          var email_body = `
          <p><h4> Hi ${user.firstName+' '+user.lastName},
          </h4> <p>${mail_body}
          <p>Thank you.</p>
          `;
          transporter.sendMail({
            to: to_mail,
            from: from_mail,
            subject: subject,
            // html: 'Hi '+user.firstName+' '+user.lastName+', \n'+mail_body
            html: email_body
          }, (err, info) => {
            if (err) throw err;
            console.log(info);
            req.flash(
              "successMessage",
              "Email sent Successfully to " + user.firstName + " " + user.lastName
            );
            return res.send({
              info: info,
              flashMessage: req.flash("successMessage")
            });
          });
        }
      })
      .catch(err => {
        // Unable to find user
        console.log("Unable to find user  ", groupId);
        console.log(err);
        res.render('index', {
          errMessage: err,
          successMessage: ''
        });
      });
  };

  module.postManageGroupEventAttendees = (req, res, next) => {
    const uploadfile = req.files.find(file => file.fieldname === "image");
    const groupId = req.params.groupId;
    if (uploadfile !== undefined) {
      var fileUrl = uploadfile.path;
      var count = 1;
      var allUser = [];
      var isMember = false;
      var issueCertificate = true;
      console.log("information about groupId", groupId);

      fs.createReadStream(fileUrl)
        .pipe(csv())
        .on("data", row => {
          companyName = row.companyName;
          User.findOne({
              where: {
                email: row.email
              }
            })
            .then(user => {
              allUser.push(row.email);
              if (!user) {
                console.log("User not available so creating guest");
                const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
                hashedPswd = bcrypt.hashSync("Guest" + randId, 10);
                User.create({
                  firstName: row.firstName,
                  lastName: row.lastName,
                  id: randId,
                  email: row.email,
                  password: hashedPswd,
                  isCoopMember: false,
                  activationToken: null,
                  activationTokenExpiration: null,
                  isActivated: false,
                  isGuest: true
                }).then(gUser => {
                  createDraftProfileAndAssignCertificates(Group, Profile, User, Credential, groupId, gUser, allUser, count, res, isMember, issueCertificate);
                  count++;
                });
              } else {
                createDraftProfileAndAssignCertificates(Group, Profile, User, Credential, groupId, user, allUser, count, res, isMember, issueCertificate);
                count++;
              }
            })
            .catch(err => {
              console.log("Error where finding user with email", err);
              res.redirect("/index");
            });
        })
        .on("end", () => {
          console.log("CSV file successfully Read all uploaded user email");
        });

    } else {
      console.log("file must not be empty", err);
      res.render('index', {
        errMessage: 'uploaded file must not be empty',
        successMessage: ''
      });
    }
  };


  return module;
};

var {
  finalConfig
} = require("../configs/config");

async function populateCertificates(group, User, Credential, isParticipant, isMember) {
  console.log("Started issuing Certificates!");
  var groupId = group.id;
  const Web3 = require('web3');
  const web3 = new Web3('https://ropsten.infura.io/v3/3946f70748184b12a73d2e36da4082ef');
  const fileUrl = finalConfig.certsPaths.pathToRostersAttandeesFile;
  var newLine = "\n";
  var delimiter = ",";
  var attandeesCsv = "name" + delimiter + "pubkey" + delimiter + "identity" + newLine;
  var fs = require('fs');

  await group.getPosts().then(posts => {
    posts.forEach(post => {
      const template = post.postCertificateTemplate;
      fs.writeFileSync(finalConfig.certsPaths.pathToCertTemplate, template);
    })
  })

  group.getUsers({
    through: {
      where: { isParticipant: isParticipant,
         isMember: isMember }
    }
  }).then(users => {
    var keysMap = new Map();

    users.forEach(user => {
      const userId = user.id;
      var account = web3.eth.accounts.create();

      var publicKey = account.address;
      var privateKey = account.privateKey;
      var userName = user.firstName + " " + user.lastName;
      var userEmail = user.email;

      keysMap.set(userEmail, [publicKey, privateKey]);
      var row = userName + delimiter + publicKey + delimiter + userEmail + newLine;
      attandeesCsv = attandeesCsv + row;
    });

    fs.writeFileSync(fileUrl, attandeesCsv);
    const cmd = require('child_process');

    var bashCmdToIssueUnsignedCertficates = "bash " + finalConfig.certsPaths.pathToSkillSquirrelCodebase + "/sh/issueUnsignedCertficates.sh";
    cmd.execSync(bashCmdToIssueUnsignedCertficates);
    var copyUnsignedCertsCmd = "cp " + finalConfig.certsPaths.pathToCertToolsUnsignedCertsFolder + "/*.json " + finalConfig.certsPaths.pathToCertIssuerUnsignedCertsFolder;
    cmd.execSync(copyUnsignedCertsCmd);
    var bashCmdToIssueBlockChainCertficates = "bash " + finalConfig.certsPaths.pathToSkillSquirrelCodebase + "/sh/issueBlockChainCertficates.sh";
    cmd.execSync(bashCmdToIssueBlockChainCertficates);

    var dirPath = finalConfig.certsPaths.pathToCertIssuerBlockchainCertsFolder;
    fs.readdir(dirPath, function (err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
        if (file.endsWith('.json')) {
          var filePath = dirPath + file;
          var file = fs.readFileSync(filePath, 'utf-8');
          var certificate = JSON.parse(file);
          var email = certificate.recipient.identity;
          const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
          var keys = keysMap.get(email);
          User.findOne({
            where: {
              email: email
            }
          }).then(user => {
            Credential.create({
              id: randId,
              pubKey: keys[0],
              privateKey: keys[1],
              isCredentialAcquired: "false",
              credential: file.toString()
            }).then(credential => {
              user.addCredential(credential);
              group.getPosts().then(posts => {
                posts.forEach(post => {
                  post.addCredential(credential);
                })
              });
            });
          });
        }
      });

      // Delete file after use
      var rmUnsignedCertsInToolCmd = "rm -rf " + finalConfig.certsPaths.pathToCertToolsUnsignedCertsFolder + "/*.json ";
      cmd.execSync(rmUnsignedCertsInToolCmd);

      var rmUnsignedCertsInIssuerCmd = "rm -rf " + finalConfig.certsPaths.pathToCertIssuerUnsignedCertsFolder + "/*.json ";
      cmd.execSync(rmUnsignedCertsInIssuerCmd);

      var rmCertsInIssuerCmd = "rm -rf " + finalConfig.certsPaths.pathToCertIssuerBlockchainCertsFolder + "/*.json ";
      cmd.execSync(rmCertsInIssuerCmd);

      var rmCertTemplateCmd = "rm -rf " + finalConfig.certsPaths.pathToCertTemplate;
      cmd.execSync(rmCertTemplateCmd);

      console.log("Done with deleting files after use !!!");
    });
    console.log("Done with issuing signed certs");
  });
}

var createDraftProfileAndAssignCertificates = function (Group, Profile, User, Credential, groupId, user, allUser, count, res, isMember, issueCertificate) {
  var isparticipant = false;
  var ismember = false;
  if (isMember) {
    ismember = isMember
    isparticipant = false;
  } else {
    ismember = false
    isparticipant = true;
  }
  Group.findByPk(groupId)
    .then(group => {
      const randId = Math.floor(
        Math.random() * (10000 - 1 + 1) + 1
      );
      group.addUser(user, {
        through: {
          id: randId,
          isMember: ismember,
          isParticipant: isparticipant
        }
      })
      .then(() => {
          console.log("Association created for group with user successfully :");
          const randId2 = Math.floor(
            Math.random() * (10000 - 1 + 1) + 1
          );
          console.log("count length... " + count, "  user length..." + allUser.length);
          if (count == allUser.length) {
            /* Memebers should have member ship certificates, present there is no mechanism
              to create a template for mermber ship credential. this is not associated to any post.
              Fix this in later version*/
            if (issueCertificate) {
              populateCertificates(group, User, Credential, isparticipant, ismember);
            }
            res.redirect("/manage-group/" + groupId);
          }
        }).catch(err => {
          console.log("Error associating group with the users", err);
          res.redirect("/index");
        });
    }).catch(err => {
      console.log("Error where finding group", err);
      res.redirect("/index");
    });
}