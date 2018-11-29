/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('isError', () => {
  it('isError 3rd param gets true when promise gets rejected with no error', (done) => {
    const tester = createTester({ runs: 1, fnDuration: 25, fns: [() => Promise.reject()] });
    let ifErrArgs;
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      isError: (err, res, rejected) => {
        ifErrArgs = { err, res, rejected };
      },
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(ifErrArgs.rejected).to.be.true;
      expect(ifErrArgs.err).to.be.undefined;
      expect(ifErrArgs.res).to.be.undefined;
      done();
    }).catch(done);
  });
});
