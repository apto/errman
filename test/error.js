/* global describe, it, before */
/* jshint expr: true */

var expect = require('chai').expect;
var errman = require('../');

describe('errman', function () {
  it('should register an error type', function () {
    errman.type('BadMojoError', {});
    expect(errman.BadMojoError).to.exist;
  });
});