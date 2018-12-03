const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

const res = () => Promise.resolve();
const rej = () => Promise.reject();

describe('object rules', () => {
  it('can add extra threads using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 500, fnDuration: 10 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      rules: [{
        condition: { noErrorPeriod: 120 },
        action: { threads: { add: 10 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(33);
      done();
    }).catch(done);
  });

  it('can set number of threads using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 300, fnDuration: 10 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      rules: [{
        condition: { noErrorPeriod: 120 },
        action: { threads: { set: 25 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(25);
      done();
    }).catch(done);
  });

  it('using threadsMax limits the number of threads added by an object rule', (done) => {
    const tester = createTester({ runs: 500, fnDuration: 10 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      threadsMax: 25,
      rules: [{
        condition: { noErrorPeriod: 120 },
        action: { threads: { mul: 10 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(25);
      done();
    }).catch(done);
  });

  it('can remove threads using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({
      runs: 300,
      fnDuration: 20,
      rejectAll: true,
      checkWorkerNumberAfter: 240,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 25,
      rules: [{
        condition: { noSuccessPeriod: 160 },
        action: { threads: { sub: 10 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(15);
      done();
    }).catch(done);
  });

  it('can slow down using errorRate in an object rule', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 25,
      fns: [res, res, rej, rej, res, res, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 40,
      rules: [{
        condition: {
          errorRate: {
            period: 65,
            gt: 0.5,
          },
        },
        action: {
          rpm: {
            div: 2,
          },
        },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(247);
      expect(took).to.be.lessThan(280);
      done();
    }).catch(done);
  });

  it('can slow down using successCount in an object rule', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 20,
      fns: [res, rej, rej, res, res, rej, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 40,
      rules: [{
        condition: {
          successCount: {
            period: 60,
            lt: 2,
          },
        },
        action: {
          rpm: {
            div: 1.5,
          },
        },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(260);
      expect(took).to.be.lessThan(293);
      done();
    }).catch(done);
  });

  it('can speed up using errorRate in an object rule', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 50,
      fns: [res, res, rej, rej, res, rej, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 20,
      rules: [{
        condition: {
          errorRate: {
            period: 60,
            lte: 0.5,
          },
        },
        action: {
          interval: {
            div: 1.25,
          },
        },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(349);
      expect(took).to.be.lessThan(382);
      done();
    }).catch(done);
  });

  it('can slow down using errorCount in an object rule', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 25,
      fns: [rej, rej, rej, res, res, res, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 40,
      rules: [{
        condition: {
          errorCount: {
            period: 75,
            gte: 2,
          },
        },
        action: {
          rpm: {
            div: 1.2,
          },
        },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(212);
      expect(took).to.be.lessThan(245);
      done();
    }).catch(done);
  });

  it('can speed up using successRate in an object rule', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 75,
      fns: [res, res, rej, rej, res, rej, rej, rej],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 20,
      rules: [{
        condition: {
          successRate: {
            period: 125,
            is: 1,
          },
        },
        action: {
          rpm: {
            mul: 2,
          },
        },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(322);
      expect(took).to.be.lessThan(355);
      done();
    }).catch(done);
  });

  it('removing threads immediately removes suspended workers', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 100,
      rejectAll: true,
      checkWorkerNumberAfter: 200,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 8,
      rps: 40,
      rules: [{
        condition: { noSuccessPeriod: 80 },
        action: { threads: { sub: 7 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(tester.maxSimultaneousCalls).to.eql(1);
      expect(took).to.be.greaterThan(422);
      expect(took).to.be.lessThan(455);
      done();
    }).catch(done);
  });

  it('number of threads can not fall below 1 on a threaded instance', (done) => {
    const tester = createTester({
      runs: 80,
      fnDuration: 6,
      rejectAll: true,
      checkWorkerNumberAfter: 75,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 25,
      rules: [{
        condition: { noSuccessPeriod: 7 },
        action: { threads: { div: 4 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(1);
      expect(tw(wrapped).threads).to.eql(1);
      done();
    }).catch(done);
  });

  it('using threadsMin limits the number of threads removed by an object rule', (done) => {
    const tester = createTester({
      runs: 300,
      fnDuration: 25,
      rejectAll: true,
      checkWorkerNumberAfter: 300,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 25,
      threadsMin: 20,
      rules: [{
        condition: { noSuccessPeriod: 200 },
        action: { threads: { sub: 10 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ maxSimultaneousCalls }) => {
      expect(maxSimultaneousCalls).to.eql(20);
      done();
    }).catch(done);
  });

  it('can multiply rps using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [{
        condition: { noErrorPeriod: 100 },
        action: { rps: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(272);
      expect(took).to.be.lessThan(305);
      expect(tw(wrapped).interval).to.eql(15.625);
      done();
    }).catch(done);
  });

  it('can set rpm using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [{
        condition: { noErrorPeriod: 200 },
        action: { rpm: { set: 1920 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(31.25);
      done();
    }).catch(done);
  });

  it('interval cannot fall below 0', (done) => {
    const tester = createTester({ runs: 100, fnDuration: 8 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      interval: 40,
      rules: [{
        condition: { noErrorPeriod: 80 },
        action: { interval: { sub: 25 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(0);
      done();
    }).catch(done);
  });

  it('can divide rps using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 20, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 2400,
      rules: [{
        condition: { noSuccessPeriod: 140 },
        action: { rps: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(367);
      expect(took).to.be.lessThan(400);
      expect(tw(wrapped).interval).to.eql(100);
      done();
    }).catch(done);
  });

  it('can set rps using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 25, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 1920,
      rules: [{
        condition: { noSuccessPeriod: 175 },
        action: { rps: { set: 40 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(() => {
      expect(tw(wrapped).interval).to.eql(25);
      done();
    }).catch(done);
  });

  it('can multiply interval using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 20, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 2400,
      rules: [{
        condition: { noSuccessPeriod: 140 },
        action: { interval: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(367);
      expect(took).to.be.lessThan(400);
      expect(tw(wrapped).interval).to.eql(100);
      done();
    }).catch(done);
  });

  it('can divide interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [{
        condition: { noErrorPeriod: 100 },
        action: { interval: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(272);
      expect(took).to.be.lessThan(305);
      expect(tw(wrapped).interval).to.eql(15.625);
      done();
    }).catch(done);
  });

  it('can add to interval using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 5, fnDuration: 25, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 1920,
      rules: [{
        condition: { noSuccessPeriod: 37.5 },
        action: { interval: { add: 75 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(297);
      expect(took).to.be.lessThan(330);
      expect(tw(wrapped).interval).to.eql(256.25);
      done();
    }).catch(done);
  });

  it('can subtract from interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [{
        condition: { noErrorPeriod: 70 },
        action: { interval: { sub: 12.5 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(284);
      expect(took).to.be.lessThan(318);
      expect(tw(wrapped).interval).to.eql(25);
      done();
    }).catch(done);
  });

  it('can set interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rules: [{
        condition: { noErrorPeriod: 65 },
        action: { interval: { set: 25 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(25);
      done();
    }).catch(done);
  });

  it('Setting rpmMax limits the effect of a speed up object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 960,
      rpmMax: 1200,
      rules: [{
        condition: { noErrorPeriod: 100 },
        action: { rpm: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(309);
      expect(took).to.be.lessThan(343);
      expect(tw(wrapped).interval).to.eql(50);
      done();
    }).catch(done);
  });

  it('Setting rpmMin limits the effect of a slow down object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 20, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 2400,
      rpmMin: 1500,
      rules: [{
        condition: { noSuccessPeriod: 140 },
        action: { rps: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(327);
      expect(took).to.be.lessThan(360);
      expect(tw(wrapped).interval).to.eql(40);
      done();
    }).catch(done);
  });
});
