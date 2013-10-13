/* global describe, it, before */
/* jshint expr: true */

var expect = require('chai').expect;
var errman = require('../');

describe('errman', function () {
  it('should register an error type', function () {
    errman.registerType('BadMojoError', {});
    expect(errman.BadMojoError).to.exist;
  });
});