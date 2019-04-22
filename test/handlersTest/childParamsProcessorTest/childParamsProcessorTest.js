"use strict";

const test = require("tape");
const childParamsProcessor = require("./../../../main/handlers/childParamsProcessor/childParamsProcessor");

test("test_param_chained_value_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } }
  };

  const expectedParams = { id: "123" };
  const params = {
    id: "{_parent.body.id_}"
  };
  const response = childParamsProcessor(params, prevObj);
  assert.equal(expectedParams["id"], response["id"]);
  assert.end();
});

test("test_param_chained_with_multiple_value_resolved", async assert => {
  const prevObj = {
    parent: { header: { location: "123", type: "json" } },
    parent2: { body: { id: "321", value: "value2" } }
  };

  const expectedParams = {
    location: "123",
    type: "json",
    content: "321",
    "x-header": "value2"
  };
  const params = {
    location: "{_parent.header.location_}",
    type: "{_parent.header.type_}",
    content: "{_parent2.body.id_}",
    "x-header": "{_parent2.body.value_}"
  };
  const response = childParamsProcessor(params, prevObj);
  assert.equal(expectedParams["location"], response["location"]);
  assert.equal(expectedParams["type"], response["type"]);
  assert.equal(expectedParams["content"], response["content"]);
  assert.equal(expectedParams["x-header"], response["x-header"]);
  assert.end();
});
