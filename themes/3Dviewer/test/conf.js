exports.config = {
	framework: 'jasmine2',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	
	jasmineNodeOpts: {
	    // If true, display spec names.
	    isVerbose: true,
	    // If true, print colors to the terminal.
	    showColors: true,
	    // If true, include stack traces in failures.
	    includeStackTrace: true,
	    // Default time to wait in ms before a test fails.
	    defaultTimeoutInterval: 90000,
	    

	},

	capabilities : {
	    'browserName': 'chrome',
	    "count": 1,
	    'loggingPrefs' : {"driver": "ALL", "server": "ALL", "browser": "ALL"}

	},
	specs: ['viewer-ready-test.js']

};