const fs = require("fs");
const absolutePath = require("path");
const {
  equals,
  path,
  map,
  isNotNilOrEmpty,
  filter,
  head,
  lastIndexOf,
  contains,
  length,
  gt,
  flatten
} = require("./../main/utils/utilFunctions");

module.exports = () => (alias, query) => {
  try {
    const response = processMeshHttpRequest(alias, query);
    return response;
  } catch (error) {
    return error;
  }
};

const processMeshHttpRequest = (alias, query) => {
  return getCorrectResponse(alias, query);
};

const getCorrectResponse = (alias, query) => {
  const dirPath = absolutePath.resolve(__dirname, "./resources");
  const filenames = fs.readdirSync(dirPath, (err, names) => names);
  const fileResponses = map(
    filename => JSON.parse(fs.readFileSync(dirPath + "/" + filename, "utf8")),
    filenames
  );

  if (isNotNilOrEmpty(fileResponses)) {
    const responses = filter(response => {
      const resource = path(query, "resource");
      const pathParam = extractPathParam(resource);
      const queryParams = path(query, "params");

      if (isNotNilOrEmpty(pathParam)) {
        const responseId = path(response, alias, "body", "id");
        return equals(pathParam, responseId);
      } else if (isNotNilOrEmpty(queryParams)) {
        return contains(
          path(response, "items", "body", "id"),
          flatten(map(param => path(param, "itemId"), queryParams))
        );
      } else {
        return false;
      }
    }, fileResponses);
    if (gt(length(responses), 1)) {
      return {
        items: {
          body: map(response => path(response, "items", "body"), responses)
        }
      };
    }
    return head(responses);
  }
  return {};
};

const extractPathParam = url => {
  const from = lastIndexOf("/", url);
  const to = url.length;
  return url.substring(from + 1, to);
};
