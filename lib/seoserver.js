var express = require('express'),
    app = express(),
    args = process.argv.splice(2),
    port = args[0] !== 'undefined' ? args[0] : 3000,
    config = require('../bin/config'),
    getContent,
    respond;

getContent = function(url, on_success) {
    var content = '',
        phantom = require('child_process').spawn(__dirname + '/../node_modules/phantomjs/bin/phantomjs', [__dirname + '/phantom-server.js', url]);
    phantom.stdout.setEncoding('utf8');
    phantom.stdout.on('data', function(data) {
        content += data.toString();
    });
    phantom.stderr.on('data', function(data) {
        if (config.verbose) {
            console.log('url: ' + url + ' stderr: ' + data);
        }
    });
    phantom.on('exit', function(code) {
        if (code !== 0) {
            if (config.verbose) {
                console.log('url: ' + url + ' ERROR: PhantomJS Exited with code: ' + code);
            }
            on_fail(code);
        } else {
            if (config.verbose) {
                console.log(
                    'url: ' + url +
                    ' HTMLSnapshot completed successfully.' +
                    ' Content-Length: ' + content.length
                );
            }
            on_success(content);
        }
    });
};

respond = function(req, res) {

    on_success = function(content) {
      res.send(content);
    };

    on_fail = function(code) {
      res.status(code);
      res.type('txt').send('HTTP code: ' + code);
    };

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var url;
    if (req.headers.referer) {
        url = req.headers.referer;
    }
    if (req.headers['x-forwarded-host']) {
        url = 'http://' + req.headers['x-forwarded-host'] + req.params[0];
    }
    console.log('url:', url);
    if (url) {
        getContent(url, on_success, on_fail);
    } else {
      res.status(404);
      res.type('txt').send('Not found');
    }
};

check_health = function(req, res) {
  res.send('ok');
};

app.get('/check_health', check_health);
app.get(/(.*)/, respond);
app.listen(port);
