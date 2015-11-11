'use strict';
var path = require('path');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 5000;
app.use('/static', express.static(__dirname + "/dist"));
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, './dist/index.html'));
});
app.get('/snake.js', function(req, res){
	res.sendFile(path.join(__dirname, '/dist/snake.js'));
});
io.sockets.on('connection', function(socket){
    console.log('sockets connected');
});
server.listen(port);
module.exports = app;