"use strict";

const { path, equals, not } = require("./utilFunctions");

exports.isProduction = () => {
  return equals(path(process, "env", "NODE_ENV"), "prod");
};

exports.isNotProduction = () => {
  return not(equals(path(process, "env", "NODE_ENV"), "prod"));
};

exports.profileName = () => {
  if (equals(path(process, "env", "NODE_ENV"), "prod")) {
    return "production";
  }

  if (equals(path(process, "env", "NODE_ENV"), "dev")) {
    return "development";
  }

  return "test";
};
