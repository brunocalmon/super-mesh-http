"use-strict";

const R = require("ramda");
const money = require("./money");

//Money shortcuts
const _sumAll = (...values) => money.sum(_flatten(values));
const _subAll = (...values) => money.subtract(values);

module.exports.sumAll = _sumAll;
module.exports.subAll = _subAll;

//Ramda shortcuts
const _defaultToZero = R.defaultTo(0.0);
const _defaultToEmpty = R.defaultTo([]);
const _defaultToMap = R.defaultTo({});
const _defaultToBlank = R.defaultTo("");
const _isNotEmpty = value => R.not(R.isEmpty(value));
const _isNotNil = value => R.not(R.isNil(value));
const _isNotNilOrEmpty = value => R.and(_isNotNil(value), _isNotEmpty(value));
const _isNilOrEmpty = value => R.or(R.isNil(value), R.isEmpty(value));
const _curry = callback => R.curry(callback);
const _not = value => R.not(value);
const _or = (value, value2) => R.or(value, value2);
const _and = (value, value2) => R.and(value, value2);
const _pathOfList = (object, paths) => R.path(paths, object);
const _path = (object, ...paths) => R.path(paths, object);
const _assocPath = (map, path, value) =>
  R.assocPath(_defaultToEmpty(path), _defaultToBlank(value), map);
const _assoc = (k, v, object) => R.assoc(k, v, _defaultToMap(object));
const _head = value => R.head(_defaultToEmpty(value));
const _last = value => R.last(_defaultToEmpty(value));
const _filter = (callback, list) => R.filter(callback, _defaultToEmpty(list));
const _map = (callback, list) => R.map(callback, _defaultToEmpty(list));
const _mapObjIndexed = (callback, list) =>
  R.mapObjIndexed(callback, _defaultToEmpty(list));
const _flatten = listOfLists => R.flatten(_defaultToEmpty(listOfLists));
const _uniq = list => R.uniq(_flatten(list));
const _length = list => R.length(_defaultToEmpty(list));
const _splitArray = (regExp, value) => _defaultToEmpty(R.split(regExp, value));
const _contains = (value, list) => R.contains(value, list);
const _startsWith = (expected, value) => R.startsWith(expected, value);
const _match = (regex, text) =>
  R.match(_defaultToBlank(regex), _defaultToBlank(text));
const _replace = (from, to, text) => R.replace(from, to, text);
const _slice = (from, to, text) =>
  R.slice(_defaultToZero(from), _defaultToZero(to), _defaultToBlank(text));
const _zip = (array1, array2) => R.zip(array1, array2);
const _zipObj = (array1, array2) => R.zipObj(array1, array2);
const _forEachObjIndexed = (callback, map) =>
  R.forEachObjIndexed(callback, map);
const _forEach = (callback, map) => R.forEach(callback, map);
const _clone = obj => R.clone(obj);
const _keys = obj => R.keys(obj);
const _concat = (value1, value2) => R.concat(value1, value2);
const _toString = obj => R.toString(obj);
const _append = (obj, list) => R.append(obj, list);
const _all = (value, list) => R.all(value, list);
const _equals = (value1, value2) => R.equals(value1, value2);
const _toPairs = obj => R.toPairs(obj);
const _has = property => R.has(property);
const _is = (type, data) => R.is(type, data);
const _projectObj = (array, obj) => _head(R.project(array, [obj]));
const _dissoc = (key, obj) => R.dissoc(key, obj);
const _dropLast = (index, list) => R.dropLast(index, list);
const _join = (pivot, list) => R.join(pivot, list);
const _reduce = (callback, initialValue, list) =>
  R.reduce(callback, initialValue, list);
const _gt = (value1, value2) => R.gt(value1, value2);

const _merge = (objectA, objectB) =>
  R.merge(_defaultToMap(objectA), _defaultToMap(objectB));

const _mergeAll = (...objects) =>
  R.mergeAll(
    R.filter(object => _isNotNilOrEmpty(object), _defaultToEmpty(objects))
  );

const _findMax = values =>
  _reduce((prev, next) => Math.max(prev, next), 0.0, _defaultToEmpty(values));

module.exports.defaultToZero = _defaultToZero;
module.exports.defaultToEmpty = _defaultToEmpty;
module.exports.defaultToMap = _defaultToMap;
module.exports.defaultToBlank = _defaultToBlank;
module.exports.isNotNilOrEmpty = _isNotNilOrEmpty;
module.exports.isNilOrEmpty = _isNilOrEmpty;
module.exports.equals = _equals;
module.exports.not = _not;
module.exports.or = _or;
module.exports.and = _and;
module.exports.path = _path;
module.exports.pathOfList = _pathOfList;
module.exports.assoc = _assoc;
module.exports.head = _head;
module.exports.last = _last;
module.exports.filter = _filter;
module.exports.map = _map;
module.exports.flatten = _flatten;
module.exports.uniq = _uniq;
module.exports.reduce = _reduce;
module.exports.merge = _merge;
module.exports.mergeAll = _mergeAll;
module.exports.length = _length;
module.exports.findMax = _findMax;
module.exports.splitArray = _splitArray;
module.exports.contains = _contains;
module.exports.startsWith = _startsWith;
module.exports.match = _match;
module.exports.replace = _replace;
module.exports.slice = _slice;
module.exports.zip = _zip;
module.exports.zipObj = _zipObj;
module.exports.forEach = _forEach;
module.exports.forEachObjIndexed = _forEachObjIndexed;
module.exports.curry = _curry;
module.exports.clone = _clone;
module.exports.append = _append;
module.exports.all = _all;
module.exports.keys = _keys;
module.exports.mapObjIndexed = _mapObjIndexed;
module.exports.assocPath = _assocPath;
module.exports.concat = _concat;
module.exports.toString = _toString;
module.exports.toPairs = _toPairs;
module.exports.has = _has;
module.exports.is = _is;
module.exports.projectObj = _projectObj;
module.exports.dissoc = _dissoc;
module.exports.dropLast = _dropLast;
module.exports.join = _join;
module.exports.gt = _gt;
module.exports.pipe = R.pipe;
module.exports.lastIndexOf = R.lastIndexOf;
