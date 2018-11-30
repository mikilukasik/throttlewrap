const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('rpm', () => {
  it('with { rpm: 120 }, 3 runs of a 200ms func take ~1.2 seconds', (done) => {
    const tester = createTester({ runs: 3, fnDuration: 200 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rpm: 120 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1195);
      expect(took).to.be.lessThan(1250);
      done();
    }).catch(done);
  });

  it('with { rps: 4 }, 6 runs of a 400ms func take ~1.65 seconds', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 400 });
    const wrapped = tw.wrap(tester.fnToThrottle, { rps: 4 });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1645);
      expect(took).to.be.lessThan(1700);
      done();
    }).catch(done);
  });
});
