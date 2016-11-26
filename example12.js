var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); //socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    board.pinMode(2, board.MODES.OUTPUT); //direction of DC motor
    board.pinMode(3, board.MODES.PWM); //PWM of motor
    board.pinMode(4, board.MODES.OUTPUT); 
    board.digitalWrite(2, 1); // init to spin left on start
    board.digitalWrite(4, 0); // init to spin right on start
});

function handler(req, res) { // http.createServer([requestListener]) | The requestListener is a function which is automatically added to the 'request' event.
   
fs.readFile(__dirname + "/example12.html", 
function (err, data) {
    if (err){
        
    res.writeHead(500, {"Content-Type":"text/plain"});
    return res.end("Error loading html page.");
        
    }
    
  res.writeHead(200);
  res.end(data);
});
        
   
}

http.listen(8080); //server will listen on port 8080
var sendValueViaSocket = function(){}; // var for sending messages

board.on("ready", function(){

io.sockets.on("connection", function(socket) {
    socket.emit("messageToClient", "Srv connected, b OK")
    socket.on("sendPWM", function(pwm){
        board.analogWrite(3, pwm)
        socket.emit("messageToClient", "PWM set to:" + pwm)
    });
    socket.on("left", function(value){
        board.digitalWrite(2, value.AIN1); //direction
        board.digitalWrite(4, value.AIN2); //direction
        socket.emit("messageToClient", "Direction; left");
    });
    
        socket.on("right", function(value){
        board.digitalWrite(2, value.AIN1); //direction
        board.digitalWrite(4, value.AIN2); //direction
        socket.emit("messageToClient", "Direction; right");
    });
    
        socket.on("stop", function(value){
        board.analogWrite(3, value); 
        socket.emit("messageToClient", "STOP");
    });
    
});  // end of socket.on connection

}); // end of board.digitalRead


