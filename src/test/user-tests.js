const bcrypt = require('bcryptjs');
const chai = require('chai');
var expect  = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


var request = require('request');
const { match, stub, mock, spy} = require('sinon');
const proxyquire = require('proxyquire');

const homeUrl = 'http://localhost:3000/index'; 

var SequelizeMock = require('sequelize-mock');
var dbMock = new SequelizeMock();

describe("User Login", function() {
    const passwrd = "hello";
    const email = "kathleen.webb@gmail.com";

    context('login with valid user credentials', () => {
        var encryptedPswd = bcrypt.hashSync(passwrd, 10);
        var User = dbMock.define('ssuser', {
            id: "1",
            email : email,
            password : encryptedPswd,
            isCoopMember: false,
            firstName: "Kathleen",
            lastName: "Webb",
            address: "",
            activationToken: null,
            activationTokenExpiration: null,
            isActivated: true
        }, {
            instanceMethods: {
                getProfiles: function () {
                    var noProfiles = [];
                    return Promise.resolve(noProfiles);
                }
            },
            
        });

        User.$useHandler(function(query, queryOptions, done) {
            if (query === 'findOne') {
                if (queryOptions[0].where.email === email) {
                    // Result found, return it
                    return User.build({ id: 1, email: email });
                } else {
                    // No results
                    return null;
                }
            }
        });
        
        const userExports = proxyquire('../controllers/users', { '../util/database': {User}});

        let req = {
            body : {
                Email : "kathleen.webb@gmail.com1",
                Password: passwrd
            },
            session : {
                isLoggedIn : false,
                save : function(){}
            },
            session : spy()
        } 
        let next = {};
        
        let res = {
            render : function(path, params){}
        }

        it('logged in successfully with correct user email and password', () => {

        const result = userExports.postLogin(req, res, next);

        expect(Promise.resolve(result)).to.eventually.equal("Login successful");

        //expect(result).to.equal(true);
        // expect(req.status).to.equal(200);

          // build how we expect it t work
       // mockRes.expects("render").once().withArgs('account');

        });
    });
});

/* Server ready */
/*describe ('Home Page', function() {
    it('status', function(done){
        request(homeUrl , function(error, response, body) {
            console.log(error);
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

});
*/


/* Login */

/*describe('Home Page', function() {
    describe ('Main page', function() {
        it('status', function(done){
            request(endpoint, function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

        it('content', function(done) {
            request(endpoint , function(error, response, body) {
                expect(body).to.equal('Hello World');
                done();
            });
        });
    });

    describe ('About page', function() {
        it('status', function(done){
            request(endpoint, function(error, response, body) {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });

    });
});*/