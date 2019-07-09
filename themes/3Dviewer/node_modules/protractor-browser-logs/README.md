# Protractor browser logs assertion library

It allows asserting the browser console logs in each test for warnings and errors.
You can set the ignored messages, specify the expectations using strings, regex or custom matchers.

Inspired by https://github.com/angular/protractor-console-plugin/

### Installation

```bash
npm install protractor-browser-logs --save-dev
```

### Typical library usage

```js
var browserLogs = require('protractor-browser-logs');

describe('Home page:', function () {

  var logs;

  beforeEach(function () {
    logs = browserLogs(browser);
    logs.ignore(logs.DEBUG);
    logs.ignore(logs.INFO);
  });

  afterEach(function () {
    return logs.verify();
  });

  it('should log an error after clicking a button', function () {
    logs.expect(/server request failed/);

    browser.get('...');
    element(by.id('button')).click();
  });

});
```

### API

You can ignore any message whenever it appears.

```js
logs.ignore('text');
logs.ignore(/text/i);
logs.ignore(function (message) {
  return message.message.toLowerCase().indexOf('text') !== -1;
});

// You can combine them all together
logs.ignore('hello', 'world'); // ignores messages containing `hello` and `world`
logs.ignore(/hello/i, function (message) { // ignore all messages containting `hello` but not `world`
  return message.message.indexOf('world') === -1;
});
```

You can also expect some messages. The order does matter.

```js
logs.expect('one');
logs.expect(/two/i);
logs.expect(function (message) {
  return message.message.toLowerCase().indexOf('three') === 0;
});
```

You can check the expectations using `verify` method which returns a promise:

```js
it('this is my test', function () {
  logs.expect('one');
  // ...
  return logs.verify();
});
```

### Using advanced features

```js
var browserLogs = require('protractor-browser-logs');

describe('Home page:', function () {

  var log = browserLogs(browser);

  beforeEach(function () {
    // Use only one instance, but need to reset before each test.
    log.reset();

    // Combine matcher functions
    logs.ignore(logs.or(logs.DEBUG, logs.INFO));

    // Specify custom matcher function
    logs.ignore(function (message) {
      return message.message.indexOf('Oops') !== -1;
    });
  });

  it('should log an error after clicking a button', function () {
    // The sequence of expectations does matter
    logs.expect(/retrying/, logs.WARN); // Expect message having "retrying" text and WARNING level.
    logs.expect(/server request failed/, logs.ERROR);

    browser.get('...');
    element(by.id('button')).click();
  });

  afterEach(function () {
    return logs.verify();
  });

});
```

### Sharing the code inside a protractor configuration file

```js
onPrepare = function () {

  var browserLogs = require('protractor-browser-logs'),
      logs = browserLogs(browser);

  if (global.logs) {
    throw new Error('Oops, name is already reserved!');
  }
  global.logs = logs;

  beforeEach(function () {
    logs.reset();

    // You can put here all expected generic expectations.
    logs.ignore('cast_sender.js');
    logs.ignore('favicon.ico');

    logs.ignore(logs.or(logs.INFO, logs.DEBUG));
  });

  afterEach(function () {
    return logs.verify();
  });
};
```

### Protractor capabilities configuration

By default browser allows recording only `WARNING` and `SEVERE` level messages.
In order to be able asserting any level, You need to change the `loggingPrefs.browser` capabilities.

```js
capabilities: {
  loggingPrefs: {
    browser: 'ALL' // "OFF", "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST", "ALL".
  }
}
```
More details could be found here: https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities#loggingpreferences-json-object

### Custom reporters

It's also possible to specify custom reporters, for filtering and printing out the log entries.

```js
function simple(entries) {
  entries.forEach(function (entry) {
    console.log([entry.level.name, entry.message].join(': '));
  });
}

function colored(entries) {
  var colors = { INFO: 35 /* magenta */, WARNING: 33 /* yellow */, SEVERE: 31 /* red */};
  entries.forEach(function (entry) {
    console.log('\u001b[' + (colors[entry.level.name] || 37) + 'm' + [entry.level.name, entry.message].join(': ') + '\u001b[39m');
  });
}

var browserLogs = require('protractor-browser-logs');
browserLogs(browser, {
  reporters: [simple, colored]
});
```
