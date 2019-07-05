const Sequelize = require('sequelize');

module.exports  = (sequelize) => {
    return sequelize.define('credential', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    pubKey: {
        type: Sequelize.STRING,
        allowNull : false
    },
    privateKey: {
        type: Sequelize.STRING,
        allowNull : false
    },
    credential: {
        type: Sequelize.BLOB("long"),
        allowNull : false 
    },
    isCredentialAcquired: Sequelize.BOOLEAN
});
}
