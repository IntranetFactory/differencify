'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _checkTypes = require('check-types');

var _checkTypes2 = _interopRequireDefault(_checkTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const functionToString = (func, ...args) => {
  if (!_checkTypes2.default.function(func)) {
    return null;
  }
  const funcArguments = [];
  args.forEach(value => {
    if (_checkTypes2.default.string(value)) {
      funcArguments.push(`"${value}"`);
    } else {
      funcArguments.push(value);
    }
  });
  const functionSource = func.toString();
  return `(${functionSource})(${funcArguments.join()})`;
};

exports.default = functionToString;
//# sourceMappingURL=functionToString.js.map