// requires
const _ = require("lodash");

// Environment Setup Begin

// module variables
const config = require("./config.json");
const multer = require('multer');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || "development";
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig); //it recursively merges own and inherited enumerable string keyed properties of source objects into the destination object.

// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;

console.log(
    finalConfig
);
// Environment Setup End

const GOOGLE_RECAPTCHA_SITE_KEY = finalConfig.GOOGLE_RECAPTCHA_SITE_KEY;
// const GOOGLE_RECAPTCHA_SECRET_KEY = "6Ld7_J0UAAAAAORvffMYL8gDqUsWcz1nzvFQGeij";

//Here 2 different Captch secret keys are used, please validate which one is used.
const GOOGLE_RECAPTCHA_SECRET_KEY_get_SignUP =
  finalConfig.GOOGLE_RECAPTCHA_SECRET_KEY_get_SignUP; // used to pass in routes/signUp
const GOOGLE_RECAPTCHA_SECRET_KEY_Verfication =
  finalConfig.GOOGLE_RECAPTCHA_SECRET_KEY_Verfication; //verification Secret key
const SENDGRID_API_KEY = finalConfig.SENDGRID_API_KEY;

var Recaptcha = require("express-recaptcha").RecaptchaV3;
var recaptcha = new Recaptcha(
  GOOGLE_RECAPTCHA_SITE_KEY,
  //   GOOGLE_RECAPTCHA_SECRET_KEY
  GOOGLE_RECAPTCHA_SECRET_KEY_get_SignUP,
  { callback: "cb" }
);

//File storage and files upload configurations
const fileStorage = multer.diskStorage({
  destination : (req, file, cb) => {
      cb(null, finalConfig.FilesToSave);
  },
  filename : (req, file, cb) => {
      cb(null, new Date().getTime() + "-" + file.originalname);
  }

});

//configuration of file types to  upload
const imgFileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'text/csv' || file.mimetype ==='text/xlsx'||file.mimetype ==='application/vnd.ms-excel'){
      cb(null, true);
  }
  else{
      cb(null, false);
  }
}

module.exports = {
  finalConfig,
  GOOGLE_RECAPTCHA_SITE_KEY,
  GOOGLE_RECAPTCHA_SECRET_KEY_get_SignUP,
  GOOGLE_RECAPTCHA_SECRET_KEY_Verfication,
  Recaptcha,
  recaptcha,
  SENDGRID_API_KEY,
  fileStorage,
  imgFileFilter
};
