module.exports = function(User, Post, Credential, UserCredential, Group) {
  var module = {};
  var fs = require("fs");

  module.getCreateCredentials = (req, res, next) => {
    const userId = req.params.userId;
    User.findByPk(userId)
      .then(user => {
        user
          .getCredentials()
          .then(credentials => {
            user
              .getGroups()
              .then(groups => {
                user.getUserCredentials().then(userCreateCredentials => {
                  res.render("credentials", {
                    userId: userId,
                    credentials: credentials,
                    user: user,
                    userCreateCredentials: userCreateCredentials,
                    groups: groups
                  });
                });
              })
              .catch(err => {
                console.log(
                  "Error while getting the groups for user in credential",
                  err
                );
                res.render("index", { errMessage: err, successMessage: "" });
              });
          })
          .catch(err => {
            console.log("Error while getting the cretificates", err);
            res.render("index", { errMessage: err, successMessage: "" });
          });
      })
      .catch(err => {
        console.log("Error while finding user", err);
        res.render("index", { errMessage: err, successMessage: "" });
      });
  };

  module.createCredential = (req, res, next) => {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    res.render("create-credential", { userId, userId, groupId: groupId });
  };

  module.postcreateCredential = (req, res, next) => {
    const userId = req.params.userId;
    const credentialName = req.body.CredentialName;
    const credentialDescription = req.body.CredentialDescription;
    const criteria = req.body.Criteria;
    const claimCode = req.body.ClaimCode;
    const groupId = req.params.groupId;
    const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
    var imgObject = req.files.find(file => file.fieldname === "image");
    console.log("imgObject : ", imgObject, credentialName);
    if (imgObject === undefined) {
      var imgUrl = "/images/one-acorn.jpg";
    } else {
      var imgUrl = "/" + imgObject.path;
    }

    UserCredential.create({
      id: randId,
      credentialName: credentialName,
      credentialDescription: credentialDescription,
      criteria: criteria,
      credentialImage: imgUrl,
      claimCode: claimCode
    }).then(credential => {
      Group.findByPk(groupId)
        .then(group => {
          User.findByPk(userId)
            .then(user => {
              user
                .addUserCredential(credential)
                .then(() => {
                  group.addUserCredential(credential).then(() => {
                    res.redirect("/credentials/" + userId);
                  });
                })
                .catch(err => {
                  console.log(
                    "Unable to add new crdential for the group  ",
                    userId
                  );
                  console.log(err);
                  res.render("index", { errMessage: err, successMessage: "" });
                });
            })
            .catch(err => {
              console.log("Unable to find user  ", userId, err);
              res.render("index", { errMessage: err, successMessage: "" });
            });
        })
        .catch();
    });
  };

  module.showCertificate = (req, res, next) => {
    const userId = req.params.userId;
    const postId = req.params.postId;
    User.findByPk(userId)
      .then(user => {
        Post.findByPk(postId)
          .then(post => {
            Credential.findOne({ where: { ssuserId: userId, postId: postId } })
              .then(credential => {
                const jsonCredential = JSON.parse(credential.credential);
                post
                  .getUserCredential()
                  .then(attachedCredential => {
                    res.render("dispalyCertificate", {
                      certificateData: jsonCredential,
                      user: user,
                      post: post,
                      attachedCredential: attachedCredential,
                      credential: credential
                    });
                  })
                  .catch(err => {
                    console.log("While finding attachedcredential", err);
                    res.redirect("/home/" + userId);
                  });
              })
              .catch(err => {
                console.log("While finding credential", err);
                res.redirect("/home/" + userId);
              });
          })
          .catch(err => {
            console.log("While finding post", err);
            res.redirect("/home/" + userId);
          });
      })
      .catch(err => {
        res.redirect("/index");
      });
  };

  module.getCredential = (req, res, next) => {
    const userId = req.params.userId;
    const credentialId = req.params.credentialId;
    User.findByPk(userId)
      .then(user => {
        Credential.findByPk(credentialId)
          .then(credential => {
            var shareLink =
              "http://" +
              req.headers.host +
              "/credential-view" +
              credential.id +
              "/" +
              userId;
            const jsonCredential = JSON.parse(credential.credential);
            res.render("credentialView", {
              certificateData: jsonCredential,
              userId: userId,
              user: user,
              shareLink: shareLink,
              credential: credential
            });
          })
          .catch(err => {
            res.redirect("/home/" + userId);
          });
      })
      .catch(err => {
        res.redirect("/index");
      });
  };

  module.getManageCredential = (req, res, next) => {
    const userId = req.params.userId;
    const createdCredentialId = req.params.credentialId;
    User.findByPk(userId)
      .then(user => {
        UserCredential.findByPk(createdCredentialId)
          .then(createdCredential => {
            var shareLink =
              "http://" +
              req.headers.host +
              "/credential-view" +
              createdCredential.id +
              "/" +
              userId;
            res.render("credentialView", {
              userId: userId,
              user: user,
              certificateData: null,
              shareLink: shareLink,
              getCredentialLink: "",
              createdCredential: createdCredential
            });
          })
          .catch(err => {
            console.log("While finding credentials", err);
            res.redirect("/home/" + userId);
          });
      })
      .catch(err => {
        console.log("While finding users", err);
        res.redirect("/home/" + userId);
      });
  };

  module.postManageCredential = (req, res, next) => {
    const userId = req.params.userId;
    const createdCredentialId = req.params.credentialId;
    const claimcode = req.body.claimcode;
    User.findByPk(userId)
      .then(user => {
        UserCredential.findByPk(createdCredentialId)
          .then(getCredential => {
            getCredential
              .update({
                claimCode: claimcode
              })
              .then(createdCredential => {
                if (claimcode.length > 0) {
                  console.log("claim code ******", claimcode);
                  getCredentialLink =
                    "http://" +
                    req.headers.host +
                    "/show-certificate/" +
                    userId;
                  res.render("credentialView", {
                    userId: userId,
                    user: user,
                    certificateData: null,
                    shareLink: "",
                    getCredentialLink: getCredentialLink,
                    createdCredential: createdCredential
                  });
                } else {
                  console.log("claim code ******", claimcode);
                  res.render("credentialView", {
                    userId: userId,
                    user: user,
                    certificateData: null,
                    shareLink: "",
                    getCredentialLink: "",
                    createdCredential: createdCredential
                  });
                }
              })
              .catch(err => {
                console.log("While updating  claimcode credential", err);
                res.redirect("/home/" + userId);
              });
          })
          .catch(err => {
            console.log("While finding credentials", err);
            res.redirect("/home/" + userId);
          });
      })
      .catch(err => {
        console.log("While finding users", err);
        res.redirect("/home/" + userId);
      });
  };

  module.getupdateCredential = (req, res, next) => {
    const userId = req.params.userId;
    const credentialId = req.params.credentialId;

    Credential.findOne({ where: { ssuserId: userId, id: credentialId } }).then(
      credential => {
        credential
          .update({
            isCredentialAcquired: "true"
          })
          .then(() => {
            res.redirect("/credentials/" + userId);
          });
      }
    );
  };

  // module.getCertificateVerified = (req, res, next) => {
  //   var userId = req.params.userId;
  //   var postId = req.params.postId;
  //   var jsonData = [
  //     {
  //       name: "Checking certificate has not been tampered with",
  //       status: "passed"
  //     },
  //     { name: "Checking certificate has not expired", status: "passed" },
  //     { name: "Checking not revoked by issuer", status: "passed" },
  //     { name: "Checking authenticity", status: "passed" },
  //     { name: "Validation", status: "passed" }
  //   ];

  //   User.findByPk(userId)
  //     .then(user => {
  //       Post.findByPk(postId)
  //         .then(post => {
  //           Credential.findOne({ where: { ssuserId: userId, postId: postId } })
  //             .then(credential => {
  //               const jsonCredential = JSON.parse(credential.credential);
  //               post
  //                 .getUserCredential()
  //                 .then(attachedCredential => {
  //                   // res.render("dispalyCertificate", {
  //                   //   certificateData: jsonCredential,
  //                   //   user: user,
  //                   //   post: post,
  //                   //   attachedCredential: attachedCredential,
  //                   //   credential: credential,
  //                   //   jsonReponse:jsonData
  //                   // });
  //                   res.send(jsonData);

  //                 })
  //                 .catch(err => {
  //                   console.log("While finding attachedcredential", err);
  //                   res.redirect("/home/" + userId);
  //                 });
  //             })
  //             .catch(err => {
  //               console.log("While finding credential", err);
  //               res.redirect("/home/" + userId);
  //             });
  //         })
  //         .catch(err => {
  //           console.log("While finding post", err);
  //           res.redirect("/home/" + userId);
  //         });
  //     })
  //     .catch(err => {
  //       res.redirect("/index");
  //     });
  // };

  module.verifyCredentials = (req, res, next) => {
    var certificateData = JSON.parse(req.body.certificateData);
    var { finalConfig } = require("../configs/config");
    const cmd = require("child_process");
    // Write credentail to cert-verifier to make it available for verification
    fs.writeFileSync(finalConfig.certsPaths.pathToValidCredential, credential);
    var bashCmdToVerifyCertficates =
      "bash " +
      finalConfig.certsPaths.pathToSkillSquirrelCodebase +
      "/sh/verifyCredential.sh";
    // Run commands that trigger verification process and genarate report
    cmd.execSync(bashCmdToVerifyCertficates);
    // Read report from cert-verifier
    var report = fs.readFileSync(
      finalConfig.certsPaths.pathToCredentialVerificationReport
    );
    let match = report.toString().match(/\[(.+)\]/);
    var rmCredentialVerificationReportCmd =
      "rm -rf " + finalConfig.certsPaths.pathToCredentialVerificationReport;
    // Remove reports from cert-verifier after use
    cmd.execSync(rmCredentialVerificationReportCmd);
    // Return the matched JSON in the report
    return match[0];
  };

  return module;
};

/*
 * Takes the credential issued on ethereum blockchain as argument and verifies it and returns the report in json format.
 * An example report looks like below:
 *
 * [
 *       {'name': 'Checking certificate has not been tampered with', 'status': 'passed'},
 *       {'name': 'Checking certificate has not expired', 'status': 'passed'},
 *       {'name': 'Checking not revoked by issuer', 'status': 'passed'},
 *       {'name': 'Checking authenticity', 'status': 'passed'},
 *       {'name': 'Validation', 'status': 'passed'}
 * ]
 *
 */
function verifyCredentials(credential) {
  var { finalConfig } = require("../configs/config");
  const cmd = require("child_process");
  // Write credentail to cert-verifier to make it available for verification
  fs.writeFileSync(finalConfig.certsPaths.pathToValidCredential, credential);
  var bashCmdToVerifyCertficates =
    "bash " +
    finalConfig.certsPaths.pathToSkillSquirrelCodebase +
    "/sh/verifyCredential.sh";
  // Run commands that trigger verification process and genarate report
  cmd.execSync(bashCmdToVerifyCertficates);
  // Read report from cert-verifier
  var report = fs.readFileSync(
    finalConfig.certsPaths.pathToCredentialVerificationReport
  );
  let match = report.toString().match(/\[(.+)\]/);
  var rmCredentialVerificationReportCmd =
    "rm -rf " + finalConfig.certsPaths.pathToCredentialVerificationReport;
  // Remove reports from cert-verifier after use
  cmd.execSync(rmCredentialVerificationReportCmd);
  // Return the matched JSON in the report
  return match[0];
}
