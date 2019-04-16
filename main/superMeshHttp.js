"use strict";

const { info, error } = require("./utils/logger");
const {
  path,
  toString,
  equals,
  assoc,
  filter,
  not,
  and,
  is,
  reduce,
  isNotNilOrEmpty,
  isNilOrEmpty,
  forEachObjIndexed
} = require("../../utils/utilFunctions");

module.exports = client => async (alias, query) => {
  try {
    info(`Acessando servicos encadeados com a query ${toString(query)}`);

    const simpleParams = filterBy("simple", query);
    const objParams = filterBy("object", query);
    const listParams = filterBy("array", query);

    let queryParams = stringfyToUrlPattern(objParams, listParams);

    const response = await client(
      path(query, "method"),
      path(query, "resource")
    )
      .set(path(query, "headers"))
      .query(simpleParams)
      .query(queryParams)
      .send(path(query, "body"))
      .timeout(path(query, "timeout"))
      .retry(path(query, "retry"));

    const body = {
      details: {
        success: true,
        status: response.status
      },
      headers: response.headers,
      body: response.body,
      response: response
    };
    return assoc(alias, body, {});
  } catch (err) {
    error(err);
    const body = {
      details: {
        success: false,
        status: response.status
      },
      err: err
    };

    return assoc(alias, body, {});
  }
};

const filterBy = (type, query) => {
  if (equals("simple", type)) {
    return filter(param => {
      const isObject = and(not(is(Array, param)), is(Object, param));
      const isArray = and(is(Array, param), is(Object, param));
      return and(not(isObject), not(isArray));
    }, path(query, "params"));
  }

  if (equals("object", type)) {
    return filter(param => {
      const isString = is(String, param);
      const isObject = and(not(is(Array, param)), is(Object, param));
      return and(isObject, not(isString));
    }, path(query, "params"));
  }

  if (equals("array", type)) {
    return filter(param => {
      const isString = is(String, param);
      const isArray = and(is(Array, param), is(Object, param));
      return and(isArray, not(isString));
    }, path(query, "params"));
  }
};

const stringfyToUrlPattern = (objParams, listParams) => {
  let listQuery = "";
  let objQuery = "";

  if (isNotNilOrEmpty(objParams)) {
    forEachObjIndexed((value, key) => {
      if (isNotNilOrEmpty(objQuery)) {
        objQuery = objQuery + "&";
      }
      objQuery = key + "=" + JSON.stringify(value);
    }, objParams);
  }

  if (isNotNilOrEmpty(listParams)) {
    forEachObjIndexed((value, key) => {
      listQuery = reduce(
        (acc, param) => {
          if (isNotNilOrEmpty(acc)) {
            acc = acc + "&";
          }
          return acc + key + "=" + JSON.stringify(param);
        },
        "",
        value
      );
    }, listParams);
  }

  if (and(isNotNilOrEmpty(objQuery), isNotNilOrEmpty(listQuery))) {
    return objQuery + "&" + listQuery;
  } else if (and(isNotNilOrEmpty(objQuery), isNilOrEmpty(listQuery))) {
    return objQuery;
  } else if (and(isNilOrEmpty(objQuery), isNotNilOrEmpty(listQuery))) {
    return listQuery;
  } else {
    return "";
  }
};
