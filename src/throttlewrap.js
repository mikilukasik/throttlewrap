const processRules = require('./processRules');
const createInstance = require('./createInstance');

const tw = wrapped => wrapped.throttlewrap;
tw.wrap = (_fn, _options) => {
  const instance = createInstance(_fn, _options);
  const { workers } = instance;

  const createWorker = () => {
    const worker = {
      idle: true,
      timeoutId: null,
    };

    worker.stop = () => {
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

    worker.doWork = (reschedulable) => {
      worker.idle = false;
      worker.timeoutId = null;

      const now = Date.now();
      if (reschedulable) {
        if (worker.stopWhenFinished) {
          worker.stopped = true;
          worker.idle = true;
          return;
        }
        if (instance.nextFreeTimeslot > now) {
          worker.timeoutId = setTimeout(worker.doWork, instance.nextFreeTimeslot - now);
          instance.nextFreeTimeslot += instance.interval;
          return;
        }
        instance.nextFreeTimeslot = now + instance.interval;
      }

      const job = instance.q.shift();
      if (!job) {
        worker.idle = true;
        return;
      }

      const dealWithRes = (err, res, rejected) => {
        instance[instance.isError(err, res, rejected) ? 'lastErrorTime' : 'lastSuccessTime'] = Date.now();
        processRules(instance);
        setWorkerNumber(); // eslint-disable-line no-use-before-define
        if (instance.threads) worker.doWork(true);
        job.cb(err, res);
      };

      if (job.type === 'callback') {
        instance.fn(...job.args, dealWithRes);
      } else {
        instance.fn(...job.args).then(
          res => dealWithRes(null, res),
          err => dealWithRes(err, undefined, true),
        );
      }

      if (!instance.threads) {
        worker.timeoutId = setTimeout(worker.doWork, instance.nextFreeTimeslot - now);
        instance.nextFreeTimeslot += instance.interval;
      }
    };

    return worker;
  };

  workers.push(createWorker());
  const setWorkerNumber = () => {
    const setTo = instance.threads > 1 ? instance.threads : 1;
    const diff = setTo - workers.length;
    if (diff === 0) return;
    if (diff > 0) {
      for (let i = 0; i < diff; i += 1) {
        const worker = createWorker();
        workers.push(worker);
        if (instance.q.length) worker.doWork(true);
      }
      return;
    }
    if (workers.length > 1) {
      workers.splice(0, -diff).forEach(worker => worker.stop());
      instance.rescheduleWorkers();
    }
  };
  setWorkerNumber(instance.threads);

  const startIdleWorker = () => {
    const idleWorker = workers.find(worker => worker.idle);
    if (idleWorker) idleWorker.doWork(true);
  };

  const wrapped = (...args) => {
    instance.firstCallTime = instance.firstCallTime || Date.now();
    const type = instance.type || (typeof args[args.length - 1] === 'function' ? 'callback' : 'promise');
    const thisCall = { type, args };
    const processCall = () => {
      instance.q.push(thisCall);
      instance.lastCall = thisCall;
      startIdleWorker();
    };

    if (type === 'promise') {
      return new Promise((resolve, reject) => {
        thisCall.cb = (err, res) => (err && reject(err)) || resolve(res);
        processCall();
      });
    }

    thisCall.cb = args.pop();
    processCall();
    return null;
  };

  wrapped.throttlewrap = instance;
  return wrapped;
};

module.exports = tw;
