'use strict';

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _proxyChain = require('./helpers/proxyChain');

var _proxyChain2 = _interopRequireDefault(_proxyChain);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _target = require('./target');

var _target2 = _interopRequireDefault(_target);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('./target');
jest.mock('./helpers/proxyChain');

jest.mock('puppeteer', () => ({
  launch: jest.fn()
}));

const mockLog = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog
  })),
  log: jest.fn(),
  error: jest.fn(),
  enable: jest.fn(),
  warn: jest.fn()
}));

const differencify = new _index2.default();

describe('Differencify', () => {
  afterEach(() => {
    mockLog.mockClear();
    _logger2.default.log.mockClear();
    differencify.browser = null;
    differencify.testId = 0;
    _puppeteer2.default.launch.mockClear();
    _proxyChain2.default.mockClear();
  });
  it('launchBrowser', async () => {
    const browserOptions = {
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000
    };
    await differencify.launchBrowser(browserOptions);
    expect(_puppeteer2.default.launch).toHaveBeenCalledWith(browserOptions);
    await differencify.launch(browserOptions);
    expect(_puppeteer2.default.launch).toHaveBeenCalledWith(browserOptions);
    expect(_logger2.default.log).toHaveBeenCalledWith('Launching browser...');
  });
  it('connect', async () => {
    const browserOptions = {
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false
    };
    await differencify.launchBrowser(browserOptions);
    expect(_puppeteer2.default.launch).toHaveBeenCalledWith(browserOptions);
    await differencify.launch(browserOptions);
    expect(_puppeteer2.default.launch).toHaveBeenCalledWith(browserOptions);
    expect(_logger2.default.log).toHaveBeenCalledWith('Launching browser...');
  });
  it('does not relaunch browser if one browser instance exists', async () => {
    differencify.browser = true;
    await differencify.launchBrowser();
    expect(_puppeteer2.default.launch).toHaveBeenCalledTimes(0);
    expect(_logger2.default.log).toHaveBeenCalledWith('Using existing browser instance');
  });
  it('init', async () => {
    await differencify.init();
    expect(_proxyChain2.default).toHaveBeenCalledTimes(1);
  });
  it('init without chaining', async () => {
    process.env.update = true;
    await differencify.init({ chain: false });
    expect(_target2.default).toHaveBeenCalledWith(null, {
      debug: false,
      mismatchThreshold: 0.001,
      saveDifferencifiedImage: true,
      saveCurrentImage: true,
      imageSnapshotPath: 'differencify_reports',
      imageSnapshotPathProvided: false
    }, {
      chain: false,
      testName: 'test',
      testNameProvided: false,
      isUpdate: 'true',
      testId: 1
    });
    expect(_proxyChain2.default).toHaveBeenCalledTimes(1);
    expect(_logger2.default.warn).toHaveBeenCalledWith('Your tests are running on update mode. Test screenshots will be updated');
    delete process.env.update;
  });
  describe('Cleanup fn', () => {
    it('closes browser instance', async () => {
      const close = jest.fn();
      differencify.browser = {
        close
      };
      await differencify.cleanup();
      expect(close).toHaveBeenCalledTimes(1);
      expect(_logger2.default.log).toHaveBeenCalledWith('Closing browser...');
    });
    it('will not close if there is no browser instance', async () => {
      differencify.init();
      await differencify.cleanup();
      expect(differencify.browser).toBeNull();
      expect(_logger2.default.log).toHaveBeenCalledWith('Closing browser...');
    });
  });
});
//# sourceMappingURL=index.test.js.map