'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentImagePath = exports.getCurrentImageDir = exports.getDiffPath = exports.getSnapshotPath = exports.getDiffDir = exports.getSnapshotsDir = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pkgDir = require('pkg-dir');

var _pkgDir2 = _interopRequireDefault(_pkgDir);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getTestRoot = (testConfig, globalConfig) => {
  let testRoot;
  if (testConfig.isJest) {
    testRoot = _path2.default.dirname(testConfig.testPath);
  } else {
    testRoot = _path2.default.resolve(_pkgDir2.default.sync(), globalConfig.imageSnapshotPath);
  }
  if (!_fs2.default.existsSync(testRoot)) {
    _fs2.default.mkdirSync(testRoot);
  }
  return testRoot;
};

const getSanitizedName = name => name.replace(/\//g, '-');

const getSnapshotsDir = exports.getSnapshotsDir = (testConfig, globalConfig) => _path2.default.join(getTestRoot(testConfig, globalConfig), '__image_snapshots__');

const getDiffDir = exports.getDiffDir = snapshotsDir => _path2.default.join(snapshotsDir, '__differencified_output__');

const getSnapshotPath = exports.getSnapshotPath = (snapshotsDir, testConfig) => {
  if (!snapshotsDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getSnapshotPath');
  }
  const testName = getSanitizedName(testConfig.testName);
  return _path2.default.join(snapshotsDir, `${testName}.snap.${testConfig.imageType || 'png'}`);
};

const getDiffPath = exports.getDiffPath = (diffDir, testConfig) => {
  if (!diffDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getDiffPath');
  }
  const testName = getSanitizedName(testConfig.testName);
  return _path2.default.join(diffDir, `${testName}.differencified.${testConfig.imageType || 'png'}`);
};

const getCurrentImageDir = exports.getCurrentImageDir = snapshotsDir => _path2.default.join(snapshotsDir, '__current_output__');

const getCurrentImagePath = exports.getCurrentImagePath = (currentImageDir, testConfig) => {
  if (!currentImageDir || !testConfig) {
    throw new Error('Incorrect arguments passed to getDiffPath');
  }
  const testName = getSanitizedName(testConfig.testName);
  return _path2.default.join(currentImageDir, `${testName}.current.${testConfig.imageType || 'png'}`);
};
//# sourceMappingURL=paths.js.map