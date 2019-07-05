# SKILL SQUIRREL

SkillSquirrel allows for certification tracking and verification for communities on the blockchain. The current version uses blockcerts 
on the Ethereum network.

Skill Squirrel has two components:
1. A web application that allows users to create and join and participate in community activity
2. A blockchain component that serves as the interface to issue and verify blockchain based certificates.

The web application uses the service of the blockchain component to manage and issue the certificates.

TBD : 
1. The web application and the blockchain component will eventually be available as microservices hosted in their own container. This
environment will be facilitated through Docker. The goal is to enable loosely coupled components and also to bring in Continuous Integration and Continous Delivery (CI / CD)  processes in the future.


# SKILL SQUIRREL WEB APPLICATION

The Skill Squirrel web application adopts the MVC (Model - View - Controller) pattern. The application root folder
contains the models, views, controllers and routers and also the starting point of the application, index.js. The 
index.js file contains all the configuration and set up of various libraries and APIs that are needed by the application.

When a URL with a specific is accessed by the user, routers are used to direct the request to a corresponding action defined
in a controller for that purpose. The controller performs the business logic and re-directs the flow to the required view.

Express JS is used facilitate the web framework.

## Routers

Routers are located in the routes folder under the application root folder. Each file under the routes folder is responsible for a specific group of functionality. For example,
user.js specifies routes for any functionality related to users (logging in, logging out, signing up, etc.)

The following statement 
```
router.post('/login', usersController.postLogin);
```

handles the condition when the user is attempting to log in with an email and password. The request is directed to the postLogin() method defined in the user-related controller.

## Models

Models are located in the models folder under the application root folder. Each file under the models folder defines an entity in the application. For example, user.js defines
the User entity.

Entities (models) and the relationship among them are facilitated through the sequelize API. The sequelize library provides the ORM (Object Relational Modelling) functionality that
helps in defining models and their relationships and consistent persistence of the models in relational databases. Skill Squirrel uses MySQL as the relational data store.

The relationships among the models (one-to-one, one-many, etc.) are defined in the database.js file in the util folder.

For example, the statement
```
Profile.hasMany(Post);
```

specifies that a Post object has associated with a Profile object (and also that a Profile object can be associated with several Post objects).

## Controllers
Controllers are located in the controllers folder under the application root folder. Each file under the controller folder defines functionalities related to featuers logically grouped 
together. For example, the logic of logging in, logging out, signing up, etc. are related to users interacting with the application and are therefore grouped together into the user.js
controller. Each feature is implemented with the business logic and read/persist operations with the underlying data store. Note that there are NO DAOs (Data access objects)implemented.
Instead, the controller performs the interaction with the database and also the business logic. Based on the conditions, the controller redirects to a specified view.

A specific action in a controller is triggered by the one more more router and is associated with a path via that router.

For example
```
router.post('/create-profile/:userId', isAuth, profilesController.postCreateProfile);
```

triggers the postCreateProfile() method or action in the profiles controller when the user navigates to http://domain/create-profile/1234 

## Views

Several templating engine options are available to enable views. In Skill Squirrel, the EJS templating engine is used. The EJS files are very similar to HTML. However, some basic
and simple control flow can be implemented (to iterate over a list for example) and values can be passed from the controller to the views it redirects to. In Skill Squirrel, the
views are located under the views folder.

The EJS templating engine is "wired" to the Express framework via this statement in the index.js file:
```
app.set('view engine', 'ejs');
```
where app denotes the Express application.

Usage of the EJS template helps in "passing values" from the controller to the views through objects controlled by the Express application:
```
res.render('index', {errMessage : errMessage, successMessage: ''});
```
The above statement in the controller fowards the values errMessage and successMessage to the view named index.
Thus, in the corresponding view index.js these values are accessible via the <% and %> syntax:

```
	  <% if(successMessage != undefined || sucessMessage != null) {%>
            <p><font size="2" color="green"><b><%= successMessage %></b></font></p>
          <% }%>
          <% if(errMessage != undefined || errMessage != null) {%>
                <p><font size="2" color="red"><b><%= errMessage %></b></font></p>
          <% }%>
```
		  
# EXTERNAL LIBRARIES USED

The Skill Squirrel web application uses several third libraries for various features like sending emails, multipart form submission, etc. 

## Session storage
For fast queries and caching session information, the in-memory data storage utility, Redis (https://redis.io/) is used. The goal is
to store session related information in Redis which will be running as a service or daemon at runtime. Moreover, to enable sessions in
the Express JS application, we need to use the express-session library.

Note: At runtime, we will need a running instance of Redis. By default, the Redis service is tied to port 6379.

The session variables will then stored in the Redis data store. Redis is wired into Express session as follows (from index.js):

```
var client = redis.createClient(6379, 'localhost');

const redisSessionStore = require('express-sessions')({
    storage: 'redis',
    instance: client, // optional
    host: 'localhost', // optional
    port: 6379, // optional
    collection: 'sessions', // optional
    expire: 86400 // optional
});
```



## Password encryption
 
Passwords specified by users at the time of logging in are stored in the database in an encrypted format. For this purpose, the bcrypt library is used (https://www.npmjs.com/package/bcrypt).

The following Promise-based statement creates a unique hash of the given password:
```
bcrypt.hash(pswd, 10).then(hashedPswd => ....).catch(err => {...})
```
Where the salt value we use is fixed at 10.

Comparing the user-entered password at the time of logging in is a simple Promise-based comparison:
```
bcrypt.compare(pswd, user.password).then(matchedResult => {...}.catch(err => {....})
```

## Enabling Captcha

Currently, Captha is implemented through Google's Recaptcha API Version 3. This version of Recaptcha identified bots and other suspicious clients unobtrusively without the user
having to enter alphanumeric values from pictures nor having to click "I am not a robot" checkbox. 

A site key and secret key first need to be generated from the following location by specifying the domains for which need protection:

https://www.google.com/recaptcha/admin

Captchas are currently present only in the Sign up page, but can be configured to support any other page we think might need protection from bots. In the page that needs protection,
we can include the script that enables display of the Captcha (displayed in the bottom right corner of the page) and a callback function that is invoked when the Recaptcha is triggered.

The call back function can be used to populate the response back from the Recaptcha API into a hidden variable that is later when the user submits the form. This response is used
again the siteverify API of Recaptcha to get a score that gives an indication of the level of confidence, a number between 0 and 1.0 that the client is not a bot. In this 
web application, we use a confidence of 0.7.

## Additional security
Other than encrypting passwords and enabling captchas, the following security measures will be included:

1. SQL injection (TBD)
2. Cross-site request forgery CSRF attacks (To be implemented)
3. SSL certificates (To be implemented)

## Multipart form submission

Users may upload images and other files associated with their profiles, posts or groups that form part of their assets. Uploaded files are stored under the assets folder in the root folder.

To facilitate upload of files with form submission, the multer library (https://www.npmjs.com/package/multer) is used. 

Multer is "wired" to the Express JS framework via the following statement in index.js:
```
app.use(multer({storage  : fileStorage, fileFilter : imgFileFilter}).single('image'));
```
The imgFileFilter specifies what type of files users may upload:
```
const imgFileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}
```
The fileStorage value specifies the destination location on the server and the filenames that will ought to be used upon upload:
```
const fileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'assets');
    },
    filename : (req, file, cb) => {
        cb(null, new Date().getTime() + "-" + file.originalname);
    }

});
```

## Sending emails

Emails are sent to users with the help of the nodemailer library (https://nodemailer.com/about/).

We also use the SendGrid email server. (Note: currently, we use the free account on SendGrid that allows upto 100 free emails a day). 

NodeMailer allows several plugins to support various email service providers, including SendGrid. For SendGrid, we use the 
nodemailer-sendgrid-transport plugin library (https://www.npmjs.com/package/nodemailer-sendgrid-transport). Then nodemailer can be configured to
user the SendGrid email service as follows:

```
const transporter = nodemailer.createTransport(sendgridTransport({
    auth : {
        api_key : SENDGRID_API_KEY
    }
}));
```

and the transporter can be used to send emails using the Sendgrid email server:
```
transporter.sendEmail(...)
```

## Unit Testing
Unit testing in the web application will be limited to unit testing the controllers. As controllers mix business logic with database operations, utilities that mock database models are needed. The following tools are used for unit testing:

1. Proxyquire (for injecting mock objects in source code)
2. Chai (assertion library)
3. Mocha (unit testing framework)
4. Sinon (unit testing framework)

## Deployment


