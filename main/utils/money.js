"use-strict";

const roundFactor = Math.pow(10, 2);
const R = require("ramda");

const truncateTo2Decimals = value => {
  return Math.round(value * roundFactor) / roundFactor;
};

exports.sum = (...args) => {
  const flatted = R.flatten(args);
  const total = R.reduce((acc, value) => acc + value, 0, flatted);
  return truncateTo2Decimals(total);
};

exports.subtract = (...args) => {
  const flatted = R.flatten(args);
  const total = flatted.reduce((acc, value) => acc - value);
  return truncateTo2Decimals(total);
};
