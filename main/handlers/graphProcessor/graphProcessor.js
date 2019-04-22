"use strict";

const {
  path,
  filter,
  and,
  not,
  contains,
  assoc,
  keys,
  mapObjIndexed,
  has,
  forEach,
  projectObj,
  merge,
  is,
  map
} = require("./../../utils/utilFunctions");

const { processLists } = require("./../utilProcessor");

module.exports = (graph, requestResponses) => {
  return mapObjIndexed(
    (num, key) => update(num, key)(requestResponses, graph),
    graph
  );
};

const update = (num, key) => (requestResponses, graph) => {
  updateStatus(num, key)(requestResponses);
  updateQueries(num, key)(requestResponses, graph);
};

const updateStatus = (num, key) => requestResponses => {
  if (has(key)(requestResponses)) {
    if (not(path(requestResponses, key, "details", "success"))) {
      num["status"] = "FAILURE";
    } else {
      num["status"] = "COMPLETED";
    }
  }
};

const updateQueries = (num, key) => (requestResponses, graph) => {
  const responsesKeys = keys(requestResponses);
  const ancestorsKeysArray = filter(
    findResponsesWithChild(requestResponses, graph, key),
    responsesKeys
  );

  forEach(ancestorKey => {
    const updated = updateChildQueries(
      requestResponses,
      path(num, "query"),
      ancestorKey
    );

    if (is(Array, updated)) {
      const oldQuery = path(num, "query");
      const merged = map(newQuery => {
        return merge(oldQuery, newQuery);
      }, updated);
      num["query"] = merged;
    } else {
      const merged = merge(num["query"], updated);
      num["query"] = merged;
    }
  }, ancestorsKeysArray);
};

const findResponsesWithChild = (
  requestResponses,
  graph,
  key
) => responseKey => {
  const success = path(requestResponses, responseKey, "details", "success");
  const isChild = contains(key, path(graph, responseKey, "children"));
  return and(success, isChild);
};

const updateChildQueries = (requestResponses, query, ancestorKey) => {
  const projectedQuery = projectObj(["params", "body", "resource"], query);
  const response = assoc(ancestorKey, path(requestResponses, ancestorKey), {});

  const newQuery = processLists(projectedQuery, response);
  return newQuery;
};
