"use strict";

const { individuallyChildValuesProcessor } = require("../utilProcessor");
const { map, is } = require("./../../utils/utilFunctions");

module.exports = (body, parents) => {
  const newValues = mapValues(body, parents);
  return newValues;
};

const mapValues = (body, parents) => {
  const newMap = map(value => {
    if (is(Object, value)) {
      return mapValues(value, parents);
    } else {
      return process(value, parents);
    }
  }, body);
  return newMap;
};

const process = (value, parents) => {
  const processor = individuallyChildValuesProcessor(parents);
  const newValues = processor(value);
  return newValues;
};
