"use-strict";

exports.isProduction = () => {
  return (
    process.env.npm_config_production == "true" &&
    process.env.npm_config_production === "true"
  );
};

exports.isNotProduction = () => {
  return (
    process.env.npm_config_production != "true" &&
    process.env.npm_config_production !== "true"
  );
};

exports.profileName = () => {
  if (
    process.env.npm_config_production == "true" &&
    process.env.npm_config_production === "true"
  ) {
    return "production";
  }

  if (
    process.env.npm_config_dev == "true" &&
    process.env.npm_config_dev === "true"
  ) {
    return "development";
  }

  return "test";
};
