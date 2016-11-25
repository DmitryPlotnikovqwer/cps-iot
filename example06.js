var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); //socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");


var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
});

function handler(req, res) { // http.createServer([requestListener]) | The requestListener is a function which is automatically added to the 'request' event.
   
fs.readFile(__dirname + "/example06.html", 
function (err, data) {
    if (err){
        
    res.writeHead(500, {"Content-Type":"text/plain"});
    return res.end("Error loading html page.");
        
    }
    
    
  res.writeHead(200);
  res.end(data);
})
        
   
}

http.listen(8080); //server will listen on port 8080

io.sockets.on("connection", function(socket) {
    
    socket.on("CommandToArduino", function(commandNo) {
        
        if (commandNo == "1") {
            
        board.digitalWrite(13, board.HIGH); // write high on pin 13
        }        
        
         if (commandNo == "0") {
            
        board.digitalWrite(13, board.LOW); // write low on pin 13
        }
        
         if (commandNo == "3") {
            
        board.digitalWrite(8, board.HIGH); // write high on pin 13
        }        
        
         if (commandNo == "2") {
            
        board.digitalWrite(8, board.LOW); // write low on pin 13
        } 
        
    });
});