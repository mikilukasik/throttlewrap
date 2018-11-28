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

  it('using threadsMax limits the number of threads added by an object rule', (done) => {
    const tester = createTester({ runs: 500, fnDuration: 25 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      threads: 3,
      threadsMax: 20,
      rules: [{
        condition: { noErrorPeriod: 300 },
        action: { threads: { add: 10 } },
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
        action: { threads: { sub: 10 } },
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

  it('can multiply rpm using noErrorPeriod in an object rule', (done) => {
    const tester = createTester({ runs: 6, fnDuration: 100 });
    const wrapped = tw.wrap(tester.fnToThrottle, {
      rpm: 240,
      rules: [{
        condition: { noErrorPeriod: 400 },
        action: { rpm: { mul: 2 } },
      }],
    });
    tester.run(() => wrapped('foo')).then(({ took }) => {
      expect(took).to.be.greaterThan(1220);
      expect(took).to.be.lessThan(1275);
      expect(tw(wrapped).interval).to.eql(62.5);
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
      expect(took).to.be.greaterThan(1720);
      expect(took).to.be.lessThan(1775);
      expect(tw(wrapped).interval).to.eql(500);
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
      expect(took).to.be.greaterThan(1720);
      expect(took).to.be.lessThan(1775);
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
      expect(took).to.be.greaterThan(1220);
      expect(took).to.be.lessThan(1275);
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
      expect(took).to.be.greaterThan(895);
      expect(took).to.be.lessThan(950);
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
      expect(took).to.be.greaterThan(1245);
      expect(took).to.be.lessThan(1300);
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
      expect(took).to.be.greaterThan(1295);
      expect(took).to.be.lessThan(1350);
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
      expect(took).to.be.greaterThan(1570);
      expect(took).to.be.lessThan(1625);
      expect(tw(wrapped).interval).to.eql(200);
      done();
    }).catch(done);
  });
});
