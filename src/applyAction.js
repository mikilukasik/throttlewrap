/* eslint-disable object-curly-newline */

const applyAction = function applyAction(rule) {
  const {
    rpm,
    rps,
    threads,
    interval,
  } = rule.action;

  if (rpm) {
    const { mul, div, set } = rpm;

    if (mul) this.interval /= mul;
    if (div) this.interval *= div;
    if (set) this.interval = 60000 / set;
  }

  if (rps) {
    const { mul, div, set } = rps;

    if (mul) this.interval /= mul;
    if (div) this.interval *= div;
    if (set) this.interval = 1000 / set;
  }

  if (interval) {
    const { mul, div, set, add, sub } = interval;

    if (mul) this.interval *= mul;
    if (div) this.interval /= div;
    if (add) this.interval += add;
    if (sub) this.interval -= sub;
    if (set) this.interval = set;
  }

  if (threads) {
    const { mul, div, set, add, sub } = threads;

    if (mul) this.threads *= mul;
    if (div) this.threads /= div;
    if (add) this.threads += add;
    if (sub) this.threads -= sub;
    if (set) this.threads = set;
  }
};

module.exports = applyAction;
