'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
    config = require('./config/config'),
    http = require('http'),
    chalk = require('chalk'),
    socket = require('./app/components/socket.js');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

/*// Bootstrap db connection
var db = mysql.connect(config.db,"root","" function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to mysql!'));
		console.log(chalk.red(err));
	}
});

mysql(connection(mysql,{

	host: 'localhost',
	user: 'root',
	password : '',
	port : 3306, //port mysql
	database:'dentist_forum'

},'pool') //or single

// Init the express application
var app = require('./config/express')(db);*/

// Bootstrap passport config
var app = require('./config/express')();



/************* chat module start ****************/
// Chatroom
//var pseudoArray = ['admin']; //block the admin username (you can disable it)
var server = http.createServer(app);
var io = require('socket.io').listen(server);
//// usernames which are currently connected to the chat
//var usernames = {};
//var numUsers = 0;
//var users = {};
//var sockets = {};
//io.sockets.on('connection', function (socket) {
//  var addedUser = false;
//  
//  usernames = socket.id;    // Store a reference to your socket ID
//  sockets[socket.id] = { username : usernames, socket : socket };  // Store a reference to your socket
////   console.log(JSON.stringify(usernames));
//  // console.log(sockets[socket.id]);
//  // when the client emits 'new message', this listens and executes
//  socket.on('send:message', function (data) {
//    // we tell the client to execute 'new message'
//    console.log(data);
//    console.log(socket.username);
//    socket.broadcast.emit('send:message', {
//      message: data
//    });
//  });
//
//  // when the client emits 'add user', this listens and executes
//  socket.on('user:join', function (username) {
//    // we store the username in the socket session for this client
//    console.log(username);
//    socket.username = username;
//    // add the client's username to the global list
//    usernames[username] = username;
//    ++numUsers;
//    addedUser = true;
//    socket.emit('login', {
//      numUsers: numUsers
//    });
//    // echo globally (all clients) that a person has connected
//    socket.broadcast.emit('user:join', {
//      username: socket.username,
//      numUsers: numUsers
//    });
//  });
//
//  // when the client emits 'typing', we broadcast it to others
//  socket.on('typing', function () {
//    socket.broadcast.emit('typing', {
//      username: socket.username
//    });
//  });
//
//  // when the client emits 'stop typing', we broadcast it to others
//  socket.on('stop typing', function () {
//    socket.broadcast.emit('stop typing', {
//      username: socket.username
//    });
//  });
//
//  // when the user disconnects.. perform this
//  socket.on('disconnect', function () {
//    // remove the username from global usernames list
//    if (addedUser) {
//      delete usernames[socket.username];
//      --numUsers;
//
//      // echo globally that this client has left
//      socket.broadcast.emit('user left', {
//        username: socket.username,
//        numUsers: numUsers
//      });
//    }
//  });
//});

io.sockets.on('connection', socket);

/****************chat module end *****************/

// Start the app by listening on <port>
//app.listen(config.port);
server.listen(config.port);
// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);