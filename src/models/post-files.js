const Sequelize = require('sequelize');

module.exports =  (sequelize) => {
    return sequelize.define('postFiles', {
        id: {
            type: Sequelize.INTEGER,
            autoincrement: true,
            allowNull : false,
            primaryKey: true
        },
        postId: {
            type: Sequelize.INTEGER,
            allowNull : false,
        },
        gallery: {
            type: Sequelize.STRING,
            allowNull : true
        }
});
}
