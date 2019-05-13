"use strict";

const {
  toString,
  path,
  map,
  and,
  match,
  slice,
  splitArray,
  isNilOrEmpty,
  isNotNilOrEmpty,
  replace,
  pathOfList,
  forEachObjIndexed,
  mapObjIndexed,
  forEach,
  head,
  last,
  zip,
  assoc,
  dissoc,
  is,
  not,
  toPairs,
  flatten,
  uniq,
  filter,
  keys,
  length,
  contains,
  dropLast,
  append,
  equals,
  join,
  gt,
  assocPath
} = require("./../utils/utilFunctions");

const REGEX = /{_[a-zA-Z.\-_0-9]+_}/g;
exports.getRegex = () => REGEX;

const _zipParentAliasesWithValue = valueToExtract => {
  const variableCleaner = x => slice(2, x.length - 2, x);

  const parentVariables = match(REGEX, valueToExtract);
  const cleanedParentVariables = map(
    parentVariable => variableCleaner(parentVariable),
    parentVariables
  );

  const pathsToParentValues = map(
    parentAlias => splitArray(".", parentAlias),
    cleanedParentVariables
  );

  return zip(parentVariables, pathsToParentValues);
};

exports.zipParentAliasesWithValue = _zipParentAliasesWithValue;
exports.individuallyChildValuesProcessor = parents => childValue => {
  if (not(is(String, childValue))) {
    return childValue;
  }

  const hasValueRegex = match(REGEX, childValue);
  if (isNilOrEmpty(hasValueRegex)) {
    return childValue;
  }

  var dataValue = childValue;
  const mountFromValue = (key, value) => {
    const realValue = pathOfList(parents, last(key));
    if (is(String, realValue)) {
      dataValue = replace(head(key), realValue, dataValue);
    } else {
      dataValue = realValue;
    }
  };

  const zippedData = _zipParentAliasesWithValue(head(hasValueRegex));
  forEachObjIndexed(mountFromValue, zippedData);
  return dataValue;
};

exports.removeBlank = object => {
  return _removeBlank(object);
};

const _removeBlank = object => {
  let newObject = {};

  forEachObjIndexed((num, key) => {
    if (and(is(Object, num), is(Array, num))) {
      const array = map(n => {
        if (is(Object, n)) {
          return _removeBlank(n);
        }
        if (isNotNilOrEmpty(n)) {
          return n;
        }
      }, num);
      newObject = assoc(key, array, newObject);
    } else if (and(is(Object, num), not(is(Array, num)))) {
      const n = _removeBlank(num);
      newObject = assoc(key, n, newObject);
    } else if (isNotNilOrEmpty(num)) {
      newObject = assoc(key, num, newObject);
    }
  }, object);
  return newObject;
};

const toDeepPairs = object => {
  const queryPairs = toPairs(object);
  const pairedQuery = forEach(obj => {
    const isObj = is(Object, obj[1]);
    if (isObj) {
      obj[1] = toDeepPairs(obj[1]);
    }
  }, queryPairs);
  return pairedQuery;
};

const filterByRegex = values => {
  const flatted = flatten(values);
  const onlyRegex = map(flat => {
    const isString = is(String, flat);
    if (isString) {
      const regexList = match(REGEX, flat);
      return regexList;
    }
    return [];
  }, flatted);

  return flatten(filter(regex => isNotNilOrEmpty(regex), onlyRegex));
};

const zipRegexToPath = regexList => {
  return map(regex => head(_zipParentAliasesWithValue(regex)), regexList);
};

const discoverListsInObj = (obj, query) => zippedPaths => {
  const mapOfListPath = uniq(
    flatten(
      map(zipped => {
        return discoverList(obj, query, [])(zipped);
      }, zippedPaths)
    )
  );
  return filter(path => {
    return isNotNilOrEmpty(path);
  }, mapOfListPath);
};

const breadcrumbsSeeker = (query, pattern, breadcrumbs) => {
  const queryKeys = keys(query);
  for (var i = 0; i < length(queryKeys); i++) {
    const newBreadcrumbs = append(queryKeys[i], breadcrumbs);
    const queryValue = pathOfList(query, [queryKeys[i]]);
    if (is(String, queryValue) && contains(pattern, queryValue)) {
      return dropLast(1, newBreadcrumbs);
    }
    if (is(Object, queryValue)) {
      const result = breadcrumbsSeeker(queryValue, pattern, newBreadcrumbs);
      if (length(result) > 0) {
        return result;
      }
    }
    continue;
  }
};

const getListLevel = (query, pattern) => {
  return breadcrumbsSeeker(query, pattern, []);
};

const discoverList = (obj, query, mapOfListPath) => pathToValue => {
  const pathTo = pathToValue[1];
  const value = pathOfList(obj, pathTo);
  const isArray = is(Array, value);
  const existentPath = filter(pathList => {
    return equals(path(pathList, "pathTo"), pathTo);
  }, mapOfListPath);

  if (isArray && isNilOrEmpty(existentPath)) {
    const length = value.length;
    const listLevel = getListLevel(query, join(".", pathTo));
    const metadataPath = append("_metadata", listLevel);
    const flattenPath = append("flatten", metadataPath);
    const flatten = pathOfList(query, flattenPath);
    const isFlatten = flatten ? flatten : false;
    return append(
      {
        flatten: isFlatten,
        listPath: listLevel,
        pathTo: pathTo,
        length: length
      },
      mapOfListPath
    );
  }

  if (gt(length(pathTo), 2)) {
    pathToValue[1] = dropLast(1, pathTo);
    return discoverList(obj, query, mapOfListPath)(pathToValue);
  }
};

const processFlattenQueryLists = (toFlattenList, query) => {
  let newQuery = query;

  forEach(listPath => {
    let flat = [];
    for (let index = 0; index < listPath["length"]; index++) {
      const flattened = map(objValue => {
        if (is(String, objValue)) {
          const replaceable = join(".", listPath["pathTo"]);
          const toReplaceable = replaceable + "." + index;
          const newValue = replace(replaceable, toReplaceable, objValue);
          return newValue;
        }
        return objValue;
      }, pathOfList(query, listPath["listPath"]));
      const isNoKey = equals(
        toString(path(flattened, "_metadata", "noKey")),
        "true"
      );
      flat = append(dissoc("_metadata", flattened), flat);

      const processNoKey = value => {
        flat = append(value, flat);
      };

      if (isNoKey) {
        const flatNoKey = flat;
        flat = [];
        map(x => processNoKey(x), head(flatNoKey));
      }
    }
    newQuery = assocPath(newQuery, listPath["listPath"], flat);
  }, toFlattenList);

  return newQuery;
};

const processDefaultQueryLists = (toDefaultList, query) => {
  let newQuery = [];

  forEach(listPath => {
    for (let index = 0; index < listPath["length"]; index++) {
      const modifiedQuery = mapObjIndexed((propVal, propKey) => {
        if (is(String, propVal)) {
          const replaceable = join(".", listPath["pathTo"]);
          const toReplaceable = replaceable + "." + index;
          const newValue = replace(replaceable, toReplaceable, propVal);
          propVal = newValue;
        }
        return propVal;
      }, pathOfList(query, listPath["listPath"]));
      const enhancedQuery = assocPath(
        query,
        listPath["listPath"],
        modifiedQuery
      );
      newQuery = append(enhancedQuery, newQuery);
    }
  }, toDefaultList);

  return newQuery;
};

exports.processLists = (query, response) => {
  const pairedQuery = toDeepPairs(query);
  const regexList = filterByRegex(pairedQuery);
  const mapOfListPath = discoverListsInObj(response, query)(
    zipRegexToPath(regexList)
  );

  const toFlattenList = filter(path => path["flatten"] === true, mapOfListPath);
  const toDefaultList = filter(
    path => path["flatten"] === false,
    mapOfListPath
  );

  let processedQuery = query;
  if (isNotNilOrEmpty(toFlattenList)) {
    processedQuery = processFlattenQueryLists(toFlattenList, processedQuery);
  }

  if (isNotNilOrEmpty(toDefaultList)) {
    return processDefaultQueryLists(toDefaultList, processedQuery);
  }

  return processedQuery;
};
