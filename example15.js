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

fs.readFile(__dirname + "/example15.html", 
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

var Kp = 0.55; // proportional factor
var Ki = 0.008; // integral factor
var Kd = 0.15; // differential factor

var factor = 0.5; // proportional factor that determes speed of response
var pwm = 0; // set pwm as global variable
var pwmLimit = 254;


var err = 0; // error
var errSum = 0; // sum of errors
var dErr = 0; // difference of error
var lastErr = 0; // to keep the value of previous error

var controlAlgorihtmStartedFlag = 0; // variable for including weather ctrlAlg has been started
var intervalCtrl; // var for setInterval in global space


http.listen(8080); //server will listen on port 8080
var sendValueViaSocket = function(){}; // var for sending messages

board.on("ready", function(){

board.analogRead(0, function (value){
desiredValue = value;
});

board.analogRead(1, function (value){
actualValue = value;
});

io.sockets.on("connection", function(socket) {
socket.emit("messageToClient", "Srv connected, b OK")

setInterval(sendValues, 40, socket); //on 40ms trigger func. sendValues

socket.on("startControlAlgorithm", function(){
    startControlAlgorithm();
});

socket.on("stopControlAlgorithm", function(){
    stopControlAlgorithm();
});

}); // end of socket.on connection

}); // end of board.on ready

function controlAlgorithm(){
    
  err = desiredValue - actualValue; // error
  errSum += err; // sum of errors, like integral
  dErr = err - lastErr; // difference of error
  pwm = Kp*err + Ki*errSum + Kd*dErr;
  lastErr = err; // save the value for the next cycle

    pwm = factor*(desiredValue-actualValue);
    if (pwm > pwmLimit) {pwm=pwmLimit};
    if (pwm < -pwmLimit) {pwm=-pwmLimit}; 
    if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; //direction if >0
    if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; //direction if <0 

board.analogWrite(3, Math.abs(pwm));

};

function startControlAlgorithm () {
    if (controlAlgorihtmStartedFlag == 0) {
controlAlgorihtmStartedFlag = 1; // set flag that the algorithm has started        
intervalCtrl = setInterval (function() {controlAlgorithm(); }, 30); // na 30ms call
console.log("Control algorithm started")
}
};

function stopControlAlgorithm () {
    clearInterval(intervalCtrl); // clear the interval of control algorihtm
    board.analogWrite(3,0); // write 0 on pwm pin to stop the motor
    controlAlgorihtmStartedFlag = 0; // set flag that the algorithm has stopped
};

function sendValues (socket) {
socket.emit("clientReadValues", 
{
"desiredValue": desiredValue,
"actualValue": actualValue,
"pwm": pwm
})
};