"use strict";

const test = require("tape");
const childHeadersProcessor = require("./../../../main/handlers/childHeadersProcessor/childHeadersProcessor");

test("test_header_chained_value_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } }
  };

  const expectedHeader = { id: "123" };
  const header = {
    id: "{_parent.body.id_}"
  };
  const response = childHeadersProcessor(header, prevObj);
  assert.equal(expectedHeader["id"], response["id"]);
  assert.end();
});

test("test_header_chained_with_multiple_value_resolved", async assert => {
  const prevObj = {
    parent: { header: { location: "123", type: "json" } },
    parent2: { body: { id: "321", value: "value2" } }
  };

  const expectedHeader = {
    location: "123",
    type: "json",
    content: "321",
    "x-header": "value2"
  };
  const header = {
    location: "{_parent.header.location_}",
    type: "{_parent.header.type_}",
    content: "{_parent2.body.id_}",
    "x-header": "{_parent2.body.value_}"
  };
  const response = childHeadersProcessor(header, prevObj);
  assert.equal(expectedHeader["location"], response["location"]);
  assert.equal(expectedHeader["type"], response["type"]);
  assert.equal(expectedHeader["content"], response["content"]);
  assert.equal(expectedHeader["x-header"], response["x-header"]);
  assert.end();
});
