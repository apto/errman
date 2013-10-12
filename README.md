errman
======

[![Build Status](https://secure.travis-ci.org/apto/errman.png)](http://travis-ci.org/apto/errman)

errman is an error helper that lets you:

- Create custom error types that extend from Error and have a proper stacktrace.
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

### Register an error type

```js
var errman = require('errman');

// Create a type with no message template and status code of 500.
errman.type('BadMojoError');

// You can pass a string to your custom error constructor to just set the error
// message old school.
throw new errman.BadMojoError('No way, dude!');
```

### Register an error type with an error template and status code

```js
var errman = require('errman');

// Use mustache template for error message, and set status code to 404.
errman.type('FileNotFoundError', {
  message: 'Could not find file: {{filePath}}',
  status: 404
});

try {
  throw new errman.FileNotFoundError({filePath: '/some/file/path.txt'}); 
} catch (e) {
  console.log(e.message);
}
```

The error message printed to the console will be:

```plain
Could not find file: /some/file/path.txt
```