const rescheduleWorkers = require('./rescheduleWorkers');
const createWorker = require('./createWorker');
const setWorkerNumber = require('./setWorkerNumber');
const startIdleWorker = require('./startIdleWorker');
const parseOptions = require('./parseOptions');
const applyAction = require('./applyAction');
const processRules = require('./processRules');
const conditionMet = require('./conditionMet');

const createInstance = (...args) => {
  const instance = Object.assign({
    q: [],
    workers: [],
    errorTimes: [],
    successTimes: [],
    lastErrorTime: null,
    lastSuccessTime: null,
    firstCallTime: null,
    nextFreeTimeslot: Date.now(),
  });

  Object.assign(
    instance,
    parseOptions(...args),
    {
      rescheduleWorkers: rescheduleWorkers.bind(instance),
      createWorker: createWorker.bind(instance),
      setWorkerNumber: setWorkerNumber.bind(instance),
      startIdleWorker: startIdleWorker.bind(instance),
      applyAction: applyAction.bind(instance),
      processRules: processRules.bind(instance),
      conditionMet: conditionMet.bind(instance),
    },
  );

  return instance;
};

module.exports = createInstance;
