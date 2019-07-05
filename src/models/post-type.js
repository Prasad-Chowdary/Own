const Sequelize = require('sequelize');

module.exports =  (sequelize) => {
    return sequelize.define('postType', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull : false
    }
});
}
