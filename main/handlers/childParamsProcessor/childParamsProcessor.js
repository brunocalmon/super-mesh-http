"use strict";

const { individuallyChildValuesProcessor } = require("../utilProcessor");

const { map, is } = require("./../../utils/utilFunctions");

module.exports = (params, parents) => {
  return mapParams(params, parents);
};

const mapParams = (params, parents) => {
  return map(param => {
    if (is(Object, param)) {
      return mapParams(param, parents);
    } else {
      return process(param, parents);
    }
  }, params);
};

const process = (param, parents) => {
  return individuallyChildValuesProcessor(parents)(param);
};
