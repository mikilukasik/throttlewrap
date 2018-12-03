const stopWorker = require('./stopWorker');
const doWork = require('./doWork');
const dealWithRes = require('./dealWithRes');

const createWorker = function createWorker() {
  const worker = {
    idle: true,
    timeoutId: null,
  };

  worker.stop = stopWorker.bind({ worker, instance: this });
  worker.doWork = doWork.bind({ worker, instance: this });
  worker.dealWithRes = dealWithRes.bind({ worker, instance: this });

  return worker;
};

module.exports = createWorker;
