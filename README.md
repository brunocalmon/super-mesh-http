# super-mesh-http
## This package provide features to perform multiple requests by chainning them with previous responses.
I'm still working on the readme to provide some information, please be patience.

# Usage:

## Query's Example:

<pre><code>
exports.test_1 = () => {
  const alias = "test_1";
  const method = "get";
  const resource = "http://localhost:8080/test_1/123";
  const params = {};
  const chainedBy = [];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

exports.test_2 = () => {
  const alias = "test_2";
  const method = "get";
  const resource = "http://localhost:8080/test_2/{_test_1.body.next_}";
  const params = {};
  const chainedBy = ["test_1"];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

exports.test_3 = () => {
  const alias = "test_3";
  const method = "get";
  const resource = "http://localhost:8080/test_3/{_test_2.body.next_}";
  const params = {};
  const chainedBy = ["test_2"];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

exports.test_4 = () => {
  const alias = "test_4";
  const method = "get";
  const resource = "http://localhost:8080/test_4/{_test_3.body.next_}";
  const params = {};
  const chainedBy = ["test_3"];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

exports.test_5 = () => {
  const alias = "test_5";
  const method = "get";
  const resource = "http://localhost:8080/test_5/{_test_4.body.next_}";
  const params = {};
  const chainedBy = ["test_4"];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

exports.items = () => {
  const alias = "items";
  const method = "get";
  const resource = "http://localhost:8080/item/{_test_1.body.items.id_}";
  const params = {};
  const chainedBy = ["test_1"];
  return querySchema(
    alias,
    method,
    resource,
    HEADERS,
    params,
    {},
    TIMEOUT,
    chainedBy,
    0
  );
};

const querySchema = (
  alias,
  method,
  resource,
  headers,
  params,
  body,
  timeout,
  chainedBy,
  retry
) => {
  return {
    alias: alias,
    method: method,
    resource: resource,
    headers: headers,
    params: params,
    body: body,
    timeout: timeout,
    chainedBy: chainedBy,
    retry: retry
  };
};
</code></pre>

## super-mesh-call's call example
<pre><code>

const superMesHttpMock = require("./clientMock");
const { superMeshHttpWithCustomClient } = require("./../main/main");
const {
  append,
  forEach
} = require("./../main/utils/utilFunctions");
const { test_1, test_2, test_3, test_4, test_5, items } = require("./queriesMock");

const before = () => {
  return superMeshHttpWithCustomClient(superMesHttpMock());
};

const request = () => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll(
      [],
      test_1(),
      test_2(),
      test_3(),
      test_4(),
      test_5()
    );

    return await superMeshHttp(chainedQueries);
  } catch (error) {
    console.log(error);
  }
  assert.end();
});

const appendAll = (list, ...objects) => {
  forEach(object => {
    list = append(object, list);
  }, objects);
  return list;
};
</code></pre>
