
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

module.exports = {
  isNoMatch,
  getTimesFromStats,
  getStatsForPeriod,
};
