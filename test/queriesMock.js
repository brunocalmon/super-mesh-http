const TIMEOUT = { response: 5000, deadline: 5000 };
const HEADERS = { "Content-Type": "application/json" };

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
