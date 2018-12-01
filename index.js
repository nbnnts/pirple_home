
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');


var httpServer = http.createServer(function(req, res){
  unifiedServer(req, res);
});

var httpsOption = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsOption,function(req, res){
  unifiedServer(req, res);
});




httpServer.listen(config.httpPort, function(){
  console.log("SERVER IS ON " + config.httpPort);
});

httpsServer.listen(config.httpsPort, function(){
  console.log("SERVER IS ON " + config.httpsPort);
});

var unifiedServer = function(req, res){
  var parsedUrl = url.parse(req.url, true);
  var pathName = parsedUrl.pathname;
  var trimmedPathName = pathName.replace(/^\/+|\/+$/g, '');
  var queryString = parsedUrl.query;

  var method = req.method;

  var headers = req.headers;

  var buffer = '';

  var decoder = new StringDecoder('utf-8');

  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  req.on('end', function(){
    buffer += decoder.end();

    var data = {
      'headers' : headers,
      'method' : method,
      'path' : trimmedPathName,
      'queryString' : queryString,
      'payload' : buffer
    };

    choosenHandler = typeof(router[trimmedPathName]) !== 'undefined' ? router[trimmedPathName] : handlers.notFound;

    choosenHandler(data, function(statusCode, payload){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};

      payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });


  });

}




var handlers = {};

handlers.hello = function(data, callback){
  callback(200, {'message':'Hello, This is my first home assignment'});
};

handlers.notFound = function(data, callback){
  callback(404);
};

var router = {
  'hello' : handlers.hello
}
