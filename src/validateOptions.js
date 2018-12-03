const validateOptions = function validateOptions({
  interval,
  threads,
  threadsMin,
  rules,
}) {
  if (!interval && !threads) throw new Error('Throttle wrapper needs rpm, rps, interval or threads defined');
  if (threadsMin < 1) throw new Error(`threadsMin has to be 1 or larger, can be omitted. Received ${threadsMin}`);
  if (rules && !Array.isArray(rules)) throw new Error('Throttle wrapper rules need to be defined as an array');
};

module.exports = validateOptions;
