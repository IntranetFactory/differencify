'use strict';

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _compareImage = require('./compareImage');

var _compareImage2 = _interopRequireDefault(_compareImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('jimp', () => ({
  read: jest.fn(),
  distance: jest.fn(),
  diff: jest.fn()
})); /* eslint-disable prefer-object-spread/prefer-object-spread */


jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));

jest.mock('path', () => ({
  dirname: jest.fn(() => '/parent'),
  join: jest.fn((a, b) => `${a}/${b}`),
  resolve: jest.fn((a, b) => `${a}${b || ''}`)
}));

jest.mock('pkg-dir', () => ({
  sync: () => ''
}));

const mockLog = jest.fn();
const mockError = jest.fn();
const mockTrace = jest.fn();
jest.mock('./utils/logger', () => ({
  prefix: jest.fn(() => ({
    log: mockLog,
    error: mockError,
    trace: mockTrace
  }))
}));

const mockConfig = {
  imageSnapshotPath: './differencify_report',
  imageSnapshotPathProvided: false,
  saveDifferencifiedImage: true,
  saveCurrentImage: true,
  mismatchThreshold: 0.01
};

const mockTestConfig = {
  isUpdate: false,
  isJest: true,
  testName: 'test',
  testPath: '/src/test.js',
  imageType: 'png'
};

describe('Compare Image', () => {
  beforeEach(() => {
    _fs2.default.writeFileSync.mockClear();
    _fs2.default.existsSync.mockClear();
    _jimp2.default.distance.mockReturnValue(0);
    _jimp2.default.diff.mockReturnValue({ percent: 0 });
  });
  describe('Jest mode', () => {
    it('ًWill create image snapshot when there is no snapshot', async () => {
      const result = await (0, _compareImage2.default)(Object, mockConfig, {
        isUpdate: false,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png'
      });
      expect(result).toEqual({ added: true });
      expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('/parent/__image_snapshots__/test.snap.png', Object);
    });
    it('ًWill update snapshot when isUpdate=true', async () => {
      const result = await (0, _compareImage2.default)(Object, mockConfig, {
        isUpdate: true,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png'
      });
      expect(result).toEqual({ updated: true });
      expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('/parent/__image_snapshots__/test.snap.png', Object);
    });
    it('respects to imageSnapshotPath when in jest mode', async () => {
      const newGlobalConfig = Object.assign({}, mockConfig, {
        imageSnapshotPath: './someImagePath',
        imageSnapshotPathProvided: true
      });
      const result = await (0, _compareImage2.default)(Object, newGlobalConfig, {
        isUpdate: true,
        isJest: true,
        testName: 'test',
        testPath: '/src/test.js',
        imageType: 'png'
      });
      expect(result).toEqual({ updated: true });
      expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('./someImagePath/test.snap.png', Object);
    });
  });

  describe('non-jest mode', () => {
    it('ًWill create image snapshot when there is no snapshot', async () => {
      const result = await (0, _compareImage2.default)(Object, mockConfig, {
        isUpdate: false,
        isJest: false,
        testName: 'test',
        imageType: 'png'
      });
      expect(result).toEqual({ added: true });
      expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('./differencify_report/__image_snapshots__/test.snap.png', Object);
    });
    it('ًWill update snapshot when isUpdate=true', async () => {
      const result = await (0, _compareImage2.default)(Object, mockConfig, {
        isUpdate: true,
        isJest: false,
        testName: 'test',
        imageType: 'png'
      });
      expect(result).toEqual({ updated: true });
      expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('./differencify_report/__image_snapshots__/test.snap.png', Object);
    });
  });

  it('sanitizes paths', async () => {
    await (0, _compareImage2.default)(Object, mockConfig, {
      testName: 'check /test.html',
      testPath: '/src/test.js',
      imageType: 'png'
    });
    expect(_fs2.default.writeFileSync).toHaveBeenCalledWith('./differencify_report/__image_snapshots__/check -test.html.snap.png', Object);
  });

  it('throws correct error if it cannot read image', async () => {
    expect.assertions(3);
    _jimp2.default.read.mockReturnValueOnce(Promise.reject(new Error('error1')));
    _fs2.default.existsSync.mockReturnValue(true);
    const result = await (0, _compareImage2.default)(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      error: 'failed to read reference image',
      matched: false
    });
    expect(mockTrace).toHaveBeenCalledWith(new Error('error1'));
    expect(mockError).toHaveBeenCalledWith('failed to read reference image: /parent/__image_snapshots__/test.snap.png');
  });

  it('returns correct value if difference below threshold', async () => {
    expect.assertions(2);
    _fs2.default.existsSync.mockReturnValueOnce(true);
    const result = await (0, _compareImage2.default)(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPercent: 0,
      distance: 0,
      matched: true,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });
    expect(mockLog).toHaveBeenCalledWith('no mismatch found ✅');
  });

  it('returns correct value if difference below threshold when the threshold is set to zero', async () => {
    expect.assertions(2);

    _fs2.default.existsSync.mockReturnValueOnce(true);

    const config = {
      mockConfig,
      mismatchThreshold: 0
    };
    const result = await (0, _compareImage2.default)(Object, config, mockTestConfig);

    expect(result).toEqual({
      diffPercent: 0,
      distance: 0,
      matched: true,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });

    expect(mockLog).toHaveBeenCalledWith('no mismatch found ✅');
  });

  it('returns mismatch found❗ if only difference above threshold', async () => {
    _jimp2.default.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: jest.fn((path, cb) => {
          cb();
        })
      }
    });
    _fs2.default.existsSync.mockReturnValueOnce(true);
    const result = await (0, _compareImage2.default)(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0
        diff: 0.02
        misMatchThreshold: 0.01
    `);
  });

  it('returns mismatch found❗ if only distance above threshold', async () => {
    _jimp2.default.distance.mockReturnValue(0.02);
    _jimp2.default.diff.mockReturnValue({
      percent: 0,
      image: {
        write: jest.fn((path, cb) => {
          cb();
        })
      }
    });
    _fs2.default.existsSync.mockReturnValueOnce(true);
    const result = await (0, _compareImage2.default)(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0.02
        diff: 0
        misMatchThreshold: 0.01
    `);
  });

  it('throws error if distance and difference are above threshold', async () => {
    _jimp2.default.distance.mockReturnValue(0.02);
    _jimp2.default.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: jest.fn((path, cb) => {
          cb();
        })
      }
    });
    _fs2.default.existsSync.mockReturnValueOnce(true);
    const result = await (0, _compareImage2.default)(Object, mockConfig, mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });
    expect(mockError).toHaveBeenCalledWith(`mismatch found❗
      Result:
        distance: 0.02
        diff: 0.02
        misMatchThreshold: 0.01
    `);
  });

  it('writes to disk diff image if saveDifferencifiedImage is true', async () => {
    _jimp2.default.distance.mockReturnValue(0.02);
    _fs2.default.existsSync.mockReturnValue(true);
    const mockWrite = jest.fn((path, cb) => {
      cb();
    });
    _jimp2.default.diff.mockReturnValue({
      percent: 0.02,
      image: {
        write: mockWrite
      }
    });
    const result = await (0, _compareImage2.default)(Object, Object.assign({}, mockConfig, { saveDifferencifiedImage: true }), mockTestConfig);
    expect(result).toEqual({
      diffPath: '/parent/__image_snapshots__/__differencified_output__/test.differencified.png',
      matched: false,
      diffPercent: 0.02,
      distance: 0.02,
      snapshotPath: '/parent/__image_snapshots__/test.snap.png'
    });
    expect(mockWrite).toHaveBeenCalledWith('/parent/__image_snapshots__/__differencified_output__/test.differencified.png', expect.any(Function));
  });
});
//# sourceMappingURL=compareImage.test.js.map