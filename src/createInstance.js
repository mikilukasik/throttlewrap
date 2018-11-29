const rescheduleWorkers = require('./rescheduleWorkers');

const defaultOptions = { isError: (err, res, rejected) => err || rejected };

const createInstance = (fn, _options = {}) => {
  const options = Object.assign({}, defaultOptions, { fn }, typeof fn === 'function' ? _options : fn);
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
    rules,
    threadsMin,
    threadsMax,
  } = options;

  let {
    interval,
    intervalMin,
    intervalMax,
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
    options.rules = options.rules.map(r => (typeof r === 'function' ? r.bind({}) : Object.assign({}, r)));
    if (options.rules.length === 0) delete options.rules;
  }

  const instance = {
    q: [],
    workers: [],
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
    lastErrorTime: null,
    lastSuccessTime: null,
    firstCallTime: null,
    nextFreeTimeslot: Date.now(),
  };

  instance.rescheduleWorkers = rescheduleWorkers.bind(instance);

  return instance;
};

module.exports = createInstance;
