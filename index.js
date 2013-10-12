var minstache = require('minstache');

var toJSON = function (err) {
  err = err || this;
  if (!(err instanceof Error)) {
    err = new exports.UnknownError(err);
  }
  return {
    status: err.status || 500,
    code: err.code || err.name,
    message: err.message,
    detail: err.detail || {},
    stack: err.stack
  };
};

var createErrorType = function (name, options) {
  var constructor = function (detail) {
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
    self.message = message;
    self.status = options.status || 500;
    self.code = options.code || name;
    self.detail = detail;
    self.name = name;
  };
  exports[name] = constructor;
  constructor.prototype = new Error();
  constructor.prototype.constructor = constructor;
  constructor.prototype.toJSON = toJSON;
  constructor.options = options;
  return constructor;
};

var errorType = function (typeName, options) {
  options = options || {};
  exports[typeName] = createErrorType(typeName, options);
};

exports.type = errorType;
exports.toJSON = toJSON;

errorType('UnknownError', {
  code: 'unknown_error'
});