
module.exports = function (Group) {

    var module = {};
    const express = require('express');
    var flash = require('req-flash');
    var fs = require('fs');
    const Web3 = require('web3');
    const web3 = new Web3('https://ropsten.infura.io/v3/3946f70748184b12a73d2e36da4082ef');
    const app = new express();
    app.use(flash());

    const path = require('path');

    module.getCertificates = (req, res, next) => {
        // const name = req.body.name;
        // Post.findOne({where: { name: name}}).then(post => {
        //     post.attandees.array.forEach(attandee => {

        //     });

        // });
        // const groupId;
        // getGroupMembers(groupId)    
        console.log("Started getCertificates!");
        const groupId = req.params.groupId;
        console.log("groupId: " + groupId);
        const fileUrl = "/home/ipsg/Documents/skill-squirrel/cert-tools/sample_data/rosters/attandees.csv";
        var newLine = "\n";
        var delimiter = ",";
        var attandeesCsv = "name" + delimiter + "pubkey" + delimiter + "identity" + newLine;

        Group.findByPk(groupId).then(group => {
            var publicKey;
            var privateKey;
            group.getUsers().then(users => {
                users.forEach(user => {
                    const userId = user.id;
                    console.log("userId : " + userId);
                    var account = web3.eth.accounts.create();

                    publicKey = account.address;
                    privateKey = account.privateKey;
                    var userName = user.firstName + " " + user.lastName;
                    var userEmail = user.email;

                    console.log("publicKey : " + publicKey);
                    console.log("privateKey : " + privateKey);
                    console.log("userName : " + userName);
                    console.log("userEmail : " + userEmail);

                    var row = userName + delimiter + publicKey + delimiter + userEmail + newLine;
                    attandeesCsv = attandeesCsv + row;
                    user.update({
                        privateKey: privateKey,
                        publicKey: publicKey
                    }, { where: userId });
                });
                fs.writeFileSync(fileUrl, attandeesCsv);
                console.log("Done with writing attandees file");
                const cmd = require('child_process');
                cmd.execSync('bash /home/ipsg/Documents/skill-squirrel/issueUnsignedCertficates.sh');
                var copyUnsignedCertsCmd = "cp /home/ipsg/Documents/skill-squirrel/cert-tools/sample_data/unsigned_certificates /home/ipsg/Documents/certs/cert-issuer/data/";
                cmd.execSync(copyUnsignedCertsCmd);
                console.log("Done with copying unsigned certs");
                cmd.execSync('cert-issuer -c conf_ethtest.ini', {
                    cwd: '/home/ipsg/Documents/certs/cert-issuer'
                });
                console.log("Done with issuing signed certs");

                const path = require('path');
                //joining path of directory 
                const directoryPath = path.join(__dirname, '/home/ipsg/Documents/certs/cert-issuer/data/blockchain_certificates');
                //passsing directoryPath and callback function
                fs.readdir(directoryPath, function (err, files) {
                    //handling error
                    if (err) {
                        return console.log('Unable to scan directory: ' + err);
                    }
                    //listing all files using forEach
                    files.forEach(function (file) {
                        var certificate = JSON.parse(file);
                        var email = certificate.recipient.identity; // get email id from recipient
                        const randId = Math.floor(Math.random() * (10000 - 1 + 1) + 1);
                        users.findOne({ where: {email: email} }).then(user => {
                          Credentail.create({
                                id: randId,
                                pubKey: publicKey,
                                privateKey: privateKey,
                                credentail: file
                            }).then( credentail => {
                                user.addCredentail(credentail);
                                credentail.addPost(group.getPosts().get(0));
                            })
                        })

                    });
                });
                // cmd.execSync('cp /home/ipsg/Documents/certs/cert-issuer/data/blockchain_certificates/*.json /home/ipsg/Documents/skill-squirrel/certificates');
                console.log("Done with copying signed certs");
                console.log("Done getCertificates !");
            });
        }).catch(err => {
            console.log("Error occurred in certificate controllers", err);
        });
        res.render('index', {errMessage : err, successMessage: ''});
    };

    return module;

};