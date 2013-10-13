var minstache = require('minstache');

var UnknownError;

var toJSON = function (err) {
  err = err || this;
  if (!(err instanceof Error)) {
    err = new UnknownError(err);
  }
  return {
    status: err.status || 500,
    code: err.code || err.name || 'unknown',
    message: err.message || '',
    detail: err.detail || {},
    stack: err.stack
  };
};

var ErrorManager = function (fn) {
  this.types = fn;
};

var proto = ErrorManager.prototype;

proto.toJSON = toJSON;

var errorConstructor = function (name, options) {
  return function (detail) {
    var self = this;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(self, self.constructor || self);
    }
    var message;
    if (typeof detail === 'string') {
      message = detail;
      detail = {};
    } else {
      detail = detail || {};
      if (options.message) {
        message = minstache(options.message, detail);
      }
    }
    name = name || 'unknown';
    message = message || '';
    detail = detail || {};
    self.message = message;
    self.status = options.status || 500;
    self.code = options.code || name;
    self.detail = detail;
    self.name = name;
  };
};

proto.type = function (name, options) {
  var self = this;
  if (typeof name === 'object') {
    options = name;
    name = options.code;
  }
  options = options || {};
  var constructor = errorConstructor(name, options);
  constructor.prototype = new Error();
  constructor.prototype.constructor = constructor;
  constructor.prototype.toJSON = toJSON;
  constructor.options = options;
  constructor.typeName = name;
  return constructor;
};

proto.registerType = function (fn, name, options) {
  if (typeof fn === 'string') {
    options = name;
    name = fn;
    var errorType = this.type(name, options);
    return this.registerType(errorType);
  }
  this.types[name || fn.typeName] = fn;
};

var createErrorManager = function () {
  var errorManagerFn = function () {
    return createErrorManager();
  };
  var errorManager = new ErrorManager(errorManagerFn);
  Object.keys(proto).forEach(function (key) {
    errorManagerFn[key] = proto[key].bind(errorManager);
  });
  return errorManagerFn;
};

var defaultErrorManager = createErrorManager();

UnknownError = defaultErrorManager.type('UnknownError');

module.exports = defaultErrorManager;