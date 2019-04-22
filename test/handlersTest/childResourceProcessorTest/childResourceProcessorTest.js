"use strict";

const test = require("tape");
const childResourceProcessor = require("./../../../main/handlers/childResourceProcessor/childResourceProcessor");

test("test_url_chained_value_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } }
  };
  const response = childResourceProcessor(
    "http://localhost:8080/{_parent.body.id_}",
    prevObj
  );
  assert.equal("http://localhost:8080/123", response);
  assert.end();
});

test("test_url_chained_with_2_values_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } },
    parent2: { body: { id: "321" } }
  };
  const response = childResourceProcessor(
    "http://localhost:8080/{_parent.body.id_}/parent2/{_parent2.body.id_}",
    prevObj
  );
  assert.equal("http://localhost:8080/123/parent2/321", response);
  assert.end();
});

test("test_url_chained_with_multiple_values_resolved", async assert => {
  const prevObj = {
    parent: { body: { id: "123" } },
    parent2: { body: { id: "321" } },
    parent3: { body: { id: "345" } },
    parent4: { body: { id: "543" } },
    parent5: { body: { id: "453" } }
  };
  const response = childResourceProcessor(
    "http://localhost:8080/{_parent.body.id_}/parent2/{_parent2.body.id_}/parent3/{_parent3.body.id_}/parent4/{_parent4.body.id_}/parent5/{_parent5.body.id_}",
    prevObj
  );
  assert.equal(
    "http://localhost:8080/123/parent2/321/parent3/345/parent4/543/parent5/453",
    response
  );
  assert.end();
});
