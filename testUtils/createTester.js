const createTester = ({
  runs = 5,
  fnDuration = 90,
  rejectAll = false,
  checkWorkerNumberAfter = 0,
}) => {
  const tester = {
    runs,
    maxSimultaneousCalls: 0,
    currentActiveCalls: 0,
    resolversWhenDone: [],
    started: null,
    took: null,
    fnToThrottle: () => new Promise((resolve, reject) => {
      const countThread = Date.now() - tester.started >= checkWorkerNumberAfter;
      if (countThread) {
        tester.currentActiveCalls += 1;
        if (tester.currentActiveCalls > tester.maxSimultaneousCalls) {
          tester.maxSimultaneousCalls = tester.currentActiveCalls;
        }
      }
      setTimeout(() => {
        if (countThread) tester.currentActiveCalls -= 1;
        tester.remaining -= 1;
        if (tester.remaining === 0) {
          tester.took = Date.now() - tester.started;
          setTimeout(() => tester.resolversWhenDone.forEach(reso => reso({ took: tester.took })));
        }
        return rejectAll ? reject(new Error()) : resolve();
      }, fnDuration);
    }),
    run: (fn) => {
      tester.remaining = tester.runs;
      tester.started = Date.now();
      for (let i = 0; i < tester.runs; i += 1) {
        fn();
      }
      return tester.finish();
    },
    finish: () => new Promise((resolve) => {
      /* istanbul ignore if */
      if (tester.took) {
        resolve({ took: tester.took });
        return;
      }
      tester.resolversWhenDone.push(resolve);
    }),
  };
  return tester;
};

module.exports = createTester;
