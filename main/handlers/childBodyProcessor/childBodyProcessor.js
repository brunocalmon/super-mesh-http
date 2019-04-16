"use-strict";

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


// const {
//   map,
//   match,
//   isNilOrEmpty,
//   forEachObjIndexed,
//   replace,
//   path,
//   defaultToMap
// } = require("../../../../utils/utilFunctions");

// const { getRegex, zipParentAliasesWithValue } = require("../utilProcessor");

// module.exports = (bodyPattern, parents) => {
//   return map(processBodyPattern(parents), bodyPattern);
// };

// const processBodyPattern = parents => childValue => {
//   const regexValue = match(getRegex(), childValue);

//   if (isNilOrEmpty(regexValue)) {
//     return childValue;
//   }

//   const zippedParentsInfo = zipParentAliasesWithValue(childValue);
//   var value = childValue;

//   const mountFromValue = (key, value) => {
//     value = replace(key, path(parents, value), value);
//   };

//   forEachObjIndexed(mountFromValue, zippedParentsInfo);
//   return defaultToMap(value);
// };
