const Sequelize = require('sequelize');

module.exports  = (sequelize) => {
    return sequelize.define('profileCredential', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },   
});
}
