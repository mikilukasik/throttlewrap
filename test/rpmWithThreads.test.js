const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('rpm & threads', () => {
  it('with { rps: 10, threads: 1 }, 6 runs of a 200ms func take ~1.2 seconds', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 200 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 10, threads: 1 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1195);
      expect(took).to.be.lessThan(1275);
      done();
    }).catch(done);
  });

  it('with { rps: 10, threads: 2 }, 10 runs of a 200ms func take ~1.1 second', (done) => {
    const tester = createTester({ runs: 10, fnDuration: 200 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 10, threads: 2 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1095);
      expect(took).to.be.lessThan(1150);
      done();
    }).catch(done);
  });

  it('with { rps: 10, threads: 5 }, 10 runs of a 300ms func take ~1.2 second', (done) => {
    const tester = createTester({ runs: 10, fnDuration: 300 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 10, threads: 5 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1195);
      expect(took).to.be.lessThan(1250);
      done();
    }).catch(done);
  });

  it('with { rps: 10, threads: 20 }, 10 runs of a 500ms func take ~1.4 second', (done) => {
    const tester = createTester({ runs: 10, fnDuration: 500 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 10, threads: 20 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1395);
      expect(took).to.be.lessThan(1450);
      done();
    }).catch(done);
  });

  it('with { rps: 100, threads: 50 }, 100 runs of a 500ms func take ~1.49 second', (done) => {
    const tester = createTester({ runs: 100, fnDuration: 500 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 100, threads: 50 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1485);
      expect(took).to.be.lessThan(1540);
      done();
    }).catch(done);
  });

  it('with { rps: 25, threads: 3 }, 15 runs of a 200ms func take ~1.08 second', (done) => {
    const tester = createTester({ runs: 15, fnDuration: 200 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 25, threads: 3 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1075);
      expect(took).to.be.lessThan(1130);
      done();
    }).catch(done);
  });
});
