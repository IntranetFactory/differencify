'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PrefixedLogger {
  constructor(logger, prefix) {
    this.logger = logger;
    this.prefix = _chalk2.default.cyan(`${prefix}:`);
  }

  enable() {
    this.logger.enable();
  }

  log(...args) {
    this.logger.log(this.prefix, ...args);
  }

  warn(...args) {
    this.logger.warn(this.prefix, ...args);
  }

  trace(...args) {
    this.logger.trace(this.prefix, ...args);
  }

  error(...args) {
    this.logger.error(this.prefix, ...args);
  }
} /* eslint-disable no-console */


class Logger {
  constructor() {
    if (!Logger.instance) {
      Logger.instance = this;
      this.enabled = false;
    }
    return Logger.instance;
  }

  prefix(prefix) {
    return new PrefixedLogger(this, prefix);
  }

  enable() {
    this.enabled = true;
  }

  static getTime() {
    return _chalk2.default.inverse(new Date().toLocaleTimeString());
  }

  log(...args) {
    if (this.enabled) {
      console.log(Logger.getTime(), ...args);
    }
  }

  warn(...args) {
    if (this.enabled) {
      console.warn(Logger.getTime(), ...args);
    }
  }

  trace(...args) {
    if (this.enabled) {
      console.trace(Logger.getTime(), ...args);
    }
  }

  error(...args) {
    if (this.enabled) {
      console.error(Logger.getTime(), _chalk2.default.red(...args));
    }
  }
}

const instance = new Logger();

exports.default = instance;
//# sourceMappingURL=logger.js.map