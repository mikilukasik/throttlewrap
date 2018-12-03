
const stopWorker = function stop() {
  const { worker, instance } = this;
  if (worker.timeoutId) {
    clearTimeout(worker.timeoutId);
    worker.timeoutId = null;
    instance.nextFreeTimeslot -= instance.interval;
    worker.idle = true;
    worker.stopped = true;
    return;
  }
  worker.stopWhenFinished = true;
};

module.exports = stopWorker;
