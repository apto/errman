/* global describe, it, before */
/* jshint expr: true */

var expect = require('chai').expect;
var errman = require('../');

errman = errman();

describe('serialize', function () {

  var FileNotFoundError = errman.type('FileNotFoundError', {
    message: "File not found: {{filePath}}",
    status: 404,
    code: 'file_not_found'
  });

  it('should serialize an error', function () {
    try {
      throw new FileNotFoundError({filePath: '/foo/bar.txt'});
    } catch (e) {
      var json = e.toJSON();
      expect(json).to.eql({
        name: 'FileNotFoundError',
        status: 404,
        code: 'file_not_found',
        message: 'File not found: /foo/bar.txt',
        detail: {
          filePath: '/foo/bar.txt'
        }
      });
    }
  });
  it('should deserialize an error', function () {
    errman.registerType(FileNotFoundError);
    var err = new errman.Error({
      name: 'FileNotFoundError',
      status: 404,
      code: 'file_not_found',
      message: 'File not found: /foo/bar.txt',
      detail: {
        filePath: '/foo/bar.txt'
      }
    }).typed();
    expect(err instanceof FileNotFoundError).to.be.true;
  });
});