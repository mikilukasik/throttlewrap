module.exports = function rescheduleWorkers(oldInterval) {
  const suspendedWorkers = this.workers.filter(w => w.timeoutId !== null);
  suspendedWorkers.forEach(({ timeoutId }) => {
    clearTimeout(timeoutId);
    this.nextFreeTimeslot -= oldInterval;
  });
  suspendedWorkers.forEach(w => w.doWork(true));
};
