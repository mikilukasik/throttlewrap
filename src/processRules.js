const processRules = function processRules(now) {
  const {
    rules,
    intervalMin,
    intervalMax,
    threadsMin,
    threadsMax,
    interval,
    threads,
  } = this;
  if (!rules) return;

  const len = rules.length;
  for (let i = 0; i < len; i += 1) {
    const rule = this.rules[i];
    if (typeof rule === 'function') {
      const thisDelta = rule(this);
      if (thisDelta) Object.assign(this, thisDelta);
    } else if (this.conditionMet(rule, now)) {
      rule.lastApplied = now;
      this.applyAction(rule);
    }
  }

  if (this.interval < intervalMin) this.interval = intervalMin;
  if (this.interval > intervalMax) this.interval = intervalMax;
  if (this.interval < 0) this.interval = 0;
  if (this.threads < threadsMin) this.threads = threadsMin;
  if (this.threads > threadsMax) this.threads = threadsMax;
  if (threads && this.threads < 1) this.threads = 1;

  if (this.interval !== interval) this.rescheduleWorkers(interval);
};

module.exports = processRules;
