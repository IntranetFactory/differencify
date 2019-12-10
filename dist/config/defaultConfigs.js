'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const globalConfig = {
  imageSnapshotPath: 'differencify_reports',
  saveDifferencifiedImage: true,
  saveCurrentImage: true,
  debug: false,
  mismatchThreshold: 0.001
};

const testConfig = {
  testName: 'test',
  chain: true,
  isUpdate: false
};

exports.globalConfig = globalConfig;
exports.testConfig = testConfig;
//# sourceMappingURL=defaultConfigs.js.map