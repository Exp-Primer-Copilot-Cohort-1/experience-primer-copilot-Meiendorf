// Create web server
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var comments = require('./comments');
var mime = require('mime');

// load the comments
comments.load();

// create the web server
http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true);
    var pathname = urlObj.pathname;
    if (pathname === '/') {
        pathname = '/index.html';
    }
    if (pathname === '/submitComment') {
        comments.add(urlObj.query);
        comments.save();
        res.end();
    } else if (pathname === '/getComments') {
        res.end(JSON.stringify(comments.get()));
    } else {
        var realPath = path.join("public", pathname);
        var contentType = mime.lookup(realPath);
        fs.exists(realPath, function (exists) {
            if (!exists) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write("This request URL " + pathname + " was not found on this server.");
                res.end();
            } else {
                fs.readFile(realPath, "binary", function (err, file) {
                    if (err) {
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end(err);
                    } else {
                        res.writeHead(200, {
                            'Content-Type': contentType
                        });
                        res.write(file, "binary");
                        res.end();
                    }
                });
            }
        });
    }
}).listen(8080);