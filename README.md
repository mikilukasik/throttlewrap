# throttlewrap
A convenient wrapper for adaptively throttling async functions

### Installation:
```
npm i throttlewrap
```

### Usage
```
tw.wrap([functionToThrottle], [options])
```
It returns a wrapped version of *functionToThrottle* with rate limitation described in the *options* object.

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

using an object rule to remove threads when more than 20% of the responses are errors or timeouts in a 2 second period
```javascript
const get = tw.wrap(request.get, {
  threads: 5,
  isError: (err, res) => err || res.statusCode === 504,
  rules: [{
    condition: { errorRate: { gt: 0.2, period: 2000 } },
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
      successCount: { gte: 5, period: 500 }
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

### Table of options
None of these options are required, but you need to define the function to throttle and one of rpm, rps, interval or threads

|key|type|description|
|---|---|---|
|interval|number|The number of milliseconds that need to pass between each call
|rpm|number|The maximum of calls per minute. Gets converted to interval
|rps|number|The maximum of calls per second. Gets converted to interval
|threads|number|The maximum number of simultaneous calls. When omitted or set to 0, the number of simultaneous calls are unlimited
|type|string|Values can be 'promise' or 'callback', describing the type of function wrapped. If omitted, the type will be determined for each call by checking if the last argument passed is a function (callback)
|fn|async function|The function to be wrapped. Can also be defined as the first argument of the throttlewrap.wrap function.
|rules|array|Describes the conditions on which execution should speed up / slow down. Increasing and decreasing the number of threads is also possible. See the *rules* section describing these in detail
|isError|function|Defines what results to treat as errored. Runs after each finished call, receives the error and result of the call. The 3rd parameter will be true if a promise is rejected, this is useful when it gets rejected with no error passed. If isError returns truthy value, the response will be treated as an error in the stats. Default value is *(err, res, rejected) => err \|\| rejected*
|intervalMin|number|The smallest number interval can be adjusted to using rules
|intervalMax|number|The largest number interval can be adjusted to using rules
|rpmMin|number|The smallest number rpm can be adjusted to using rules. Will get converted to intervalMax
|rpmMax|number|The largest number rpm can be adjusted to using rules. Will get converted to intervalMin
|rpsMin|number|The smallest number rps can be adjusted to using rules. Will get converted to intervalMax
|rpsMax|number|The largest number rps can be adjusted to using rules. Will get converted to intervalMin
|threadsMin|number|The minimum number threads can be adjusted to using rules. Defaults to 1 where a function is wrapped using threads limitation.
|threadsMax|number|The maximum number threads can be adjusted to using rules.
|statsPeriod|number|The number of milliseconds for which to keep the statistics for. If omitted, it will be determined by checking the conditions in the rules array

### The *rules* array
An array of objects and/or functions describing when and how to adopt throttling. While function rules give more flexibility, in most cases using object rules is more convenient.

### Object rules

Each rule object needs to have two keys, *condition* and *action*. These will get processed after each finished call, where the conditon is met, the action will be taken.
#### Condition object
Defines the condition on which the action is to be taken. Needs to have at least one of the below keys. If more keys are defined there will be an **AND** relation between the multiple conditions. In order to use an OR relation, please define them as separate rules.

|key|type|example|description|
|---|---|---|---|
|noErrorPeriod|number|{ noErrorPeriod: 500 }|Condition will be met if no call will finish with error for the number of milliseconds. This is half a second in the example.
|noSuccessPeriod|number|{ noSuccessPeriod: 2000 }|Condition will be met if all calls finish with error for the number of milliseconds. This is two seconds in the example.
|errorRate|object|{ errorRate: { period: 1000, gt: 0.5 } }|Will trigger the action if the rate of errors satisfy the condition in the period. In this example the condition will be met if more than half of the finished calls in the last second errored. *period* is required, operator key can be *gt* - greater than, *gte* - greater or equal, *lt* - less than, *lte* - less or equal, *is* - equals. Values will fall between 0 and 1 inclusive.
|successRate|object|{ successRate: { period: 800, lte: 0.25 } }|Same as the above but checks the ratio of successful (not errored) calls. In this example the condition will be met if in the past 800 milliseconds only 25% or less of the calls finished without error. *period* is required, operator key can be *gt*, *gte*, *lt*, *lte*, or *is*
|errorCount|object|{ errorCount: { period: 500, is: 3 } }|Similar to *errorRate* but rather than the ratio of errors, it looks at the number of errors. In this example the condition will be met if in the past half a second 3 calls finished with errors. *period* is required, operator key can be *gt*, *gte*, *lt*, *lte*, or *is*
|successCount|object|{ successCount: { period: 1000, gte: 5 } }|Same as the above but checks the count of successful (not errored) calls. In this example the condition will be met if in the past second the number of successful calls is 5 or more. *period* is required, operator key can be *gt*, *gte*, *lt*, *lte*, or *is*

#### Action object
Defines the action to be taken when the condition is met. Needs to have at least one of the below keys. If more keys are defined there will be an **AND** relation between the multiple actions. Key values are objects in the format of { *operator*: *value* }

|key|example|description|
|---|---|---|
|threads|{ threads: { sub: 1 } }|Changes the number of threads. (The maximum number of simultaneous calls) This example action will remove one thread. Operators can be *mul* - multiply, *div* - divide, *add* - increase, *sub* - subtract, *set* - set to exact value
|interval|{ interval: { set: 100 } }|Changes the interval, the number of milliseconds between calls. This example action will set the interval to 100, allowing a maximum of 10 calls per second. Operators can be *mul* - multiply, *div* - divide, *add* - increase, *sub* - subtract, *set* - set to exact value
|rpm|{ rpm: { mul: 2 } }|Changes the rate per minute limit. In this example action the rpm gets doubled. Operators can be *mul* - multiply, *div* - divide, *set* - set to exact value
|rps|{ rps: { set: 5 } }|Similar to the above, but adjusts the rate per second. In this example action the rps gets set to 5. Operators can be *mul* - multiply, *div* - divide, *set* - set to exact value
