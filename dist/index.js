'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _proxyChain = require('./helpers/proxyChain');

var _proxyChain2 = _interopRequireDefault(_proxyChain);

var _sanitiser = require('./sanitiser');

var _target = require('./target');

var _target2 = _interopRequireDefault(_target);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Differencify {
  constructor(conf) {
    if (conf && conf.debug === true) {
      _logger2.default.enable();
    }
    this.configuration = (0, _sanitiser.sanitiseGlobalConfiguration)(conf);
    this.browser = null;
    this.testId = 0;
  }

  async launchBrowser(options) {
    if (!this.browser) {
      _logger2.default.log('Launching browser...');
      try {
        this.browser = await _puppeteer2.default.launch(options);
      } catch (error) {
        _logger2.default.trace(error);
      }
    } else {
      _logger2.default.log('Using existing browser instance');
    }
  }

  static executablePath() {
    return _puppeteer2.default.executablePath();
  }

  static chromeExecutablePath() {
    return _puppeteer2.default.executablePath();
  }

  async launch(options) {
    this.launchBrowser(options);
  }

  async connectBrowser(options) {
    if (!this.browser) {
      _logger2.default.log('Launching browser...');
      try {
        this.browser = await _puppeteer2.default.connect(options);
      } catch (error) {
        _logger2.default.trace(error);
      }
    } else {
      _logger2.default.log('Using existing browser instance');
    }
  }

  async connect(options) {
    this.connectBrowser(options);
  }

  init(config) {
    this.testId += 1;
    const testConfig = (0, _sanitiser.sanitiseTestConfiguration)(config, this.testId);
    if (testConfig.isUpdate) {
      _logger2.default.warn('Your tests are running on update mode. Test screenshots will be updated');
    }
    const target = new _target2.default(this.browser, this.configuration, testConfig);
    target.isJest();
    const chainedTarget = (0, _proxyChain2.default)(target, testConfig.chain);
    target.chainedTarget = chainedTarget;
    return chainedTarget;
  }

  async cleanup() {
    _logger2.default.log('Closing browser...');
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      _logger2.default.trace(error);
    }
  }
}

exports.default = Differencify;
module.exports = Differencify;
//# sourceMappingURL=index.js.map