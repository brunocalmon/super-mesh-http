"use strict";

const client = require("superagent");
const meshService = require("./superMeshHttpService");
const meshHttp = require("./superMeshHttp");

exports.superMeshHttp = meshService(meshHttp(client));

exports.superMeshHttpWithCustomClient = customizedMeshHttp => {
  return meshService(customizedMeshHttp);
};
