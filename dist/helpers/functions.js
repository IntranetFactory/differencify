'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const isFunc = property => typeof property === 'function';
const handleAsyncFunc = async (target, property, args) => args ? target[property](...args) : target[property]();

exports.isFunc = isFunc;
exports.handleAsyncFunc = handleAsyncFunc;
//# sourceMappingURL=functions.js.map