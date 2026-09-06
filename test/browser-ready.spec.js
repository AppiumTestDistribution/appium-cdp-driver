const { expect } = require('chai');
const { pickPageTargets } = require('../build/scripts/browserReady.js');

// Shape taken from a real /json/list response on Android: one page plus a
// worker, both carrying a webSocketDebuggerUrl.
const PAGE = {
  type: 'page',
  url: 'http://appium.io/docs/en/latest/',
  webSocketDebuggerUrl: 'ws://localhost:60107/devtools/page/0',
};
const WORKER = {
  type: 'worker',
  url: '',
  webSocketDebuggerUrl: 'ws://localhost:60107/devtools/page/13B8F77E',
};

describe('pickPageTargets', function () {
  it('selects page targets', function () {
    expect(pickPageTargets([PAGE, WORKER])).to.deep.equal([PAGE]);
  });

  it('does not treat a worker as a page', function () {
    // the browser has a devtools socket but nothing to attach to; accepting this
    // is what produced "Debug list is empty or invalid" later in session creation
    expect(pickPageTargets([WORKER])).to.have.lengthOf(0);
  });

  it('ignores targets without a debugger url', function () {
    expect(pickPageTargets([{ type: 'page', url: 'about:blank' }])).to.have.lengthOf(0);
  });

  it('tolerates an empty or malformed list', function () {
    expect(pickPageTargets([])).to.have.lengthOf(0);
    expect(pickPageTargets(null)).to.have.lengthOf(0);
    expect(pickPageTargets(undefined)).to.have.lengthOf(0);
    expect(pickPageTargets([null, undefined])).to.have.lengthOf(0);
  });
});
