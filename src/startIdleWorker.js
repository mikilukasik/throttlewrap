const startIdleWorker = function startIdleWorker() {
  const idleWorker = this.workers.find(worker => worker.idle);
  if (idleWorker) idleWorker.doWork(true);
};

module.exports = startIdleWorker;
