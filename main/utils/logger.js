"use strict";

const winston = require("winston");
const { createLogger, format } = winston;
const dateFormat = require("dateformat");
const profile = require("./profile");

const logAsJson = winston.format(info => {
  const logContent = {
    date: dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss.l"),
    application: process.env.npm_package_name,
    environment: profile.profileName(),
    tid: "",
    log_level: info.level,
    thread_name: "",
    class: "",
    log_message: info.message,
    version: `${process.env.npm_config_init_version}`
  };

  return logContent;
});

const createElasticFile = () => {
  return new winston.transports.File({
    zippedArchive: true,
    format: format.combine(logAsJson(), format.json()),
    filename: getLogPath(),
    maxsize: 10485760,
    maxFiles: 5
  });
};

const getLogPath = () => {
  if (profile.profileName() === "test") {
    return process.env.PWD;
  }
  return process.env.LOG_FILE_PATH + process.env.LOG_FILE_NAME;
};

const createConsole = () => {
  return new winston.transports.Console({
    format: format.combine(format.colorize(), format.simple())
  });
};

const mountTransports = () => {
  const transports = [];

  if (profile.isNotProduction()) {
    transports.push(createConsole());
  }
  transports.push(createElasticFile());

  return transports;
};

const logger = createLogger({
  level: "info",
  transports: mountTransports()
});

const info = (message, ...optionalParams) => {
  logger.info(message, optionalParams);
};

const warn = (message, ...optionalParams) => {
  logger.warn(message, optionalParams);
};

const error = (message, ...optionalParams) => {
  logger.error(message, optionalParams);
};

module.exports = {
  info,
  warn,
  error
};
