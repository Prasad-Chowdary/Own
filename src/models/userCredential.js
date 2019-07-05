const Sequelize = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("userCredential", {
        id: {
            type: Sequelize.INTEGER,
            autoincrement: true,
            allowNull: false,
            primaryKey: true
          },
          credentialName: {
            type: Sequelize.STRING,
            allowNull: true
          },
          credentialDescription: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          criteria: {
            type: Sequelize.STRING,
            allowNull: true
          },
          credentialImage: {
            type: Sequelize.STRING,
            allowNull: true
          },
          claimCode: {
            type: Sequelize.STRING,
            allowNull: true
          }       
        });
    };
    