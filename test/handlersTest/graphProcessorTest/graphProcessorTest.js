"use strict";

const test = require("tape");
const fs = require("fs");
const absolutePath = require("path");
const graphProcessor = require("./../../../main/handlers/graphProcessor/graphProcessor");
const {
  test_1,
  test_2,
  test_3,
  test_4,
  test_5,
  items,
  items2
} = require("./../../queriesMock");
const {
  forEach,
  append,
  reduce,
  path,
  defaultToEmpty,
  filter,
  contains,
  map,
  assoc,
  head,
  keys,
  has,
  merge,
  is,
  equals,
  length
} = require("./../../../main/utils/utilFunctions");

test("test_graph_creation_chained_with_default_list_resolution", async assert => {
  const graph = makeGraph(
    appendAll([], test_1(), test_2(), test_3(), test_4(), test_5(), items())
  );
  const dirPath = absolutePath.resolve(__dirname, "./../../resources");
  const filenames = fs.readdirSync(dirPath, (err, names) => names);
  const fileResponses = map(
    filename => JSON.parse(fs.readFileSync(dirPath + "/" + filename, "utf8")),
    filenames
  );
  const obj = chainedResponsesToObj(fileResponses);
  graphProcessor(graph, obj);
  assert.ok(equals(length(path(graph, "items", "query")), 4));
  assert.end();
});

test("test_graph_creation_chained_with_flatten_list_resolution", async assert => {
  const graph = makeGraph(
    appendAll([], test_1(), test_2(), test_3(), test_4(), test_5(), items2())
  );
  const dirPath = absolutePath.resolve(__dirname, "./../../resources");
  const filenames = fs.readdirSync(dirPath, (err, names) => names);
  const fileResponses = map(
    filename => JSON.parse(fs.readFileSync(dirPath + "/" + filename, "utf8")),
    filenames
  );
  const obj = chainedResponsesToObj(fileResponses);
  graphProcessor(graph, obj);
  assert.ok(equals(length(path(graph, "items", "query", "params")), 4));
  assert.end();
});

const appendAll = (list, ...objects) => {
  forEach(object => {
    list = append(object, list);
  }, objects);
  return list;
};

const makeGraph = queries => {
  const graph = reduce(
    (acc, query) => {
      const node = makeNode(query, queries);
      const key = head(keys(node));
      return assoc(key, path(node, key), acc);
    },
    {},
    queries
  );
  return graph;
};

const makeNode = (query, queries) => {
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
