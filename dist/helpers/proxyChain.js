'use strict';

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _moduleList = require('./moduleList');

var _moduleList2 = _interopRequireDefault(_moduleList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prefer-rest-params, no-await-in-loop */
class ChainObject {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.currentTarget = 'page';
    this.actions = [];
  }

  setCurrentTarget(currentTarget) {
    this.currentTarget = currentTarget;
  }

  addAction({
    target = this.currentTarget,
    property = undefined,
    args = undefined
  } = {}) {
    this.actions.push({ target, property, args });
  }

  async end() {
    let result = null;
    let continueChain = false;
    const { actions } = this;
    this.actions = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const action of actions) {
      if (continueChain) {
        result = await this.target._handleContinueFunc(result, action.property, action.args);
        continueChain = false;
      } else if (action.property === this.options.continueFunc) {
        continueChain = true;
      } else if (action.property === this.options.resultFunc) {
        result = await action.args[0].apply(null, [result]);
      } else {
        result = await this.target[this.options.funcHandler](action.target, action.property, action.args);
      }
    }
    return result;
  }
}

const makeHandler = (target, options) => ({
  get: (chainObj, property) => {
    if (!options.chained) {
      return _moduleList2.default.includes(property) ? target[options.funcHandler]('page', property) : function handle() {
        return target[options.funcHandler]('page', property, arguments);
      };
    }
    if (property === options.endFunc) {
      return () => chainObj.end().then(result => result).catch(e => {
        _logger2.default.trace(e);
        throw e;
      });
    }
    if (_moduleList2.default.includes(property)) {
      chainObj.setCurrentTarget(property);
      return target.chainedTarget;
    }
    if (property === options.continueFunc) {
      chainObj.addAction({ property });
      return target.chainedTarget;
    }
    return function handle() {
      chainObj.addAction({ property, args: arguments });
      return this;
    };
  },
  set: (chainObj, name, value) => {
    throw new Error(`You cannot set a ${value} to Proxy object.`);
  }
});

const chain = (target, chained = true) => {
  const defaultParams = {
    resultFunc: 'result',
    endFunc: 'end',
    continueFunc: 'then',
    funcHandler: '_handleFunc',
    chained
  };
  const chainObject = new ChainObject(target, defaultParams);
  return new Proxy(chainObject, makeHandler(target, defaultParams));
};

module.exports = chain;
//# sourceMappingURL=proxyChain.js.map