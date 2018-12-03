/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const tw = require('..');

describe('callback type', () => {
  it('callback will be called', (done) => {
    const wrapped = tw.wrap((foo, cb) => cb(null, true), {
      threads: 1,
    });
    wrapped('foo', (err, res) => {
      expect(err).to.eql(null);
      expect(res).to.be.true;
      done();
    }).catch(done);
  });
});
