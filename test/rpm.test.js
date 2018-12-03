const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('rpm', () => {
  it('with { rpm: 480 }, 3 runs of a 20ms func take ~270ms', (done) => {
    const tester = createTester({ runs: 3, fnDuration: 20 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rpm: 480 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(267);
      expect(took).to.be.lessThan(300);
      done();
    }).catch(done);
  });

  it('with { rps: 20 }, 6 runs of a 80ms func take ~330ms', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 80 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 20 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(327);
      expect(took).to.be.lessThan(360);
      done();
    }).catch(done);
  });
});
