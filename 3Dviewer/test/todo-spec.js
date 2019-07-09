var sprintf=require("sprintf-js").sprintf;

describe('angularjs Demo App', function() {
    var logs;
    browser.get('http://localhost/3dviewer');
    beforeEach(function () {
        
        logs = require('protractor-browser-logs')(browser);
        
     
    });



    for (var i = 0; i < 10000; i++) {
        var time = 0;
        it('should work for ' + i, function (done, i) {
            console.log("test: ", time , "s");
            browser.executeScript('return window.performance.memory').then(function(aftermemoryInfo) {
                    console.log(sprintf("MemoryInfo: usedJSHeapSizee : %10.2f", aftermemoryInfo.usedJSHeapSize/1048576), "MB");
                    console.log(sprintf("MemoryInfo: jsHeapSizeLimit : %10.2f", aftermemoryInfo.jsHeapSizeLimit/1048576), "MB");
                    var afterjsHeapSizeLimit = aftermemoryInfo.jsHeapSizeLimit;
                    var afterusedJSHeapSize = aftermemoryInfo.usedJSHeapSize;
                    var aftertotalJSHeapSize = aftermemoryInfo.totalJSHeapSize;
                    //expect((parseInt(afterusedJSHeapSize)-parseInt(beforeusedJSHeapSize))<10000000).toBe.true;
                });
            time++;
            setTimeout(done, 1000);
        });
    }  
});