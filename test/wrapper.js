const { expect } = require('chai');
const tw = require('..');

describe('wrapper', () => {
  it('Wrapped function determine if it was called with callback', () => {
    const wrapped = tw.wrap(() => {}, { threads: 1 });
    wrapped('foo', () => {});
    expect(tw(wrapped).lastCall.type).to.eql('callback');
    wrapped('bar', {}, () => {});
    expect(tw(wrapped).lastCall.type).to.eql('callback');
  });

  it('Wrapped function determine if it was called without callback (promise)', () => {
    const wrapped = tw.wrap(() => Promise.resolve(), { threads: 1 });
    wrapped('foo').then().catch();
    expect(tw(wrapped).lastCall.type).to.eql('promise');
  });

  it('set type overrides type determined at call', () => {
    const wrapped = tw.wrap(() => Promise.resolve(), { type: 'promise', threads: 1 });
    wrapped('foo', () => { throw new Error(); }).then().catch();
    expect(tw(wrapped).lastCall.type).to.eql('promise');
  });

  it('promise type returns a promise', () => {
    const wrapped = tw.wrap(() => Promise.resolve(), { type: 'promise', threads: 1 });
    const shouldBePromise = wrapped('foo');
    expect(shouldBePromise).to.have.property('then');
  });

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

  it('can be called with 1 argument: wrap({ fn, rpm })', () => {
    const fn = () => {};
    const wrapped = tw.wrap({ fn, rpm: 4 });
    expect(tw(wrapped).fn).to.equal(fn);
  });

  it('throws an error if no interval or threads can be determined', () => {
    expect(() => tw.wrap(() => {}, { type: 'callback' })).to.throw();
  });

  it('throws an error if threadsMin set to < 1', () => {
    expect(() => tw.wrap(() => {}, { threads: 2, threadsMin: 0 })).to.throw();
  });

  it('throws an error if rules are not in an array', () => {
    expect(() => tw.wrap(() => {}, { threads: 2, rules: {} })).to.throw();
  });

  it('rules will be null on instance if got an empty array in options', () => {
    const wrapped = tw.wrap(() => {}, { rules: [], rpm: 4 });
    expect(tw(wrapped).rules).to.equal(null);
  });
});
