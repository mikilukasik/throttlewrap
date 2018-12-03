const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('rpm & threads', () => {
  it('with { rps: 100, threads: 1 }, 4 runs of a 75ms func take ~300ms', (done) => {
    const tester = createTester({ runs: 4, fnDuration: 75 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 100, threads: 1 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(297);
      expect(took).to.be.lessThan(330);
      done();
    }).catch(done);
  });

  it('with { rps: 10, threads: 2 }, 3 runs of a 200ms func take ~400ms', (done) => {
    const tester = createTester({ runs: 3, fnDuration: 200 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 10, threads: 2 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(397);
      expect(took).to.be.lessThan(430);
      done();
    }).catch(done);
  });

  it('with { rps: 25, threads: 3 }, 6 runs of a 150ms func take ~380ms', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 150 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 25, threads: 3 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(377);
      expect(took).to.be.lessThan(410);
      done();
    }).catch(done);
  });

  it('with { rps: 50, threads: 4 }, 7 runs of a 120ms func take ~280ms', (done) => {
    const tester = createTester({ runs: 7, fnDuration: 120 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 50, threads: 4 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(277);
      expect(took).to.be.lessThan(310);
      done();
    }).catch(done);
  });
});
