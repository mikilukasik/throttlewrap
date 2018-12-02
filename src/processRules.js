/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ['instance', 'rule'] }] */ // eslint-disable-line max-len
/*                                    */
/*    anti-pattern for performance    */
/*                                    */

const isNoMatch = (value, {
  gt,
  gte,
  lt,
  lte,
  is,
}) => {
  if (gt && value <= gt) return true;
  if (gte && value < gte) return true;
  if (lt && value >= lt) return true;
  if (lte && value > lte) return true;
  if (is && value !== is) return true;
  return false;
};

const getTimesFromStats = (statTimes, since) => {
  const firstIndex = statTimes.findIndex(t => t >= since);
  return firstIndex < 0 ? 0 : statTimes.length - firstIndex;
};

const getStatsForPeriod = (checkSince, { errorTimes, successTimes }) => {
  const errorsInPeriod = getTimesFromStats(errorTimes, checkSince);
  const successInPeriod = getTimesFromStats(successTimes, checkSince);
  const totalInPeriod = errorsInPeriod + successInPeriod;
  return { errorsInPeriod, successInPeriod, totalInPeriod };
};

const conditionMet = (rule, instance, now) => {
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
  } = instance;

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
    const { errorsInPeriod, totalInPeriod } = getStatsForPeriod(checkSince, instance);
    if (isNoMatch(errorsInPeriod / totalInPeriod, errorRate)) return false;
  }

  if (successRate) {
    const checkSince = now - successRate.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const { successInPeriod, totalInPeriod } = getStatsForPeriod(checkSince, instance);
    if (isNoMatch(successInPeriod / totalInPeriod, successRate)) return false;
  }

  if (errorCount) {
    const checkSince = now - errorCount.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const errorsInPeriod = getTimesFromStats(instance.errorTimes, checkSince);
    if (isNoMatch(errorsInPeriod, errorCount)) return false;
  }

  if (successCount) {
    const checkSince = now - successCount.period;
    if ((lastApplied && lastApplied > checkSince) || (firstCallTime > checkSince)) return false;
    const successInPeriod = getTimesFromStats(instance.successTimes, checkSince);
    if (isNoMatch(successInPeriod, successCount)) return false;
  }

  return true;
};

const applyAction = (rule, instance) => {
  const {
    rpm,
    rps,
    threads,
    interval,
  } = rule.action;

  if (rpm) {
    if (rpm.mul) instance.interval /= rpm.mul;
    if (rpm.div) instance.interval *= rpm.div;
    if (rpm.set) instance.interval = 60000 / rpm.set;
  }

  if (rps) {
    if (rps.mul) instance.interval /= rps.mul;
    if (rps.div) instance.interval *= rps.div;
    if (rps.set) instance.interval = 1000 / rps.set;
  }

  if (interval) {
    if (interval.mul) instance.interval *= interval.mul;
    if (interval.div) instance.interval /= interval.div;
    if (interval.add) instance.interval += interval.add;
    if (interval.sub) instance.interval -= interval.sub;
    if (interval.set) instance.interval = interval.set;
  }

  if (threads) {
    if (threads.mul) instance.threads *= threads.mul;
    if (threads.div) instance.threads /= threads.div;
    if (threads.add) instance.threads += threads.add;
    if (threads.sub) instance.threads -= threads.sub;
    if (threads.set) instance.threads = threads.set;
  }
};

const processRules = (instance, now) => {
  if (!instance.rules) return;
  const wasThreaded = instance.threads;
  const oldInterval = instance.interval;

  instance.rules.forEach((rule) => {
    if (typeof rule === 'function') {
      const instanceDelta = rule(instance);
      if (instanceDelta) Object.assign(instance, instanceDelta);
      return;
    }
    if (conditionMet(rule, instance, now)) {
      rule.lastApplied = now;
      applyAction(rule, instance);
    }
  });

  if (instance.interval < instance.intervalMin) instance.interval = instance.intervalMin;
  if (instance.interval > instance.intervalMax) instance.interval = instance.intervalMax;
  if (instance.interval < 0) instance.interval = 0;
  if (instance.threads < instance.threadsMin) instance.threads = instance.threadsMin;
  if (instance.threads > instance.threadsMax) instance.threads = instance.threadsMax;
  if (wasThreaded && instance.threads < 1) instance.threads = 1;

  if (instance.interval !== oldInterval) instance.rescheduleWorkers(oldInterval);
};

module.exports = processRules;
