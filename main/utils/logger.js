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
  const path = process.env.LOG_FILE_PATH === undefined ? "." : process.env.LOG_FILE_PATH;
  const name = process.env.LOG_FILE_PATH === undefined ? "supermeshhttp.log" : process.env.LOG_FILE_NAME;
  return path + "/" + name;
};

const createConsole = () => {
  return new winston.transports.Console({
    format: format.combine(format.colorize(), format.simple())
  });
};

const mountTransports = () => {
  const transports = [];

    transports.push(createConsole());
    transports.push(createElasticFile());
  return transports;
};

const logger = createLogger({
      level: "info",
      transports: mountTransports()
    });

const info = (message, ...optionalParams) => {
  if (logEnabled()) {
    logger.info(message, optionalParams);
  }
};

const warn = (message, ...optionalParams) => {
  if (logEnabled()) {
    logger.warn(message, optionalParams);
  }
};

const error = (message, ...optionalParams) => {
  if (logEnabled()) {
    logger.error(message, optionalParams);
  }
};

const logEnabled = () => {
  return process.env.SUPER_MESH_HTTP_LOG_ENABLED === "true" || profile.isNotProduction()
}

module.exports = {
  info,
  warn,
  error
};
