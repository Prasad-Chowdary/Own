const Sequelize = require('sequelize');

module.exports  = (sequelize) => {
    return sequelize.define('userGroup', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        allowNull : false,
        primaryKey: true
    },
    isMember: Sequelize.BOOLEAN,
    isParticipant: Sequelize.BOOLEAN
});
}
