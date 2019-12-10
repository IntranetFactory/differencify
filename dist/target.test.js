'use strict';

var _arguments = arguments;

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _mockeer = require('mockeer');

var _mockeer2 = _interopRequireDefault(_mockeer);

var _target = require('./target');

var _target2 = _interopRequireDefault(_target);

var _defaultConfigs = require('./config/defaultConfigs');

var _functionToString = require('./helpers/functionToString');

var _functionToString2 = _interopRequireDefault(_functionToString);

var _freezeImage = require('./freezeImage');

var _freezeImage2 = _interopRequireDefault(_freezeImage);

var _sanitiser = require('./sanitiser');

var _jestMatchers = require('./utils/jestMatchers');

var _jestMatchers2 = _interopRequireDefault(_jestMatchers);

var _compareImage = require('./compareImage');

var _compareImage2 = _interopRequireDefault(_compareImage);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mockMatcher = jest.fn(() => ({
  message: 'message',
  pass: true
}));

_jestMatchers2.default.toNotError = mockMatcher;
_jestMatchers2.default.toMatchImageSnapshot = mockMatcher;

jest.mock('./compareImage');

const mockKeyboard = {
  press: jest.fn()
};

const pageMocks = {
  goto: jest.fn(),
  click: jest.fn(),
  screenshot: jest.fn(),
  waitFor: jest.fn(),
  evaluate: jest.fn(),
  setViewport: jest.fn(),
  keyboard: mockKeyboard
};

const mockNewPage = jest.fn(() => pageMocks);

jest.mock('puppeteer', () => ({
  launch: jest.fn(() => ({
    newPage: mockNewPage
  })),
  connect: jest.fn(() => ({
    newPage: mockNewPage
  }))
}));

jest.mock('path', () => ({
  join: jest.fn(() => '/'),
  resolve: jest.fn((a, b, c, d) => `root${b}${d}`)
}));

jest.mock('mockeer');

jest.mock('./compareImage', () => jest.fn(arg => new Promise((resolve, reject) => {
  if (arg.screenshots === './screenshots') {
    return resolve('Saving the diff image to disk');
  }
  return reject(new Error('error'));
})));

jest.mock('./helpers/functionToString');

const mockLog = jest.fn();
const mockTrace = jest.fn();
const mockErr = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockErr,
    trace: mockTrace
  })),
  warn: jest.fn()
}));

const browser = _puppeteer2.default.launch();
const target = new _target2.default(browser, _defaultConfigs.testConfig, (0, _sanitiser.sanitiseGlobalConfiguration)(_defaultConfigs.globalConfig));

describe('Target', () => {
  afterEach(() => {
    _puppeteer2.default.launch.mockClear();
    mockLog.mockClear();
    mockTrace.mockClear();
    mockErr.mockClear();
    _functionToString2.default.mockClear();
    mockMatcher.mockClear();
    _compareImage2.default.mockClear();
    target.error = false;
    mockNewPage.mockClear();
    _logger2.default.warn.mockClear();
  });
  beforeEach(() => {
    target.tab = target.browser.newPage();
  });
  it('launch fn', async () => {
    target.browser = null;
    await target.launch({
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000
    });
    expect(mockLog).toHaveBeenCalledWith('Launching browser...');
    expect(_puppeteer2.default.launch).toHaveBeenCalledWith({
      args: [],
      dumpio: false,
      executablePath: undefined,
      headless: true,
      ignoreHTTPSErrors: false,
      slowMo: 0,
      timeout: 30000
    });
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(target.testConfig.newWindow).toEqual(true);
  });
  it('connect fn', async () => {
    target.browser = null;
    await target.connect({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false
    });
    expect(mockLog).toHaveBeenCalledWith('Launching browser...');
    expect(_puppeteer2.default.connect).toHaveBeenCalledWith({
      browserWSEndpoint: 'endpoint',
      ignoreHTTPSErrors: false
    });
    expect(mockNewPage).toHaveBeenCalledTimes(1);
    expect(target.testConfig.newWindow).toEqual(true);
  });
  describe('_handleFunc', () => {
    beforeEach(() => {
      pageMocks.goto.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target._handleFunc('url');
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('will return correct property', async () => {
      target.error = false;
      const result = await target._handleFunc('page', 'testConfig');
      expect(result).toEqual({
        debug: false,
        chain: undefined,
        imageSnapshotPath: 'differencify_reports',
        imageSnapshotPathProvided: true,
        saveDifferencifiedImage: true,
        saveCurrentImage: true,
        mismatchThreshold: 0.001,
        newWindow: true
      });
      expect(mockLog).toHaveBeenCalledWith('Executing page.testConfig step');
    });
    it('will run goto on page', async () => {
      target.error = false;
      await target.newPage();
      const result = await target._handleFunc('page', 'goto', ['http://example.com', {}]);
      expect(pageMocks.goto).toHaveBeenCalledWith('http://example.com', {});
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing page.goto step');
    });
    it('will run press on keyboard', async () => {
      target.error = false;
      await target.newPage();
      const result = await target._handleFunc('keyboard', 'press', _arguments); // eslint-disable-line no-undef
      expect(mockKeyboard.press).toHaveBeenCalledWith(..._arguments); // eslint-disable-line no-undef
      expect(result).toEqual();
      expect(mockLog).toHaveBeenCalledWith('Executing keyboard.press step');
    });
  });
  describe('capture/screenshot', () => {
    beforeEach(() => {
      pageMocks.screenshot.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.capture();
      await target.screenshot();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Will run capture correctly', async () => {
      await target.newPage();
      await target.capture({});
      expect(pageMocks.screenshot).toHaveBeenCalledWith({});
      expect(_logger2.default.warn).toHaveBeenCalledWith(`capture() will be deprecated, use screenshot() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
    it('Will run screenshot correctly', async () => {
      await target.newPage();
      await target.screenshot({});
      expect(pageMocks.screenshot).toHaveBeenCalledWith({});
    });
  });
  describe('mockRequests', () => {
    it('calls Mockeer correctly', async () => {
      await target.mockRequests();
      expect(_mockeer2.default).toHaveBeenCalledTimes(1);
    });
    it('calls Mockeer correctly with options', async () => {
      await target.mockRequests({
        replaceImage: true,
        allowImageRecourses: false
      });
      expect(_mockeer2.default).toHaveBeenCalledWith(expect.any(Object), {
        page: expect.any(Object),
        replaceImage: true,
        allowImageRecourses: false
      });
    });
  });
  describe('wait', () => {
    beforeEach(() => {
      pageMocks.waitFor.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.newPage();
      await target.wait();
      expect(pageMocks.waitFor).not.toHaveBeenCalled();
    });
    it('Will run wait correctly', async () => {
      await target.newPage();
      await target.wait(10);
      expect(pageMocks.waitFor).toHaveBeenCalledWith(10);
      expect(_logger2.default.warn).toHaveBeenCalledWith(`wait() will be deprecated, use waitFor() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('execute', () => {
    beforeEach(() => {
      pageMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.execute();
      expect(pageMocks.evaluate).not.toHaveBeenCalled();
    });
    it('Will run correctly', async () => {
      await target.newPage();
      await target.execute('exp');
      expect(pageMocks.evaluate).toHaveBeenCalledWith('exp');
      expect(_logger2.default.warn).toHaveBeenCalledWith(`execute() will be deprecated, use evaluate() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('resize', () => {
    beforeEach(() => {
      pageMocks.setViewport.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.resize();
      expect(pageMocks.setViewport).not.toHaveBeenCalled();
    });
    it('Will run correctly', async () => {
      await target.resize('exp');
      expect(pageMocks.setViewport).toHaveBeenCalledWith('exp');
      expect(_logger2.default.warn).toHaveBeenCalledWith(`resize() will be deprecated, use setViewport() instead.
          Please read the API docs at https://github.com/NimaSoroush/differencify`);
    });
  });
  describe('toMatchSnapshot', () => {
    it('will set test to jest mode', async () => {
      target.isJest();
      target.toMatchSnapshot();
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName).toEqual('Target toMatchSnapshot will set test to jest mode');
      expect(target.testId).toEqual(1);
      expect(mockTrace).toHaveBeenCalledTimes(0);
    });
    it('will test name with numbers if several times called', async () => {
      target.testId = 0;
      target.isJest();
      target.toMatchSnapshot();
      target.toMatchSnapshot();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName).toEqual('Target toMatchSnapshot will test name with numbers if several times called 1');
      expect(target.testId).toEqual(2);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
    it('Will respect to testName if it is provided', async () => {
      target.testId = 0;
      target.testConfig.testName = 'test';
      target.testConfig.testNameProvided = true;
      target.isJest();
      target.toMatchSnapshot();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName).toEqual('test');
      expect(target.testId).toEqual(1);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
    it('Will respect to testName if it is provided', async () => {
      target.testId = 0;
      target.testConfig.testName = 'test';
      target.testConfig.testNameProvided = true;
      target.isJest();
      target.toMatchSnapshot();
      target.toMatchSnapshot();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
      expect(target.testConfig.testName).toEqual('test 1');
      expect(target.testId).toEqual(2);
      expect(mockErr).toHaveBeenCalledTimes(0);
    });
  });
  describe('isJest', () => {
    it('will set test to jest mode', async () => {
      target.isJest();
      expect(target.testConfig.isJest).toEqual(true);
      expect(target.testStats).not.toBeNull();
    });
  });
  describe('_evaluateResult', () => {
    it('it calls toNotError if error happens in any steps when in jest mode', async () => {
      target.error = new Error('Error happened');
      const result = await target._evaluateResult();
      expect(_jestMatchers2.default.toNotError).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it wont calls toMatchImageSnapshot when in jest mode and compareImage throws', async () => {
      const result = await target._evaluateResult();
      expect(_compareImage2.default).toHaveBeenCalled();
      expect(_jestMatchers2.default.toMatchImageSnapshot).not.toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('it calls toMatchImageSnapshot when in jest mode', async () => {
      _compareImage2.default.mockReturnValueOnce({ matched: true });
      const result = await target._evaluateResult();
      expect(_compareImage2.default).toHaveBeenCalled();
      expect(_jestMatchers2.default.toMatchImageSnapshot).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  });
  describe('FreezeImage', () => {
    beforeEach(() => {
      pageMocks.evaluate.mockClear();
    });
    it('Wont run if error happened', async () => {
      target.error = true;
      await target.freezeImage();
      expect(mockLog).toHaveBeenCalledTimes(0);
    });
    it('Existing selector', async () => {
      pageMocks.evaluate.mockReturnValueOnce(true);
      _functionToString2.default.mockReturnValueOnce('return string function');
      await target.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockErr).toHaveBeenCalledTimes(0);
      expect(pageMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(_functionToString2.default).toHaveBeenCalledWith(_freezeImage2.default, 'selector');
    });
    it('FreezeImage: non-existing selector', async () => {
      pageMocks.evaluate.mockReturnValueOnce(false);
      _functionToString2.default.mockReturnValueOnce('return string function');
      await target.freezeImage('selector');
      expect(mockLog).toHaveBeenCalledWith('Freezing image selector in browser');
      expect(mockTrace).toHaveBeenCalledWith('Unable to freeze image with selector selector');
      expect(pageMocks.evaluate).toHaveBeenCalledWith('return string function');
      expect(_functionToString2.default).toHaveBeenCalledWith(_freezeImage2.default, 'selector');
    });
  });
});
//# sourceMappingURL=target.test.js.map