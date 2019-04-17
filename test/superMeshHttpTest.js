"use strict";

const test = require("tape");
const superMesHttpMock = require("./clientMock");
const { superMeshHttpWithCustomClient } = require("./../main/main");
const {
  append,
  forEach,
  isNotNilOrEmpty,
  path
} = require("./../main/utils/utilFunctions");
const { test_1, test_2, test_3, test_4, test_5, items } = require("./queriesMock");

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
    console.log(error);
  }
  assert.end();
});

test("test_interpolation_request_from_a_list_response", async assert => {
  const superMeshHttp = before();
  try {
    const chainedQueries = appendAll(
      [],
      test_1(),
      items()
    );

    const response = await superMeshHttp(chainedQueries);

    assert.ok(isNotNilOrEmpty(response));
    assert.equal("123", path(response, "test_1", "body", "id"));
    assert.equal("item_1", path(response, "items", "0", "body", "id"));
    assert.equal("item_2", path(response, "items", "1", "body", "id"));
    assert.equal("item_3", path(response, "items", "2", "body", "id"));
    assert.equal("item_4", path(response, "items", "3", "body", "id"));
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
