"use strict";

const winston = require("winston");
const { createLogger, format } = winston;
const dateFormat = require("dateformat");
const profile = require("./profile");
const { path, equals, isNilOrEmpty } = require("./utilFunctions");

const logAsJson = winston.format(info => {
  const logContent = {
    date: dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss.l"),
    application: path(process, "env", "npm_package_name"),
    environment: profile.profileName(),
    tid: "",
    log_level: path(info, "level"),
    thread_name: "",
    class: "",
    log_message: path(info, "message"),
    version: `${path(process, "env", "npm_config_init_version")}`
  };

  return logContent;
});

const createElasticFile = () => {
  return new winston.transports.File({
    zippedArchive: false,
    format: format.combine(logAsJson(), format.json()),
    filename: getLogPath(),
    maxsize: 10485760,
    maxFiles: 5
  });
};

const getLogPath = () => {
  const pathDir = isNilOrEmpty(path(process, "env", "LOG_FILE_PATH"))
    ? "."
    : path(process, "env", "LOG_FILE_PATH");
  const name = "supermeshhttp.log";
  return pathDir + "/" + name;
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
  return equals(path(process, "env", "SUPER_MESH_HTTP_LOG_ENABLED"), "true");
};

module.exports = {
  info,
  warn,
  error
};
