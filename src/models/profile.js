const Sequelize = require('sequelize');

module.exports =  (sequelize) => {
    return sequelize.define('profile', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull : true
    },
    goal: {
        type: Sequelize.TEXT,
        allowNull : true
    },
    bussinessUrl: {
        type: Sequelize.STRING,
        allowNull : true
    },
    postalCode: {
        type: Sequelize.STRING,
        allowNull : true
    },
    keyWords: {
        type: Sequelize.STRING,
        allowNull : true
    },    
    description: {
        type: Sequelize.TEXT,
        allowNull : true
    },  
    profileImage: {
        type: Sequelize.STRING,
        allowNull : true
    },
    postTypes: {
        type: Sequelize.STRING,
        allowNull : false
    },
    visible:{
        type: Sequelize.BOOLEAN,
        allowNull : false
    },
    isDraft:{
        type: Sequelize.BOOLEAN,
        allowNull : false
    },
    isDelete:{
        type: Sequelize.BOOLEAN,
        allowNull : false
    }
});
}
