var page = require('webpage').create(),
    system = require('system'),
    config = require('../bin/config'),
    lastReceived = new Date().getTime(),
    requestCount = 0,
    responseCount = 0,
    requestIds = [],
    minContentLength,
    checkComplete,
    checkCompleteInterval;

page.viewportSize = {width: 1024, height: 768};
page.onResourceRequested = function(request) {
    if (requestIds.indexOf(request.id) === -1) {
        if (config.debug) {
            console.error('Requested: ' + request.id + ' ' + request.method + ' ' + request.url);
        }
        requestIds.push(request.id);
        requestCount++;
    }
};
page.onResourceReceived = function(response) {
    if (requestIds.indexOf(response.id) !== -1) {
        if (config.debug) {
            console.error('Received: ' + response.id + ' ' +
                response.contentType + ' ' +
                response.url + ' ' +
                response.bodySize + ' ' +
                response.stage + ' ' +
                response.status + ' ' +
                response.statusText + ' ' +
                response.redirectURL
            );
        }
        if (response.id === 1) { // first response
            minContentLength = response.bodySize;
        }
        lastReceived = new Date().getTime();
        responseCount++;
        requestIds[requestIds.indexOf(response.id)] = null;
    }
};

checkComplete = function () {
    var timeDiff = new Date().getTime() - lastReceived;
    if (page.content.length >= minContentLength &&
        timeDiff > config.checkCompleteTimeDiff &&
        requestCount === responseCount) {
        clearInterval(checkCompleteInterval);
        console.log(page.content);
        phantom.exit(0);
    } else {
        if (timeDiff > config.checkCompleteTimeout) {
            if (config.debug) {
                console.error(
                    'requestCount: ' + requestCount +
                    ' !== responseCount: ' + responseCount + '.' +
                    ' You might have a synchronous ajax call that is NOT being captured by onResourceReceived.' +
                    ' See: https://github.com/ariya/phantomjs/issues/11284'
                );
                console.error('FORCED EXIT STATUS 10. Incomplete in ' + timeDiff + ' seconds.');
            }
            phantom.exit(10);
        }
    }
};

page.open(system.args[1], function () {});
checkCompleteInterval = setInterval(checkComplete, config.checkCompleteInterval);
