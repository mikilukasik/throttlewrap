const getStatsPeriod = rules => rules
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

module.exports = getStatsPeriod;
