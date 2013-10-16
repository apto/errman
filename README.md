errman
======

[![Build Status](https://secure.travis-ci.org/apto/errman.png)](http://travis-ci.org/apto/errman)

errman is an error helper that lets you:

- Create custom error types that extend from Error and have a proper stacktrace.
- Register your custom error types with a default error registry, or create a
  new errman instance to scope your error registry.
- Use mustache-style templates to set a common error message for all instances
  of your error type. Supply an options object with your new error, and the
  key/value pairs are used in your message template. This way, you can have
  consistent error messages and only have to change the template in one place.
- Convert error instances to JSON objects for serializing over HTTP.
- Convert JSON error objects back to error instances for deserializing from
  HTTP.
- Set a status code for error types to relate to HTTP status codes.

## Installation

### npm

npm install errman

### component

component install errman

## Usage

### Create an error type

```js
var errman = require('errman');

// Create a type with no message template and status code of 500.
var BadMojoError = errman.type('BadMojoError');

// You can pass a string to your custom error constructor to just set the error
// message old school.
throw new BadMojoError('No way, dude!');
```

### Create an error type with an error template and status code

```js
var errman = require('errman');

// Use mustache template for error message, and set status code to 404.
var FileNotFoundError = errman.type('FileNotFoundError', {
  message: 'Could not find file: {{filePath}}',
  status: 404
});

try {
  throw new FileNotFoundError({filePath: '/some/file/path.txt'}); 
} catch (e) {
  console.log(e.message);
}
```

The error message printed to the console will be:

```plain
Could not find file: /some/file/path.txt
```

### Register an error type

```js
var errman = require('errman');

errman.registerType('BadMojoError');
errman.registerType('FileNotFoundError', {
  message: 'Could not find file: {{filePath}}',
  status: 404
});

// Registered errors are available on the errman module.
throw new errman.BadMojoError;
throw new errman.FileNotFoundError({filePath: '/some/file/path.txt'}); 
```

### Create a new errman scope

```js
var errman = require('errman');

errman.registerType('BadMojoError');

var myErrMan = errman();

myErrMan.registerType('FileNotFoundError', {
  message: 'Could not find file: {{filePath}}',
  status: 404
});

throw new errman.BadMojoError;
throw new myErrMan.FileNotFoundError({filePath: '/some/file/path.txt'});
// This won't work:
throw new myErrMan.BadMojoError;
// Neither will this:
throw new errMan.FileNotFoundError({filePath: '/some/file/path.txt'});
```

### Serialize error to JSON

```js
var errman = require('errman');

errman.registerType('FileNotFoundError', {
  message: 'Could not find file: {{filePath}}',
  status: 404,
  code: 'file_not_found'
});

try {
  throw new FileNotFoundError({filePath: '/some/file/path.txt'}); 
} catch (e) {
  console.log(e.toJSON());
}
```

The JSON will be:

```js
{
  "name": "FileNotFoundError",
  "status": 404,
  "code": "file_not_found",
  "message": "Could not find file: /some/file/path.txt"
  "detail": {
    "filePath": "/some/file/path.txt"
  }
}
```

If you want to provide the stacktrace in the JSON, do this:

```
console.log(e.toJSON(true));
```

### Deserialize an error from JSON

The simplest way to deserialize an error is:

```js
var err = errman.toError({
  "name": "FileNotFoundError",
  "status": 404,
  "code": "file_not_found",
  "message": "Could not find file: /some/file/path.txt"
  "detail": {
    "filePath": "/some/file/path.txt"
  }
});

assert(err instanceof errman.FileNotFoundError); // true
```

This may be fine in some cases. However, note that in the example above, the
stacktrace was not in the JSON, so the stack will be reported as some place in
the errman source, where the error is created. If you want the stacktrace to be
where you deserialize the error, then you'll need to do this:

```js
var err = new errman.Error({
  "name": "FileNotFoundError",
  "status": 404,
  "code": "file_not_found",
  "message": "Could not find file: /some/file/path.txt"
  "detail": {
    "filePath": "/some/file/path.txt"
  }
});

assert(err instanceof errman.FileNotFoundError); // false
```

This leverages the default Error constructor available on all errman instances.
However, note that the error is (of course) not of the specific type. You can
combine these together though like this:

```js
var err = errman.toError(new errman.Error({
  "name": "FileNotFoundError",
  "status": 404,
  "code": "file_not_found",
  "message": "Could not find file: /some/file/path.txt"
  "detail": {
    "filePath": "/some/file/path.txt"
  }
}));

assert(err instanceof errman.FileNotFoundError); // true
```

This creates an error with the appropriate stacktrace and then converts it into
a specifically typed error. You can also use some method sugar:


```js
var err = new errman.Error({
  "name": "FileNotFoundError",
  "status": 404,
  "code": "file_not_found",
  "message": "Could not find file: /some/file/path.txt"
  "detail": {
    "filePath": "/some/file/path.txt"
  }
}).typed();

assert(err instanceof errman.FileNotFoundError); // true
```