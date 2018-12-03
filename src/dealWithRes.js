const dealWithRes = function dealWithRes(job, rejected, err, res) {
  const { worker, instance } = this;
  const { statsPeriod } = instance;

  const jobFinished = Date.now();
  const isResError = instance.isError(err, res, rejected);

  instance.lastError = err;
  instance.lastResult = res;
  instance.lastRejected = rejected;
  instance[isResError ? 'lastErrorTime' : 'lastSuccessTime'] = jobFinished;

  if (statsPeriod) {
    instance[isResError ? 'errorTimes' : 'successTimes'].push(jobFinished);
    const keepFromTime = jobFinished - statsPeriod;
    [instance.successTimes, instance.errorTimes].forEach((timesArray) => {
      const keepFromIndex = timesArray.findIndex(t => t > keepFromTime);
      timesArray.splice(0, keepFromIndex < 0 ? timesArray.length : keepFromIndex);
    });
  }

  instance.processRules(jobFinished);
  instance.setWorkerNumber();
  if (instance.threads) worker.doWork(true);
  job.cb(err, res);
};

module.exports = dealWithRes;
