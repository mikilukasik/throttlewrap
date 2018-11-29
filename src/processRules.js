/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ['instance', 'rule'] }] */ // eslint-disable-line max-len
/*                                    */
/*    anti-pattern for performance    */
/*                                    */

const conditionMet = (rule, instance, now) => {
  const { condition, lastApplied } = rule;
  let result = true;

  if (condition.noErrorPeriod) {
    const noErrorPeriod = now - (instance.lastErrorTime || instance.firstCallTime);
    if (
      condition.noErrorPeriod >= noErrorPeriod
      || (lastApplied && (now - lastApplied < condition.noErrorPeriod))
    ) result = false;
  }

  if (condition.noSuccessPeriod) {
    const noSuccessPeriod = now - (instance.lastSuccessTime || instance.firstCallTime);
    if (
      condition.noSuccessPeriod >= noSuccessPeriod
      || (lastApplied && (now - lastApplied < condition.noSuccessPeriod))
    ) result = false;
  }

  return result;
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
  }

  if (rps) {
    if (rps.mul) instance.interval /= rps.mul;
    if (rps.div) instance.interval *= rps.div;
  }

  if (interval) {
    if (interval.mul) instance.interval *= interval.mul;
    if (interval.div) instance.interval /= interval.div;
    if (interval.add) instance.interval += interval.add;
    if (interval.sub) instance.interval -= interval.sub;
  }

  if (threads) {
    if (threads.mul) instance.threads *= threads.mul;
    if (threads.div) instance.threads /= threads.div;
    if (threads.add) instance.threads += threads.add;
    if (threads.sub) instance.threads -= threads.sub;
  }
};

const processRules = (instance) => {
  if (!instance.rules) return;
  const now = Date.now();
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
