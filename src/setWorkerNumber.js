const setWorkerNumber = function setWorkerNumber() {
  const {
    workers,
    createWorker,
    q,
    rescheduleWorkers,
  } = this;

  const setTo = this.threads > 1 ? Math.floor(this.threads) : 1;
  const diff = setTo - workers.length;

  if (diff === 0) return;
  if (diff > 0) {
    for (let i = 0; i < diff; i += 1) {
      const worker = createWorker();
      workers.push(worker);
      if (q.length) worker.doWork(true);
    }
    return;
  }

  workers.splice(0, -diff).forEach(worker => worker.stop());
  rescheduleWorkers();
};

module.exports = setWorkerNumber;
