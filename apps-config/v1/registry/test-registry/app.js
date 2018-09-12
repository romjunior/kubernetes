const http = require('http');
const os = require('os');

console.log("Kubia server starting...");

var handler = function(request, response){
    console.log("Recebendo o request do " + request.connection.remoteAddress);
    response.writeHead(200);
    response.end("Você atingiu " + os.hostname() + "\n");
};

var www = http.createServer(handler);
www.listen(8080);