'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _mockeer = require('mockeer');

var _mockeer2 = _interopRequireDefault(_mockeer);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _jestMatchers = require('./utils/jestMatchers');

var _jestMatchers2 = _interopRequireDefault(_jestMatchers);

var _compareImage = require('./compareImage');

var _compareImage2 = _interopRequireDefault(_compareImage);

var _functionToString = require('./helpers/functionToString');

var _functionToString2 = _interopRequireDefault(_functionToString);

var _freezeImage = require('./freezeImage');

var _freezeImage2 = _interopRequireDefault(_freezeImage);

var _functions = require('./helpers/functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Target {
  constructor(browser, globalConfig, testConfig) {
    this.globalConfig = globalConfig;
    this.testConfig = testConfig;
    this.browser = browser;
    this.chainedTarget = null;
    this.page = null;
    this.prefixedLogger = _logger2.default.prefix(this.testConfig.testName);
    this.testConfig.imageType = globalConfig.imageType;
    this.error = null;
    this.image = null;
    this.testId = 0;
    this.result = null;
  }

  _logError(error) {
    this.error = error;
    this.prefixedLogger.trace(error);
  }

  _logStep(functionName) {
    this.prefixedLogger.log(`Executing ${functionName} step`);
  }

  async launch(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await _puppeteer2.default.launch(options);
      this.testConfig.newWindow = true;
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this.browser;
  }

  async connect(options) {
    try {
      this.prefixedLogger.log('Launching browser...');
      this.browser = await _puppeteer2.default.connect(options);
      this.testConfig.newWindow = true;
    } catch (error) {
      this._logError(error);
      throw new Error('Failed to launch the browser');
    }
    return this.browser;
  }

  async newPage() {
    try {
      this.page = await this.browser.newPage();
    } catch (error) {
      this._logError(error);
    }
    return this.page;
  }

  async mockRequests(options) {
    if (!this.error) {
      try {
        const mockeerOptions = Object.assign({}, options, { page: this.page }); // eslint-disable-line prefer-object-spread/prefer-object-spread
        await (0, _mockeer2.default)(this.browser, mockeerOptions);
        this.testConfig.imageType = options && options.type || 'png';
        return this.image;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async _handleContinueFunc(target, property, args) {
    if (!this.error) {
      try {
        this._logStep(property);
        return (0, _functions.isFunc)(target[property]) ? await target[property](...args) : await target[property];
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  _handleFunc(target, property, args) {
    if (!this.error) {
      try {
        this._logStep(`${target}.${property}`);
        if (target === 'page') {
          if (this[property]) {
            return (0, _functions.isFunc)(this[property]) ? (0, _functions.handleAsyncFunc)(this, property, args) : this[property];
          }
          return (0, _functions.isFunc)(this.page[property]) ? (0, _functions.handleAsyncFunc)(this.page, property, args) : this.page[property];
        }
        return (0, _functions.isFunc)(this.page[target][property]) ? (0, _functions.handleAsyncFunc)(this.page[target], property, args) : this.page[target][property];
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async screenshot(options) {
    if (!this.error) {
      try {
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = options && options.type || 'png';
        return this.image;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async capture(options) {
    if (!this.error) {
      try {
        _logger2.default.warn(`capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
        this.image = await this.page.screenshot(options);
        this.testConfig.imageType = options && options.type || 'png';
        return this.image;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async wait(value) {
    if (!this.error) {
      try {
        _logger2.default.warn(`wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
        return await this.page.waitFor(value);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async execute(expression) {
    if (!this.error) {
      try {
        _logger2.default.warn(`execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
        return await this.page.evaluate(expression);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async resize(viewport) {
    if (!this.error) {
      try {
        _logger2.default.warn(`resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
        return await this.page.setViewport(viewport);
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  async freezeImage(selector) {
    if (!this.error) {
      try {
        const strFunc = (0, _functionToString2.default)(_freezeImage2.default, selector);
        const result = await this.page.evaluate(strFunc);
        this.prefixedLogger.log(`Freezing image ${selector} in browser`);
        if (!result) {
          this._logError(`Unable to freeze image with selector ${selector}`);
        }
        return result;
      } catch (error) {
        this._logError(error);
      }
    }
    return null;
  }

  isJest() {
    try {
      this.testConfig.isJest = expect && (0, _functions.isFunc)(expect.getState);
      if (this.testConfig.isJest) {
        this.testStats = expect.getState() || null;
        this.prefixedLogger = _logger2.default.prefix(this.testStats.currentTestName);
        this.testConfig.testPath = this.testStats.testPath;
        this.testConfig.isUpdate = this.testStats.snapshotState._updateSnapshot === 'all' || false;
      } else {
        this.testId = this.testConfig.testId;
      }
    } catch (error) {
      this.testConfig.isJest = false;
      this.testId = this.testConfig.testId;
    }
  }

  async toMatchSnapshot(image, callback) {
    let resultCallback;
    if (image && !(0, _functions.isFunc)(image)) {
      this.image = image;
    } else if ((0, _functions.isFunc)(image)) {
      resultCallback = image;
    }
    if (callback && (0, _functions.isFunc)(callback)) {
      resultCallback = callback;
    }
    if (this.testConfig.isJest && !this.testConfig.testNameProvided) {
      this.testConfig.testName = this.testStats.currentTestName;
    } else {
      this.testConfig.testName = this.testConfig.testName;
    }
    this.testId += 1;
    const result = await this._evaluateResult();
    if (resultCallback) {
      resultCallback({
        testConfig: this.testConfig,
        testResult: this.result
      });
    }
    return result;
  }

  async _evaluateResult() {
    if (!this.error) {
      try {
        this.result = await (0, _compareImage2.default)(this.image, this.globalConfig, this.testConfig);
      } catch (error) {
        this._logError(error);
      }
      if (this.error) {
        return false;
      }
      if (this.testConfig.isJest === true) {
        const { toMatchImageSnapshot } = _jestMatchers2.default;
        expect.extend({ toMatchImageSnapshot });
        expect(this.result).toMatchImageSnapshot(this.testStats);
      }
      if (this.result.matched || this.result.updated || this.result.added) {
        return true;
      }
    }
    if (this.testConfig.isJest && this.error) {
      const { toNotError } = _jestMatchers2.default;
      expect.extend({ toNotError });
      expect(this.error).toNotError(this.testStats);
    }
    return false;
  }

  async close() {
    if (!this.error) {
      try {
        if (this.testConfig.newWindow) {
          await this.browser.close();
        } else {
          await this.page.close();
        }
      } catch (error) {
        this._logError(error);
        return false;
      }
    }
    return true;
  }
}

exports.default = Target;
module.exports = Target;
//# sourceMappingURL=target.js.map