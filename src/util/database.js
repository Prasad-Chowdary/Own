const Sequelize = require('sequelize');

var {finalConfig} = require("../configs/config"); //importing DB configuration

const sequelize = new Sequelize(finalConfig.DB.DBName,finalConfig.DB.userName, finalConfig.DB.password, {
    dialect: finalConfig.DB.dialect,
    host: finalConfig.DB.host
});

const User = require('../models/user')(sequelize);
const Group = require('../models/group')(sequelize);
const Post =  require('../models/post')(sequelize);
const UserGroup = require('../models/user-group')(sequelize);
const ProfileCredential = require('../models/profile-Credential')(sequelize);
const Profile = require('../models/profile')(sequelize);
const PostType = require('../models/post-type')(sequelize);
const PostFiles = require('../models/post-files')(sequelize);
const Credential = require('../models/credential')(sequelize);
const UserCredential = require('../models/userCredential')(sequelize);

// Relationships
User.belongsToMany(Group, {through: UserGroup, as : 'Groups'});
Group.belongsToMany(User, {through: UserGroup, as : 'Users'});
Profile.hasMany(Post,{foreignKey:'profileId',sourceKey:'id'});
Post.belongsTo(Profile,{foreignKey:'profileId',sourceKey:'id'});
Post.belongsTo(User);
// Post.hasMany(User, {as:"attandees"});
User.hasMany(Post);
User.hasMany(UserCredential);
User.hasMany(Profile);
Group.hasMany(Profile);
Group.hasMany(Post);
Post.hasMany(PostFiles);
PostFiles.belongsTo(Post);
User.hasMany(Credential);
Post.hasMany(Credential);
Credential.belongsTo(User);
Credential.belongsTo(Post);
Group.hasMany(UserCredential);
UserCredential.belongsTo(Group);
Post.belongsTo(UserCredential);
Credential.belongsToMany(Profile, {through: ProfileCredential, as : 'Profiles'});
Profile.belongsToMany(Credential, {through: ProfileCredential, as : 'Credentials'});
module.exports = {sequelize, User, Group, Post, Profile, PostType, PostFiles, Credential,UserCredential};