"use-strict";

const { individuallyChildValuesProcessor } = require("../utilProcessor");

const {
  map,
} = require("./../../utils/utilFunctions");

module.exports = (headers, parents) => {
  const updateHeader = value => {
    return individuallyChildValuesProcessor(parents)(value);
  };

  const newHeaders = map(value => updateHeader(value), headers);
  return newHeaders;
};
