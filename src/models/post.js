const Sequelize = require("sequelize");

module.exports = sequelize => {
  return sequelize.define("post", {
    id: {
      type: Sequelize.INTEGER,
      autoincrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    postDescription: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    postalCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    promotionType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    postThumnail: {
      type: Sequelize.STRING,
      allowNull: true
    },
    eventUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    fromDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    toDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    rentalRate: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    rentalRules: {
      type: Sequelize.STRING,
      allowNull: true
    },
    rentalPolicy: {
      type: Sequelize.STRING,
      allowNull: true
    },
    eventEnrollmentLimit: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    eventPrice: {
      type: Sequelize.STRING,
      allowNull: true
    },
    webPageUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    hashTag: {
      type: Sequelize.STRING,
      allowNull: true
    },
    jobPostingUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    reserveTicketUrl: {
      type: Sequelize.STRING,
      allowNull: true
    },
    advisoryType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    advisoryCompensation: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    advisoryQuestion1: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    advisoryQuestion2: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    advisoryQuestion3: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    draftPost: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    directMessage: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    postPromotion: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    postTypes: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true
    },
    address2: {
      type: Sequelize.STRING,
      allowNull: true
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true
    },
    province: {
      type: Sequelize.STRING,
      allowNull: true
    },
    country: {
      type: Sequelize.STRING,
      allowNull: true
    },
    paymentTerms: {
      type: Sequelize.STRING,
      allowNull: true
    },
   
    credentialSkill: {
      type: Sequelize.STRING,
      allowNull: true
    },
    credentialOffer: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    expirationDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    postCertificateTemplate: {
      type: Sequelize.BLOB("long"),
      allowNull: true
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  });
};
