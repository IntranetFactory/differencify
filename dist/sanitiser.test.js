'use strict';

var _sanitiser = require('./sanitiser');

describe('sanitiser', () => {
  describe('sanitise global configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = (0, _sanitiser.sanitiseGlobalConfiguration)({});
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if screenshots config provided', () => {
      const configuration = (0, _sanitiser.sanitiseGlobalConfiguration)({ screenshots: './somewhere' });
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if puppeteer specific configuration provided', () => {
      const configuration = (0, _sanitiser.sanitiseGlobalConfiguration)({ browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'] });
      expect(configuration).toMatchSnapshot();
    });
  });
  describe('sanitise test configuration', () => {
    it('sanitise if no config provided', () => {
      const configuration = (0, _sanitiser.sanitiseTestConfiguration)({}, 1);
      expect(configuration).toMatchSnapshot();
    });
    it('sanitise if some config provided', () => {
      const configuration = (0, _sanitiser.sanitiseTestConfiguration)({ newWindow: true }, 1);
      expect(configuration).toMatchSnapshot();
    });
  });
});
//# sourceMappingURL=sanitiser.test.js.map