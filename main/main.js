"use strict";

const client = require("superagent");
const meshService = require("./superMeshHttpService");
const meshHttp = require("./superMeshHttp");

module.exports = () => {
  const mesh = meshHttp(client);
  const service = meshService(mesh);
  return service;
};

module.exports = customizedMeshHttp => {
  const service = meshService(customizedMeshHttp);
  return service;
};
