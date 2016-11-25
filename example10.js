var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); //socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    board.pinMode(0, board.MODES.ANALOG); //enable pin 0
});

function handler(req, res) { // http.createServer([requestListener]) | The requestListener is a function which is automatically added to the 'request' event.
   
fs.readFile(__dirname + "/example10.html", 
function (err, data) {
    if (err){
        
    res.writeHead(500, {"Content-Type":"text/plain"});
    return res.end("Error loading html page.");
        
    }
    
  res.writeHead(200);
  res.end(data);
});
}

var desiredValue = 0; //desired  value var

http.listen(8080); //server will listen on port 8080
var sendValueViaSocket = function(){}; // var for sending messages

board.on("ready", function(){


board.analogRead(0, function (value){
    desiredValue = value;
});

io.sockets.on("connection", function(socket) {
    
    socket.emit("messageToClient", "Srv connected, b OK")
       
    setInterval(sendValues, 40, socket); //on 40ms trigger func. sendValues

});  // end of socket.on connection


}); // end of board.on ready

function sendValues (socket) {
    socket.emit("clientReadValues", 
    {
     "desiredValue": desiredValue   
    })
};