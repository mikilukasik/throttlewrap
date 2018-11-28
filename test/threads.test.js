const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('threads', () => {
  it('setting threads to 1 allows one call at a time', (done) => {
    const tester = createTester({ runs: 5 });
    const wrapped = tw.wrap(tester.fnToThrottle, { threads: 1 });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(1);
      done();
    }).catch(done);
  });

  it('setting threads to 3 allows three calls at a time', (done) => {
    const tester = createTester({ runs: 10 });
    const wrapped = tw.wrap(tester.fnToThrottle, { threads: 3 });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(3);
      done();
    }).catch(done);
  });

  it('omitting threads allows unlimited simultaneous calls', (done) => {
    const tester = createTester({ runs: 20 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rpm: 999999 });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(20);
      done();
    }).catch(done);
  });

  it('with { threads: 2 }, 10 runs of a 300ms func take ~1.5 second', (done) => {
    const tester = createTester({ runs: 10, fnDuration: 300 });
    const wrapped = tw.wrap(tester.fnToThrottle, { threads: 2 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1495);
      expect(took).to.be.lessThan(1550);
      done();
    }).catch(done);
  });
});
