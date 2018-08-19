var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3001;

var wallSockets = [];

app.use(express.static(__dirname + '/public'));
// or using routes
app.get('/wall', function(req,res){
 res.sendfile(__dirname + '/public/wall.html');
});
app.get('/pad', function(req,res){
 res.sendfile(__dirname + '/public/pad.html');
});
app.get('/', function(req,res){
 res.sendfile(__dirname + '/public/index.html');
});

// socket.io communication
io.on('connection', (socket) => {
    console.log("someone connected");

    // in drawing mode to show line being drewn
    socket.on('drawing', (data) => {
        // console.log("drawing: " + data);
        data.clientId = socket.id;
        wallSockets.forEach((wsocket) => wsocket.emit("drawing", data));
    });

    // in cursor moving mode, just move cursor without drawing line
    socket.on('moving', (data) => {
        // console.log("moving: " + data);
        data.clientId = socket.id;
        wallSockets.forEach((wsocket) => wsocket.emit("moving", data));
    });

    socket.on('writing', (data) => {
        console.log("writing: " + data);
        data.clientId = socket.id;
        wallSockets.forEach((wsocket) => wsocket.emit("writing", data));
    });

    // clear off things done by this particular "pad" client
    socket.on('clearing', (data) => {
        console.log("clearing: " + data);
        data.clientId = socket.id;
        wallSockets.forEach((wsocket) => wsocket.emit("clearing", data));
    });

    // when a browser cient is connected, keep tracking the "connection"
    socket.on('name', (value) => {
        socket.name = value;
        console.log(socket.name);

        // the list of "wall" displays
        if( socket.name === 'wall') {
            wallSockets.push(socket);
        }

        // tell each wall that a "pad" is connected
        if( socket.name === 'pad') {
            wallSockets.forEach((wsocket) => wsocket.emit("hello", socket.id));
        }
    });

    socket.on('disconnect', () => {
        console.log("someone disconnected");
        wallSockets.forEach((wsocket) => wsocket.emit("goodbye", socket.id));
    });


})

http.listen(port, function(){
    console.log("server is running at: " + port);
});
