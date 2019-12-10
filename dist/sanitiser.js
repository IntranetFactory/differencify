'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitiseGlobalConfiguration = exports.sanitiseTestConfiguration = undefined;

var _checkTypes = require('check-types');

var _checkTypes2 = _interopRequireDefault(_checkTypes);

var _typeDetect = require('type-detect');

var _typeDetect2 = _interopRequireDefault(_typeDetect);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _defaultConfigs = require('./config/defaultConfigs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logError = (name, wrongType, correctType) => _logger2.default.error(`Invalid argument ${name} with type ${wrongType} been passed. Argument should be ${correctType}`);

const checkProperty = (obj, property, checkType) => {
  if (!obj) {
    return false;
  }
  const hasProperty = Object.prototype.hasOwnProperty.call(obj, property);
  if (!_checkTypes2.default[checkType](obj[property]) && hasProperty) {
    logError(property, (0, _typeDetect2.default)(obj[property]), checkType);
    return false;
  }
  return hasProperty;
};

const sanitiseTestConfiguration = (conf, testId) => {
  const configuration = {};
  configuration.chain = checkProperty(conf, 'chain', 'boolean') ? conf.chain : _defaultConfigs.testConfig.chain;
  configuration.testNameProvided = checkProperty(conf, 'testName', 'string');
  configuration.testName = configuration.testNameProvided ? conf.testName : _defaultConfigs.testConfig.testName;
  configuration.testId = testId;
  configuration.isUpdate = process.env.update && process.env.update === 'true' ? process.env.update : _defaultConfigs.testConfig.isUpdate;
  return configuration;
};

const sanitiseGlobalConfiguration = conf => {
  const configuration = {};
  configuration.debug = checkProperty(conf, 'debug', 'boolean') ? conf.debug : _defaultConfigs.globalConfig.debug;

  configuration.imageSnapshotPathProvided = checkProperty(conf, 'imageSnapshotPath', 'string');
  configuration.imageSnapshotPath = configuration.imageSnapshotPathProvided ? conf.imageSnapshotPath : _defaultConfigs.globalConfig.imageSnapshotPath;
  configuration.saveDifferencifiedImage = checkProperty(conf, 'saveDifferencifiedImage', 'boolean') ? conf.saveDifferencifiedImage : _defaultConfigs.globalConfig.saveDifferencifiedImage;
  configuration.saveCurrentImage = checkProperty(conf, 'saveCurrentImage', 'boolean') ? conf.saveCurrentImage : _defaultConfigs.globalConfig.saveCurrentImage;
  configuration.mismatchThreshold = checkProperty(conf, 'mismatchThreshold', 'number') ? conf.mismatchThreshold : _defaultConfigs.globalConfig.mismatchThreshold;

  return configuration;
};

exports.sanitiseTestConfiguration = sanitiseTestConfiguration;
exports.sanitiseGlobalConfiguration = sanitiseGlobalConfiguration;
//# sourceMappingURL=sanitiser.js.map