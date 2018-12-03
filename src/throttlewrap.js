const createInstance = require('./createInstance');

const tw = wrapped => wrapped.throttlewrap;
tw.wrap = (_fn, _options) => {
  const instance = createInstance(_fn, _options);
  const {
    q,
    workers,
    setWorkerNumber,
    createWorker,
    startIdleWorker,
  } = instance;

  workers.push(createWorker());
  setWorkerNumber(instance.threads);

  const wrapped = (...args) => {
    instance.firstCallTime = instance.firstCallTime || Date.now();
    const type = instance.type || (typeof args[args.length - 1] === 'function' ? 'callback' : 'promise');
    const thisCall = { type, args };
    const processCall = () => {
      q.push(thisCall);
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
