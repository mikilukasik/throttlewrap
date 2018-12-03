const validateOptions = require('./validateOptions');
const getStatsPeriod = require('./getStatsPeriod');

const defaultOptions = { isError: (err, res, rejected) => err || rejected };

const parseOptions = (_fn, _options) => {
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

  validateOptions({
    interval,
    threads,
    threadsMin,
    rules,
  });

  if (rules) {
    rules = rules.map(r => (typeof r === 'function' ? r.bind({}) : JSON.parse(JSON.stringify(r))));
    statsPeriod = statsPeriod || getStatsPeriod(rules);
    if (rules.length === 0) rules = null;
  }

  return {
    threads,
    type,
    isError,
    threadsMin,
    threadsMax,
    fn,
    interval,
    intervalMin,
    intervalMax,
    statsPeriod,
    rules,
  };
};

module.exports = parseOptions;
