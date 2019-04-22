"use strict";

const test = require("tape");
const childBodyProcessor = require("./../../../main/handlers/childBodyProcessor/childBodyProcessor");

test("test_body_chained_value_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } }
  };

  const expectedBody = { id: "123" };
  const body = {
    id: "{_parent.body.id_}"
  };
  const response = childBodyProcessor(body, prevObj);
  assert.equal(expectedBody["id"], response["id"]);
  assert.end();
});

test("test_body_chained_with_multiple_value_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123", value: "value" } },
    parent2: { body: { id: "321", value: "value2" } }
  };

  const expectedBody = {
    id: "123",
    value: "value",
    id2: "321",
    value2: "value2"
  };
  const body = {
    id: "{_parent.body.id_}",
    value: "{_parent.body.value_}",
    id2: "{_parent2.body.id_}",
    value2: "{_parent2.body.value_}"
  };
  const response = childBodyProcessor(body, prevObj);
  assert.equal(expectedBody["id"], response["id"]);
  assert.equal(expectedBody["id2"], response["id2"]);
  assert.equal(expectedBody["value"], response["value"]);
  assert.equal(expectedBody["value2"], response["value2"]);
  assert.end();
});
