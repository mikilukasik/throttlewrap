# throttlewrap
A convenient wrapper for throttling async functions

### Installation:
```
npm i throttlewrap
```

### Simple uses
rpm limitation for a callback funtion:
```javascript
const tw = require('throttlewrap');
const request = require('request');

const get = tw.wrap(request.get, { rpm: 10 });

get('http://myurl.com', console.log);
get('http://myurl.com', console.log);
get('http://myurl.com', console.log);
get('http://myurl.com', console.log);
```

simultaneous thread limitation on a promise function:
```javascript
const tw = require('throttlewrap');
const request = require('request-promise');

const get = tw.wrap(request.get, { threads: 2 });

get('http://myurl.com').then(console.log, console.error);
get('http://myurl.com').then(console.log, console.error);
get('http://myurl.com').then(console.log, console.error);
get('http://myurl.com').then(console.log, console.error);
```

### Using rules to adaptively throttle
using an object rule to speed up when no errors for half a second
```javascript
const get = tw.wrap(request.get, {
  rpm: 10,
  rules: [{
    condition: { noErrorPeriod: 500 },
    action: { rpm: { mul: 2 } },
  }]
});
```

using an object rule to remove threads when only receiving timeouts for 2 seconds
```javascript
const get = tw.wrap(request.get, {
  threads: 5,
  isError: (err, res) => err || res.statusCode === 504,
  rules: [{
    condition: { noSuccessPeriod: 2000 },
    action: { threads: { sub: 1 } },
  }]
});
```

### A complex example
```javascript
const get = tw.wrap(request.get, {
  threads: 10,
  threadsMin: 2,
  threadsMax: 20,
  rps: 15,
  rpmMin: 300,
  intervalMax: 500,
  isError: (err, res) => err || res.statusCode === 504,
  rules: [{
    condition: {
      noSuccessPeriod: 500
    },
    action: {
      threads: { sub: 1 },
      rpm: { div: 1.5 }
    },
  },
  {
    condition: {
      noErrorPeriod: 2000
    },
    action: {
      threads: { add: 1 }
    },
  },
  function ({ lastErrorTime, firstCallTime, interval }) {
    const now = Date.now();
    const noErrorPeriod = now - (lastErrorTime || firstCallTime);
    const shouldSpeedUp = noErrorPeriod >= 2000
      && (!this.lastApplied || (now - this.lastApplied > 2000));
    if (!shouldSpeedUp) return null;
    this.lastApplied = now;
    return { interval: interval / 1.5 };
  }]
});
```