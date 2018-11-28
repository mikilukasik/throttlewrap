const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('rpm', () => {
  it('setting rpm gets converted to interval', () => {
    const wrapped = tw.wrap(() => {}, { rpm: 10 });
    expect(tw(wrapped).interval).to.eql(6000);
    const wrapped2 = tw.wrap(() => {}, { rpm: 120 });
    expect(tw(wrapped2).interval).to.eql(500);
  });

  it('setting rps gets converted to interval', () => {
    const wrapped = tw.wrap(() => {}, { rps: 4 });
    expect(tw(wrapped).interval).to.eql(250);
    const wrapped2 = tw.wrap(() => {}, { rps: 5 });
    expect(tw(wrapped2).interval).to.eql(200);
  });

  it('setting rpmMin gets converted to intervalMax', () => {
    const wrapped = tw.wrap(() => {}, { rpm: 10, rpmMin: 5 });
    expect(tw(wrapped).intervalMax).to.eql(12000);
    const wrapped2 = tw.wrap(() => {}, { rpm: 120, rpmMin: 12 });
    expect(tw(wrapped2).intervalMax).to.eql(5000);
  });

  it('setting rpsMin gets converted to intervalMax', () => {
    const wrapped = tw.wrap(() => {}, { rps: 4, rpsMin: 2 });
    expect(tw(wrapped).intervalMax).to.eql(500);
    const wrapped2 = tw.wrap(() => {}, { rps: 5, rpsMin: 4 });
    expect(tw(wrapped2).intervalMax).to.eql(250);
  });

  it('setting rpmMax gets converted to intervalMin', () => {
    const wrapped = tw.wrap(() => {}, { rpm: 10, rpmMax: 5 });
    expect(tw(wrapped).intervalMin).to.eql(12000);
    const wrapped2 = tw.wrap(() => {}, { rpm: 120, rpmMax: 12 });
    expect(tw(wrapped2).intervalMin).to.eql(5000);
  });

  it('setting rpsMax gets converted to intervalMin', () => {
    const wrapped = tw.wrap(() => {}, { rps: 4, rpsMax: 2 });
    expect(tw(wrapped).intervalMin).to.eql(500);
    const wrapped2 = tw.wrap(() => {}, { rps: 5, rpsMax: 4 });
    expect(tw(wrapped2).intervalMin).to.eql(250);
  });

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
