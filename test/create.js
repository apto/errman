/* global describe, it, before */
/* jshint expr: true */

var expect = require('chai').expect;
var errman = require('../');

describe('create', function () {
  it('should create a basic error type', function () {
    var BadMojoError = errman.type('BadMojoError', {});
    expect(typeof BadMojoError).to.equal('function');
    try {
      throw new BadMojoError('broken');
    } catch (e) {
      expect(e instanceof BadMojoError).to.be.true;
      expect(e.message).to.equal('broken');
      expect(e.status).to.equal(500);
      expect(e.code).to.equal('BadMojoError');
    }
  });
  it('should create a templated error type', function () {
    var FileNotFoundError = errman.type('FileNotFoundError', {
      message: "File not found: {{filePath}}",
      status: 404
    });
    try {
      throw new FileNotFoundError({filePath: '/foo/bar.txt'});
    } catch (e) {
      expect(e.message).to.equal('File not found: /foo/bar.txt');
      expect(e.status).to.equal(404);
    }
  });
});