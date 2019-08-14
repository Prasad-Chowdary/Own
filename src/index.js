
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const redis = require('redis');

// environment variables by WI
process.env.NODE_ENV = 'development';

// config variables
const {finalConfig,fileStorage,imgFileFilter} = require('./configs/config');

var client = redis.createClient(finalConfig.redisData.port, finalConfig.redisData.host);

const redisSessionStore = require('express-sessions')({
    storage: finalConfig.redisData.storage,
    instance: client, // optional
    host: finalConfig.redisData.host, // optional
    port: finalConfig.redisData.port, // optional
    collection: finalConfig.redisData.collection, // optional
    expire: finalConfig.redisData.expire // optional
});

const {sequelize, User, Group, Post, Profile, PostType, PostFiles, Credential, UserCredential} = require('./util/database');

const rootDir = require('./util/path');
const createPostTypes = require('./util/seeddatacreator')(PostType);

const app = new express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended : false,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
// app.use(multer({storage  : fileStorage, fileFilter : imgFileFilter}).single('image'));
app.use(multer({storage  : fileStorage, fileFilter : imgFileFilter}).any()); // any() supports multiple image uploads

app.use(express.static(path.join(rootDir, 'public')));
app.use(session({secret : 'Skill Squirrel enhaces users ability to network in their ecosystem',
    resave: false, saveUninitialized : false, store: redisSessionStore}));
app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use('/data', express.static(path.join(rootDir, 'data')));

// Routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user')(User);
const groupRoutes = require('./routes/group')(User,Group, Profile, Credential);
const postRoutes = require('./routes/post')(User,Post, Profile,Group,PostFiles,Credential,UserCredential);
const profileRoutes = require('./routes/profile')(User,Profile, PostType,Post,Group,Credential);
// const certificateRoutes = require('./controllers/certificates')(Group);
const credentialsRoutes = require('./routes/credentials')(User,Post,Credential,UserCredential,Group);

app.use('/admin', adminRoutes);
app.use(userRoutes);
app.use(groupRoutes);
app.use(postRoutes);
app.use(profileRoutes);
// app.use(certificateRoutes);
app.use(credentialsRoutes);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});
 

// Application constants
var postTypeNames = ["Service","Rental","Event","Advisory","Training"];

// Do the sync

  sequelize.sync({force : true}).then(result => {
 //   sequelize.sync().then(result => {
        return PostType.findAll();   
    }).then(postTypes => {
        console.log("Found SOME post types 1 ");
        if(!postTypes){
            return createPostTypes(postTypeNames);
        }
        else if(postTypes.length == 0){
            return createPostTypes(postTypeNames);
        }
        return postTypes;
    }).then(postTypes => {
        console.log("Found SOME post types 2");
        // app.listen(3000);
        // console.log("Started server on port 3000");
        app.listen(global.gConfig.node_port, () => {
            console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
        });
    })
    .catch(err => {
        console.log(err);
    });