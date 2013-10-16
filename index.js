var minstache = require('minstache');

var toJSON = function (err, showStack) {
  var self = this;
  if (!(err instanceof Error)) {
    err = new self.Error(err);
  }
  var json = {
    status: err.status || 500,
    name: err.name || err.code || 'Unknown',
    code: err.code || err.name || 'unknown',
    message: err.message || '',
    detail: err.detail || {}
  };
  if (showStack) {
    json.stack = err.stack;
  }
  return json;
};

var toError = function (json) {
  var self = this;
  var ErrorType = self.Error;
  if (self.types[json.name]) {
    ErrorType = self.types[json.name];
  }
  var err = new ErrorType(json.detail);
  if (json.stack) {
    err.stack = json.stack;
  }
  return err;
};

var ErrorManager = function (fn) {
  this.types = fn;
  this.registerType('Error');
};

var proto = ErrorManager.prototype;

proto.toJSON = toJSON;
proto.toError = toError;

var errorConstructor = function (name, options, manager) {
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
      if (detail.stack) {
        self.stack = detail.stack;
      }
      if (detail.detail || detail instanceof Error) {
        var err = detail;
        if (manager.types[err.name]) {
          options = manager.types[err.name].options;
          name = err.name;
        }
      }
      if (detail.detail) {
        detail = detail.detail;
      }
      if (options.message) {
        message = minstache(options.message, detail);
      }
    }
    name = name || 'unknown';
    message = message || '';
    self.message = message;
    self.status = options.status || 500;
    self.code = options.code || name;
    self.detail = detail;
    self.name = name;
  };
};

var errorProto = {};

errorProto.toJSON = function (showStack) {
  return this.errman.toJSON(this, showStack);
};

errorProto.typed = function () {
  return this.errman.toError(this);
};

proto.type = function (name, options) {
  var self = this;
  if (typeof name === 'object') {
    options = name;
    name = options.code;
  }
  options = options || {};
  var constructor = errorConstructor(name, options, self);
  constructor.prototype = new Error();
  constructor.prototype.constructor = constructor;
  constructor.prototype.toJSON = errorProto.toJSON;
  constructor.prototype.typed = errorProto.typed;
  constructor.prototype.errman = self;
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
  return fn;
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

module.exports = defaultErrorManager;