const rescheduleWorkers = require('./rescheduleWorkers');

const defaultOptions = { isError: (err, res, rejected) => err || rejected };

const createInstance = (_fn, _options) => {
  const options = Object.assign({}, defaultOptions, { fn: _fn }, typeof _fn === 'function' ? _options : _fn);
  const {
    rpm,
    rpmMin,
    rpmMax,
    rps,
    rpsMin,
    rpsMax,
    threads,
    type,
    isError,
    threadsMin,
    threadsMax,
    fn,
  } = options;

  let {
    interval,
    intervalMin,
    intervalMax,
    statsPeriod,
    rules,
  } = options;

  if (rpm) interval = 60000 / rpm;
  if (rps) interval = 1000 / rps;
  if (rpmMin) intervalMax = 60000 / rpmMin;
  if (rpsMin) intervalMax = 1000 / rpsMin;
  if (rpmMax) intervalMin = 60000 / rpmMax;
  if (rpsMax) intervalMin = 1000 / rpsMax;

  if (!interval && !threads) throw new Error('Throttle wrapper needs rpm, rps, inteval or threads defined');
  if (threadsMin < 1) throw new Error(`threadsMin has to be 1 or larger, can be omitted. Received ${threadsMin}`);

  if (options.rules) {
    if (!Array.isArray(options.rules)) throw new Error('Throttle wrapper rules need to be defined as an array');
    rules = rules.map(r => (typeof r === 'function' ? r.bind({}) : JSON.parse(JSON.stringify(r))));
    statsPeriod = statsPeriod || rules
      .filter(r => typeof r === 'object')
      .reduce((period, {
        condition: {
          errorRate,
          successRate,
          errorCount,
          successCount,
        },
      }) => Math.max(
        (errorRate || successRate || errorCount || successCount || {}).period,
        period,
      ), 0);
    if (rules.length === 0) rules = null;
  }

  const instance = {
    q: [],
    workers: [],
    errorTimes: [],
    successTimes: [],
    fn,
    threads,
    type,
    threadsMin,
    threadsMax,
    interval,
    intervalMin,
    intervalMax,
    isError,
    rules,
    statsPeriod,
    lastErrorTime: null,
    lastSuccessTime: null,
    firstCallTime: null,
    nextFreeTimeslot: Date.now(),
  };

  instance.rescheduleWorkers = rescheduleWorkers.bind(instance);

  return instance;
};

module.exports = createInstance;
