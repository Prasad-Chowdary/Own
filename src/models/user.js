const Sequelize = require('sequelize');

module.exports  = (sequelize) => {
    return sequelize.define('ssuser', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull : false
    },
    password:  {
        type: Sequelize.STRING,
        allowNull : false
    },
    isCoopMember: {
        type: Sequelize.BOOLEAN,
        allowNull : false
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    address: Sequelize.STRING,
    activationToken: Sequelize.STRING,
    activationTokenExpiration: Sequelize.DATE,
    isActivated: Sequelize.BOOLEAN,
    isGuest: Sequelize.BOOLEAN
});
}