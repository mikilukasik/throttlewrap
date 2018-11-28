const { expect } = require('chai');
const tw = require('..');

describe('callback/promise', () => {
  it('can determine if func was called with callback', () => {
    const wrapped = tw.wrap(() => {}, { threads: 1 });
    wrapped('foo', () => {});
    expect(tw(wrapped).lastCall.type).to.eql('callback');
    wrapped('bar', {}, () => {});
    expect(tw(wrapped).lastCall.type).to.eql('callback');
  });

  it('can determine if func was called without callback (promise)', () => {
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
});
