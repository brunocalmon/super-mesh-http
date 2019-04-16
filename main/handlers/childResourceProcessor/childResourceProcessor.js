"use-strict";

const {
  pathOfList,
  isNilOrEmpty,
  match,
  forEach,
  head,
  last,
  replace,
  defaultToBlank
} = require("./../../utils/utilFunctions");

const { getRegex, zipParentAliasesWithValue } = require("../utilProcessor");

module.exports = (childResourceUrl, parents) => {
  const hasRegex = match(getRegex(), childResourceUrl);
  if (isNilOrEmpty(hasRegex)) {
    return childResourceUrl;
  }

  const zippedParentsInfo = zipParentAliasesWithValue(childResourceUrl);
  let resource = childResourceUrl;

  const mountFromValue = value => {
    const pattern = head(value);
    const pathToValue = last(value);
    const trueValue = pathOfList(parents, pathToValue);
    resource = replace(pattern, trueValue, resource);
  };

  forEach(mountFromValue, zippedParentsInfo);
  return defaultToBlank(resource);
};
