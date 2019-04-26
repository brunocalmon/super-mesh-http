"use strict";

const test = require("tape");
const superMesHttpMock = require("./clientMock");
const { superMeshHttpWithCustomClient } = require("./../main/main");
const { info } = require("./../main/utils/logger");
const {
  append,
  forEach,
  isNotNilOrEmpty,
  path
} = require("./../main/utils/utilFunctions");
const {
  test_1,
  test_2,
  test_3,
  test_4,
  test_5,
  items,
  items2,
  failed_test,
  test_without_all_optional_fields
} = require("./queriesMock");

const before = () => {
  return superMeshHttpWithCustomClient(superMesHttpMock());
};

test("test_chained_get_completing_the_next_requests_values", async assert => {
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

    const response = await superMeshHttp(chainedQueries);

    assert.ok(isNotNilOrEmpty(response));
    assert.equal("123", path(response, "test_1", "body", "id"));
    assert.equal("1234", path(response, "test_2", "body", "id"));
    assert.equal("12345", path(response, "test_3", "body", "id"));
    assert.equal("123456", path(response, "test_4", "body", "id"));
    assert.equal("1234567", path(response, "test_5", "body", "id"));
  } catch (error) {
    info(error);
  }
  assert.end();
});

test("test_interpolation_request_from_a_list_response", async assert => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll([], test_1(), items());

    const response = await superMeshHttp(chainedQueries);

    assert.ok(isNotNilOrEmpty(response));
    assert.equal("123", path(response, "test_1", "body", "id"));
    assert.equal("item_1", path(response, "items", "0", "body", "id"));
    assert.equal("item_2", path(response, "items", "1", "body", "id"));
    assert.equal("item_3", path(response, "items", "2", "body", "id"));
    assert.equal("item_4", path(response, "items", "3", "body", "id"));
  } catch (error) {
    info(error);
  }
  assert.end();
});

test("test_interpolation_request_from_a_flattened_list_response", async assert => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll([], test_1(), items2());

    const response = await superMeshHttp(chainedQueries);

    assert.ok(isNotNilOrEmpty(response));
    assert.equal("123", path(response, "test_1", "body", "id"));
    assert.equal("item_1", path(response, "items", "body", "0", "id"));
    assert.equal("item_2", path(response, "items", "body", "1", "id"));
    assert.equal("item_3", path(response, "items", "body", "2", "id"));
    assert.equal("item_4", path(response, "items", "body", "3", "id"));
  } catch (error) {
    info(error);
  }
  assert.end();
});

test("test_query_missing_alias_resource_method", async assert => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll([], failed_test());

    assert.throws(await superMeshHttp(chainedQueries));
  } catch (error) {
    info(error);
  }
  assert.end();
});

test("test_query_missing_optional_fields", async assert => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll([], test_without_all_optional_fields());

    const response = await superMeshHttp(chainedQueries);
    assert.equal("123", path(response, "test_1", "body", "id"));
  } catch (error) {
    info(error);
  }
  assert.end();
});

const appendAll = (list, ...objects) => {
  forEach(object => {
    list = append(object, list);
  }, objects);
  return list;
};
