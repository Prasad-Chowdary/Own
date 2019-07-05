const Sequelize = require('sequelize');

module.exports  = (sequelize) => {
    return sequelize.define('ssgroup', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    ownerId: {
        type: Sequelize.INTEGER,
        allowNull : false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull : false
    },
    tradename:{
        type: Sequelize.STRING,
        allowNull : true
    },
    description: {
        type: Sequelize.TEXT,
        allowNull : false
    },    
    webSiteURL: {
        type: Sequelize.STRING,
        allowNull : true 
    },
    postalCode: {
        type: Sequelize.STRING,
        allowNull : true  
    },
    groupImage: {
        type: Sequelize.STRING,
        allowNull : true 
    },
    groupType: {
        type: Sequelize.STRING,
        allowNull : true   
    },
    groupJoinCriteria: {
        type: Sequelize.STRING,
        allowNull : false     
    },
    draftgroup:{
        type: Sequelize.BOOLEAN,
        allowNull:false
    }
});
}