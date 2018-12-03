function doWork(reschedulable) {
  const { worker, instance } = this;
  const { interval } = instance;
  const { dealWithRes } = worker;

  worker.idle = false;
  worker.timeoutId = null;

  const now = Date.now();
  if (worker.stopWhenFinished) {
    worker.stopped = true;
    worker.idle = true;
    return;
  }

  if (reschedulable) {
    if (instance.nextFreeTimeslot > now) {
      worker.timeoutId = setTimeout(worker.doWork, instance.nextFreeTimeslot - now);
      instance.nextFreeTimeslot += interval;
      return;
    }

    instance.nextFreeTimeslot = now + interval;
  }

  const job = instance.q.shift();
  if (!job) {
    worker.idle = true;
    return;
  }

  if (job.type === 'callback') {
    instance.fn(...job.args, (err, res) => dealWithRes(job, null, err, res));
  } else {
    instance.fn(...job.args).then(
      res => dealWithRes(job, false, null, res),
      err => dealWithRes(job, true, err),
    );
  }

  if (!instance.threads) {
    worker.timeoutId = setTimeout(worker.doWork, instance.nextFreeTimeslot - now);
    instance.nextFreeTimeslot += interval;
  }
}

module.exports = doWork;
