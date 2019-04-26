"use strict";

const {
  path,
  map,
  filter,
  isNotNilOrEmpty,
  isNilOrEmpty,
  is,
  or,
  and,
  not,
  equals,
  head,
  contains,
  clone,
  assoc,
  reduce,
  keys,
  defaultToEmpty,
  mapObjIndexed,
  toPairs,
  merge,
  flatten,
  has,
  append
} = require("./utils/utilFunctions");

const { info, error } = require("./utils/logger")

const childResourceProcessor = require("./handlers/childResourceProcessor/childResourceProcessor");
const childHeadersProcessor = require("./handlers/childHeadersProcessor/childHeadersProcessor");
const childParamsProcessor = require("./handlers/childParamsProcessor/childParamsProcessor");
const childBodyProcessor = require("./handlers/childBodyProcessor/childBodyProcessor");
const { removeBlank } = require("./handlers/utilProcessor");
const updateGraph = require("./handlers/graphProcessor/graphProcessor");
const MalformedQueryError = require("./errors/MalformedQueryError")

module.exports = superMashHttp => async queries => {
  const graph = makeGraph(queries);
  let requestResponses = {};
  while (processingNodes(graph)) {
    try {
      const eligibleNodes = getEligibles(graph);
      const processedNodes = processNodeForRequest(
        eligibleNodes,
        requestResponses
      );
      const chainedResponses = await performChainedRequests(
        processedNodes,
        superMashHttp
      );

      const chainedObj = chainedResponsesToObj(chainedResponses);

      updateGraph(graph, chainedObj);
      requestResponses = merge(requestResponses, chainedObj);
      info("Graph updated with responses datas: \n Graph: " + JSON.stringify(graph) + "\n requestResponses: " + JSON.stringify(requestResponses) + "\n");
    } catch (err) {
      return err;
    }
  }
  return requestResponses;
};

const chainedResponsesToObj = chainedResponses => {
  return reduce(
    (acc, curr) => {
      const key = head(keys(curr));
      if (has(head(keys(curr)))(acc)) {
        const value = path(acc, key);
        if (is(Array, value)) {
          return assoc(key, append(path(curr, key), value), acc);
        }
        const valueToList = append(value, []);
        return assoc(key, append(path(curr, key), valueToList), acc);
      }
      return merge(acc, curr);
    },
    {},
    chainedResponses
  );
};

const makeGraph = queries => {
  info("Creating graph throught queries: " + JSON.stringify(queries));
  const graph = reduce(
    (acc, query) => {
      const node = makeNode(query, queries);
      const key = head(keys(node));
      return assoc(key, path(node, key), acc);
    },
    {},
    queries
  );
  info("Created graph: " + JSON.stringify(graph));
  return graph;
};

const makeNode = (query, queries) => {
  validateQuery(query);
  const node = {};
  const nodeKey = path(query, "alias");
  const nodeBody = {
    ancestors: defaultToEmpty(path(query, "chainedBy")),
    children: findChildren(path(query, "alias"), queries),
    query: query,
    status: "UNPROCESSED"
  };
  return assoc(nodeKey, nodeBody, node);
};

const findChildren = (alias, queries) => {
  const children = filter(
    query => contains(alias, defaultToEmpty(path(query, "chainedBy"))),
    queries
  );
  return map(child => path(child, "alias"), children);
};

const validateQuery = query => {
  let erroList = [];
  if (not(has('alias')(query) && isNotNilOrEmpty(path(query, 'alias')))) {
    erroList = append({
      field: 'alias',
      message: "alias field is required"
    }, erroList);
  }

  if (not(has('method')(query) && isNotNilOrEmpty(path(query, 'method')))) {
    erroList = append({
      field: 'method',
      message: "method field is required"
    }, erroList);
  }

  if (not(has('resource')(query) && isNotNilOrEmpty(path(query, 'resource')))) {
    erroList = append({
      field: 'resource',
      message: "resource field is required"
    }, erroList);
  }

  if (isNotNilOrEmpty(erroList)) {
    const malformedQueryError = new MalformedQueryError(erroList, 1);
    error(malformedQueryError);
    throw malformedQueryError;
  }
};

const processingNodes = graph => {
  const processing = node => {
    const status = path(node, "status");
    return status === "UNPROCESSED";
  };
  const hasProcessingNodes = filter(processing, graph);
  const isProcessing = not(isNilOrEmpty(hasProcessingNodes));
  return isProcessing;
};

const getEligibles = graph => {
  return filter(node => isEligible(node, graph), graph);
};

const isEligible = (currentNode, graph) => {
  const isEligibleNode = equals(path(currentNode, "status"), "UNPROCESSED");
  const ancestorAlias = path(currentNode, "ancestors");
  const hasAncestors = isNotNilOrEmpty(ancestorAlias);

  if (hasAncestors) {
    const ancestors = map(ancestor => path(graph, ancestor), ancestorAlias);
    const ineligibleAncestors = filter(
      ancestor =>
        or(
          equals(path(ancestor, "status"), "UNPROCESSED"),
          equals(path(ancestor, "status"), "FAILURE")
        ),
      ancestors
    );
    const hasIneligibleAncestors = isNotNilOrEmpty(ineligibleAncestors);

    return and(not(hasIneligibleAncestors), isEligibleNode);
  }
  return isEligibleNode;
};

const processNodeForRequest = (eligibleNodes, ancestorResponses) => {
  const processedNodes = processNodeDependencies(
    eligibleNodes,
    ancestorResponses
  );
  return processedNodes;
};

const processNodeDependencies = (eligibleNodes, ancestorResponses) => {
  return mapObjIndexed(
    (num, key) => replaceAliasByParentValue(num, ancestorResponses),
    eligibleNodes
  );
};

const replaceAliasByParentValue = (node, ancestorResponses) => {
  let clonedNode = clone(node);

  if (is(Array, path(clonedNode, "query"))) {
    clonedNode["query"] = processMultipleQuery(clonedNode, ancestorResponses);
  } else {
    clonedNode["query"] = processSingleQuery(clonedNode, ancestorResponses);
  }

  return removeBlank(clonedNode);
};

const processMultipleQuery = (clonedNode, ancestorResponses) => {
  return map(singleQuery => {
    if (isNotNilOrEmpty(ancestorResponses)) {
      let response = {};
      response = assoc(
        "resource",
        childResourceProcessor(
          path(singleQuery, "resource"),
          ancestorResponses
        ),
        response
      );

      response = assoc(
        "headers",
        childHeadersProcessor(path(singleQuery, "headers"), ancestorResponses),
        response
      );

      response = assoc(
        "params",
        childParamsProcessor(path(singleQuery, "params"), ancestorResponses),
        response
      );

      response = assoc(
        "body",
        childBodyProcessor(path(singleQuery, "body"), ancestorResponses),
        response
      );

      return response;
    }
    return singleQuery;
  }, path(clonedNode, "query"));
};

const processSingleQuery = (clonedNode, ancestorResponses) => {
  if (isNotNilOrEmpty(ancestorResponses)) {
    clonedNode["query"]["resource"] = childResourceProcessor(
      path(clonedNode, "query", "resource"),
      ancestorResponses
    );

    clonedNode["query"]["headers"] = childHeadersProcessor(
      path(clonedNode, "query", "headers"),
      ancestorResponses
    );

    clonedNode["query"]["params"] = childParamsProcessor(
      path(clonedNode, "query", "params"),
      ancestorResponses
    );

    clonedNode["query"]["body"] = childBodyProcessor(
      path(clonedNode, "query", "body"),
      ancestorResponses
    );
  }
  return clonedNode["query"];
};

const performChainedRequests = (processedNodes, superMeshHttp) => {
  info("Calling processed nodes: " + JSON.stringify(processedNodes));
  const nodesToCall = toPairs(processedNodes);

  const allPromisesResponses = map(node => {
    const alias = node[0];
    const query = node[1]["query"];
    if (is(Array, query)) {
      return map(q => superMeshHttp(alias, q), query);
    }
    return superMeshHttp(alias, query);
  }, nodesToCall);
  return Promise.all(flatten(allPromisesResponses)).then(
    responses => responses
  );
};
