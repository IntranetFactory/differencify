'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _paths = require('./utils/paths');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const saveDiff = (diff, diffPath) => new Promise((resolve, reject) => {
  const cb = (error, obj) => {
    if (error) {
      reject(error);
    }
    resolve(obj);
  };
  diff.image.write(diffPath, cb);
});

const cleanUpImages = images => {
  images.forEach(image => {
    try {
      _fs2.default.unlinkSync(image);
    } catch (e) {
      // ignore error as left over image may not exist
    }
  });
};

const compareImage = async (capturedImage, globalConfig, testConfig) => {
  const prefixedLogger = _logger2.default.prefix(testConfig.testName);
  const snapshotsDir = globalConfig.imageSnapshotPathProvided ? _path2.default.resolve(globalConfig.imageSnapshotPath) : (0, _paths.getSnapshotsDir)(testConfig, globalConfig);

  const snapshotPath = (0, _paths.getSnapshotPath)(snapshotsDir, testConfig);

  const diffDir = (0, _paths.getDiffDir)(snapshotsDir);
  const diffPath = (0, _paths.getDiffPath)(diffDir, testConfig);

  const currentImageDir = (0, _paths.getCurrentImageDir)(snapshotsDir);
  const currentImagePath = (0, _paths.getCurrentImagePath)(currentImageDir, testConfig);

  cleanUpImages([diffPath, currentImagePath]);

  if (_fs2.default.existsSync(snapshotPath) && !testConfig.isUpdate) {
    let snapshotImage;
    try {
      snapshotImage = await _jimp2.default.read(snapshotPath);
    } catch (error) {
      prefixedLogger.error(`failed to read reference image: ${snapshotPath}`);
      prefixedLogger.trace(error);
      return { error: 'failed to read reference image', matched: false };
    }
    let testImage;
    try {
      testImage = await _jimp2.default.read(capturedImage);
    } catch (error) {
      prefixedLogger.error('failed to read current screenshot image');
      prefixedLogger.trace(error);
      return { error: 'failed to read current screenshot image', matched: false };
    }
    prefixedLogger.log('comparing...');
    const distance = _jimp2.default.distance(snapshotImage, testImage);
    const diff = _jimp2.default.diff(snapshotImage, testImage, globalConfig.mismatchThreshold);
    if (distance <= globalConfig.mismatchThreshold && diff.percent <= globalConfig.mismatchThreshold) {
      prefixedLogger.log('no mismatch found ✅');
      return {
        snapshotPath, distance, diffPercent: diff.percent, matched: true
      };
    }
    if (globalConfig.saveCurrentImage) {
      try {
        if (!_fs2.default.existsSync(currentImageDir)) {
          _fs2.default.mkdirSync(currentImageDir);
        }
        if (_fs2.default.existsSync(currentImagePath)) {
          _fs2.default.unlinkSync(currentImagePath);
        }
        _fs2.default.writeFileSync(currentImagePath, capturedImage);
      } catch (error) {
        prefixedLogger.error(`failed to save the current image: ${currentImagePath}`);
        prefixedLogger.trace(error);
      }
    }
    if (globalConfig.saveDifferencifiedImage) {
      try {
        if (!_fs2.default.existsSync(diffDir)) {
          _fs2.default.mkdirSync(diffDir);
        }
        if (_fs2.default.existsSync(diffPath)) {
          _fs2.default.unlinkSync(diffPath);
        }
        await saveDiff(diff, diffPath);
        prefixedLogger.log(`saved the diff image to disk at ${diffPath}`);
      } catch (error) {
        prefixedLogger.error(`failed to save the diff image: ${diffPath}`);
        prefixedLogger.trace(error);
      }
    }

    prefixedLogger.error(`mismatch found❗
      Result:
        distance: ${distance}
        diff: ${diff.percent}
        misMatchThreshold: ${globalConfig.mismatchThreshold}
    `);
    return {
      snapshotPath, distance, diffPercent: diff.percent, diffPath, matched: false
    };
  }
  prefixedLogger.log(`screenshot saved in -> ${snapshotPath}`);
  if (_fs2.default.existsSync(diffPath)) {
    _fs2.default.unlinkSync(diffPath);
  }
  if (!_fs2.default.existsSync(snapshotsDir)) {
    _fs2.default.mkdirSync(snapshotsDir);
  }
  _fs2.default.writeFileSync(snapshotPath, capturedImage);
  return testConfig.isUpdate ? { updated: true } : { added: true };
};

exports.default = compareImage;
//# sourceMappingURL=compareImage.js.map