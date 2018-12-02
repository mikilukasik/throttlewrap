const { expect } = require('chai');
const tw = require('..');
const createTester = require('../testUtils/createTester');

describe('object rules', () => {
  it('can add extra threads using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 500, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      rules: [{
        condition: { noErrorPeriod: 300 },
        action: { threads: { add: 10 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(33);
      done();
    }).catch(done);
  });

  it('can set number of threads using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 300, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      rules: [{
        condition: { noErrorPeriod: 300 },
        action: { threads: { set: 13 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(13);
      done();
    }).catch(done);
  });

  it('using threadsMax limits the number of threads added by an object rule', (done) => {
    const tester = createTester({ runs: 500, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      threadsMax: 20,
      rules: [{
        condition: { noErrorPeriod: 300 },
        action: { threads: { mul: 10 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(20);
      done();
    }).catch(done);
  });

  it('can remove threads using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({
      runs: 300,
      fnDuration: 25,
      rejectAll: true,
      checkWorkerNumberAfter: 300,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 25,
      rules: [{
        condition: { noSuccessPeriod: 200 },
        action: { threads: { sub: 10 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(15);
      done();
    }).catch(done);
  });

  it('can slow down using errorRate in an object rule', (done) => {
    const res = () => Promise.resolve();
    const rej = () => Promise.reject();
    const tester = createTester({
      runs: 8,
      fnDuration: 100,
      fns: [res, res, rej, rej, res, res, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 10,
      rules: [{
        condition: {
          errorRate: {
            period: 250,
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
      expect(took).to.be.greaterThan(995);
      expect(took).to.be.lessThan(1050);
      done();
    }).catch(done);
  });

  it('can slow down using successCount in an object rule', (done) => {
    const res = () => Promise.resolve();
    const rej = () => Promise.reject();
    const tester = createTester({
      runs: 8,
      fnDuration: 100,
      fns: [res, rej, rej, res, res, rej, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 10,
      rules: [{
        condition: {
          successCount: {
            period: 240,
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
      expect(took).to.be.greaterThan(1015);
      expect(took).to.be.lessThan(1070);
      done();
    }).catch(done);
  });

  it('can speed up using errorRate in an object rule', (done) => {
    const res = () => Promise.resolve();
    const rej = () => Promise.reject();
    const tester = createTester({
      runs: 8,
      fnDuration: 100,
      fns: [res, res, rej, rej, res, rej, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 10,
      rules: [{
        condition: {
          errorRate: {
            period: 120,
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
      expect(took).to.be.greaterThan(699);
      expect(took).to.be.lessThan(754);
      done();
    }).catch(done);
  });

  it('can slow down using errorCount in an object rule', (done) => {
    const res = () => Promise.resolve();
    const rej = () => Promise.reject();
    const tester = createTester({
      runs: 8,
      fnDuration: 100,
      fns: [rej, rej, rej, res, res, res, res, res],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 10,
      rules: [{
        condition: {
          errorCount: {
            period: 300,
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
      expect(took).to.be.greaterThan(855);
      expect(took).to.be.lessThan(910);
      done();
    }).catch(done);
  });

  it('can speed up using successRate in an object rule', (done) => {
    const res = () => Promise.resolve();
    const rej = () => Promise.reject();
    const tester = createTester({
      runs: 8,
      fnDuration: 150,
      fns: [res, res, rej, rej, res, rej, rej, rej],
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rps: 10,
      rules: [{
        condition: {
          successRate: {
            period: 250,
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
      expect(took).to.be.greaterThan(645);
      expect(took).to.be.lessThan(700);
      done();
    }).catch(done);
  });

  it('removing threads immediately removes suspended workers', (done) => {
    const tester = createTester({
      runs: 8,
      fnDuration: 400,
      rejectAll: true,
      checkWorkerNumberAfter: 800,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 8,
      rps: 10,
      rules: [{
        condition: { noSuccessPeriod: 310 },
        action: { threads: { sub: 7 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(tester.maxSimultaneousCalls).to.eql(1);
      expect(took).to.be.greaterThan(1695);
      expect(took).to.be.lessThan(1750);
      done();
    }).catch(done);
  });

  it('number of threads can not fall below 1 on a threaded instance', (done) => {
    const tester = createTester({
      runs: 120,
      fnDuration: 24,
      rejectAll: true,
      checkWorkerNumberAfter: 300,
    });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 25,
      rules: [{
        condition: { noSuccessPeriod: 30 },
        action: { threads: { div: 4 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(1);
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
    tester.run(() => wrapped('foo').catch(() => {})).then(() => {
      expect(tester.maxSimultaneousCalls).to.eql(20);
      done();
    }).catch(done);
  });

  it('can multiply rps using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 400 },
        action: { rps: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1095);
      expect(took).to.be.lessThan(1150);
      expect(tw(wrapped).interval).to.eql(62.5);
      done();
    }).catch(done);
  });

  it('can set rpm using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 400 },
        action: { rpm: { set: 480 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(125);
      done();
    }).catch(done);
  });

  it('interval cannot fall below 0', (done) => {
    const tester = createTester({ runs: 100, fnDuration: 15 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      interval: 40,
      rules: [{
        condition: { noErrorPeriod: 150 },
        action: { interval: { sub: 25 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(0);
      done();
    }).catch(done);
  });

  it('can divide rps using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 100, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 480,
      rules: [{
        condition: { noSuccessPeriod: 700 },
        action: { rps: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(1845);
      expect(took).to.be.lessThan(1900);
      expect(tw(wrapped).interval).to.eql(500);
      done();
    }).catch(done);
  });

  it('can set rps using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 100, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 480,
      rules: [{
        condition: { noSuccessPeriod: 700 },
        action: { rps: { set: 20 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(() => {
      expect(tw(wrapped).interval).to.eql(50);
      done();
    }).catch(done);
  });

  it('can multiply interval using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 100, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 480,
      rules: [{
        condition: { noSuccessPeriod: 700 },
        action: { interval: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(1845);
      expect(took).to.be.lessThan(1900);
      expect(tw(wrapped).interval).to.eql(500);
      done();
    }).catch(done);
  });

  it('can divide interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 400 },
        action: { interval: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1095);
      expect(took).to.be.lessThan(1150);
      expect(tw(wrapped).interval).to.eql(62.5);
      done();
    }).catch(done);
  });

  it('can add to interval using noSuccessPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 5, fnDuration: 100, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 480,
      rules: [{
        condition: { noSuccessPeriod: 150 },
        action: { interval: { add: 300 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(1195);
      expect(took).to.be.lessThan(1250);
      expect(tw(wrapped).interval).to.eql(1025);
      done();
    }).catch(done);
  });

  it('can subtract from interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 260 },
        action: { interval: { sub: 50 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1145);
      expect(took).to.be.lessThan(1200);
      expect(tw(wrapped).interval).to.eql(100);
      done();
    }).catch(done);
  });

  it('can set interval using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 260 },
        action: { interval: { set: 100 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(() => {
      expect(tw(wrapped).interval).to.eql(100);
      done();
    }).catch(done);
  });

  it('Setting rpmMax limits the effect of a speed up object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rpmMax: 300,
      rules: [{
        condition: { noErrorPeriod: 400 },
        action: { rpm: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1245);
      expect(took).to.be.lessThan(1300);
      expect(tw(wrapped).interval).to.eql(200);
      done();
    }).catch(done);
  });

  it('Setting rpmMin limits the effect of a slow down object rule', (done) => {
    const tester = createTester({ runs: 11, fnDuration: 100, rejectAll: true });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 480,
      rpmMin: 300,
      rules: [{
        condition: { noSuccessPeriod: 700 },
        action: { rps: { div: 2 } },
      }],
    });
    tester.run(() => wrapped('foo').catch(() => {})).then(({ took }) => {
      expect(took).to.be.greaterThan(1645);
      expect(took).to.be.lessThan(1700);
      expect(tw(wrapped).interval).to.eql(200);
      done();
    }).catch(done);
  });
});
