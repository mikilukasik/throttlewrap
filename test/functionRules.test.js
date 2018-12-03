const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('function rules', () => {
  it('can adjust interval using a function rule by modifying the instance param', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [(instance) => {
        const now = Date.now();
        const noErrorPeriod = now - (instance.lastErrorTime || instance.firstCallTime);
        const shouldSpeedUp = noErrorPeriod >= 100
          && (!this.lastApplied || (now - this.lastApplied > 100));
        if (!shouldSpeedUp) return;
        this.lastApplied = now;
        instance.interval /= 2; // eslint-disable-line no-param-reassign
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(272);
      expect(took).to.be.lessThan(305);
      expect(tw(wrapped).interval).to.eql(15.625);
      done();
    }).catch(done);
  });

  it('can adjust interval using a function rule by returning instance delta', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [({ lastErrorTime, firstCallTime, interval }) => {
        const now = Date.now();
        const noErrorPeriod = now - (lastErrorTime || firstCallTime);
        const shouldSpeedUp = noErrorPeriod >= 100
          && (!this.lastApplied || (now - this.lastApplied > 100));
        if (!shouldSpeedUp) return null;
        this.lastApplied = now;
        return { interval: interval / 2 };
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(272);
      expect(took).to.be.lessThan(305);
      expect(tw(wrapped).interval).to.eql(15.625);
      done();
    }).catch(done);
  });
});
