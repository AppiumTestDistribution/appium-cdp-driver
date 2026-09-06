const { expect } = require('chai');
const { resolveAdbPort } = require('../build/src/adb.js');

const DEFAULT = 5037;

describe('resolveAdbPort', function () {
  let previous;

  beforeEach(function () {
    previous = process.env.CDP_ADB_PORT;
    delete process.env.CDP_ADB_PORT;
  });

  afterEach(function () {
    if (previous === undefined) {
      delete process.env.CDP_ADB_PORT;
    } else {
      process.env.CDP_ADB_PORT = previous;
    }
  });

  it('defaults to 5037 when nothing is supplied', function () {
    expect(resolveAdbPort(undefined)).to.equal(DEFAULT);
  });

  it('defaults to 5037 for unusable values', function () {
    for (const value of [null, '', 'abc', 0, -1]) {
      expect(resolveAdbPort(value)).to.equal(DEFAULT);
    }
  });

  it('accepts the capability as a number or a string', function () {
    expect(resolveAdbPort(5038)).to.equal(5038);
    expect(resolveAdbPort('5038')).to.equal(5038);
  });

  it('falls back to CDP_ADB_PORT when no capability is given', function () {
    process.env.CDP_ADB_PORT = '5040';
    expect(resolveAdbPort(undefined)).to.equal(5040);
  });

  it('prefers the capability over the environment variable', function () {
    process.env.CDP_ADB_PORT = '5040';
    expect(resolveAdbPort(5041)).to.equal(5041);
  });

  it('ignores an unusable environment variable', function () {
    process.env.CDP_ADB_PORT = 'nope';
    expect(resolveAdbPort(undefined)).to.equal(DEFAULT);
  });
});
