var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); //socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
console.log("Connecting to Arduino");
board.pinMode(0, board.MODES.ANALOG); //enable pin 0
board.pinMode(1, board.MODES.ANALOG); //enable pin 1
board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
board.pinMode(3, board.MODES.PWM);
board.pinMode(4, board.MODES.OUTPUT); // direction of DC motor


});

function handler(req, res) { // http.createServer([requestListener]) | The requestListener is a function which is automatically added to the 'request' event.

fs.readFile(__dirname + "/example13.html", 
function (err, data) {
if (err){

res.writeHead(500, {"Content-Type":"text/plain"});
return res.end("Error loading html page.");

}

res.writeHead(200);
res.end(data);
});
}

var desiredValue = 0; //desired value var
var actualValue = 0; //actual value var

var factor = 0.1; // proportional factor that determes speed of response
var pwm = 0; // set pwm as global variable

http.listen(8080); //server will listen on port 8080
var sendValueViaSocket = function(){}; // var for sending messages

board.on("ready", function(){

board.analogRead(0, function (value){
desiredValue = value;
});

board.analogRead(1, function (value){
actualValue = value;
});

startControlAlgorithm();

io.sockets.on("connection", function(socket) {

socket.emit("messageToClient", "Srv connected, b OK")

setInterval(sendValues, 40, socket); //on 40ms trigger func. sendValues

}); // end of socket.on connection

}); // end of board.on ready

function controlAlgorithm(){

pwm = factor*(desiredValue-actualValue);
if (pwm > 255) {pwm=255};
if (pwm < -255) {pwm=-255}; 
if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; //direction if >0
if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; //direction if <0 

board.analogWrite(3, Math.abs(pwm) + 25);

};

function startControlAlgorithm () {
setInterval(function() {controlAlgorithm(); }, 30); // na 30ms call
console.log("Control algorithm started")
};

function sendValues (socket) {
socket.emit("clientReadValues", 
{
"desiredValue": desiredValue,
"actualValue": actualValue
})
};