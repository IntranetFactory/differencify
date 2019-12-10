'use strict';

var _functionToString = require('./functionToString');

var _functionToString2 = _interopRequireDefault(_functionToString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const foo = function foo(a, b, c) {
  return a + b + c;
};

describe('functionToString', () => {
  it('Convert function to string with right arguments', () => {
    const strFunc = (0, _functionToString2.default)(foo, 1, 2, '3');
    expect(strFunc).toEqual(`(function foo(a, b, c) {
  return a + b + c;
})(1,2,"3")`);
    expect(eval(strFunc)).toEqual('33'); // eslint-disable-line no-eval
  });
  it('Convert function to string with no arguments', () => {
    const strFunc = (0, _functionToString2.default)(foo);
    expect(strFunc).toEqual(`(function foo(a, b, c) {
  return a + b + c;
})()`);
    expect(eval(strFunc)).toEqual(NaN); // eslint-disable-line no-eval
  });
  it('Return null if non function passed', () => {
    const strFunc = (0, _functionToString2.default)('function');
    expect(strFunc).toEqual(null);
  });
});
//# sourceMappingURL=functionToString.test.js.map