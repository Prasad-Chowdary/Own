const log4js = require("log4js");
var {finalConfig} = require("../configs/config");

log4js.configure({
  // configure to use all types in different files.
  appenders: {
    logError: { type: "file", filename: finalConfig.logFile.errorFile },
    logInfo: { type: "file", filename: finalConfig.logFile.infoFile },
    logDebug: { type: "file", filename: finalConfig.logFile.debugFile }
  },
  categories: {
    error: { appenders: ["logError"], level: "error" },
    default: { appenders: ["logInfo"], level: "info" },
    debug: { appenders: ["logDebug"], level: "debug" }
  }
});

var loggerInfo = log4js.getLogger("info");
var loggerError = log4js.getLogger("error"); 
var loggerDebug = log4js.getLogger("debug"); 

module.exports = {
  loggerInfo,
  loggerError,
  loggerDebug
};
