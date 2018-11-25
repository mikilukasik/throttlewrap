# throttlewrap
A convenient wrapper for throttling async functions

Simple use:
```
const tw = require('throttlewrap');
const request = require('request');

const get = tw.wrap(request.get, { rpm: 10, threads: 2 });

get('http://myurl1.com', console.log);
get('http://myurl2.com', console.log);
get('http://myurl3.com', console.log);
get('http://myurl4.com', console.log);
```

or with promises:
```
const tw = require('throttlewrap');
const request = require('request-promise');

const get = tw.wrap(request.get, { rpm: 10, threads: 2 });

get('http://myurl1.com').then(console.log, console.error);
get('http://myurl2.com').then(console.log, console.error);
get('http://myurl3.com').then(console.log, console.error);
get('http://myurl4.com').then(console.log, console.error);
```
