const { isNoMatch, getStatsForPeriod, getTimesFromStats } = require('./rulesHelpers');

const conditionMet = function conditionMet(rule, now) {
  const {
    condition: {
      noErrorPeriod,
      noSuccessPeriod,
      errorRate,
      successRate,
      errorCount,
      successCount,
    },
    lastApplied,
  } = rule;

  const {
    lastErrorTime,
    lastSuccessTime,
    firstCallTime,
  } = this;

  if (noErrorPeriod) {
    if (noErrorPeriod >= now - (lastErrorTime || firstCallTime)) return false;
    if (lastApplied && (now - lastApplied < noErrorPeriod)) return false;
  }

  if (noSuccessPeriod) {
    if (noSuccessPeriod >= now - (lastSuccessTime || firstCallTime)) return false;
    if (lastApplied && (now - lastApplied < noSuccessPeriod)) return false;
  }

  if (errorRate) {
    const checkSince = now - errorRate.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const { errorsInPeriod, totalInPeriod } = getStatsForPeriod(checkSince, this);
    if (isNoMatch(errorsInPeriod / totalInPeriod, errorRate)) return false;
  }

  if (successRate) {
    const checkSince = now - successRate.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const { successInPeriod, totalInPeriod } = getStatsForPeriod(checkSince, this);
    if (isNoMatch(successInPeriod / totalInPeriod, successRate)) return false;
  }

  if (errorCount) {
    const checkSince = now - errorCount.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const errorsInPeriod = getTimesFromStats(this.errorTimes, checkSince);
    if (isNoMatch(errorsInPeriod, errorCount)) return false;
  }

  if (successCount) {
    const checkSince = now - successCount.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const successInPeriod = getTimesFromStats(this.successTimes, checkSince);
    if (isNoMatch(successInPeriod, successCount)) return false;
  }

  return true;
};

module.exports = conditionMet;
