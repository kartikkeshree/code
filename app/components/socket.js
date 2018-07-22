var chat = require('../controllers/chat.server.controller.js');
// Keep track of which names are used so that there are no duplicates
var sockets = {};

// export function for listening to the socket
module.exports = function (socket, req) {
    var person = {};  //Current user details who communicates with server//
    var users = []; //Variable contains online users list//
    //Get user details who got logged in // //Step 1//
    socket.on('send:name', function (data) {
        person.id = data.id;
        person.name = data.name;
        person.image = data.image;
        //usernames = socket.id;    // Store a reference to your socket ID
        sockets[socket.id] = {username: data.name, userimage: data.image, userid: data.id, socket: socket}; //Add user details to socket listing//
        person.socketId = socket.id;
        
        //Add user in online users list/
        for (var a in sockets) {
            var isAvailable = false;
            for (var b in users)
            {
                if (users[b].id == sockets[a].userid)
                {
                    isAvailable = true;
                    break;
                }
            }

            if (isAvailable == false) //Do not add user in users list if already exists//
                users.push({name: sockets[a].username, image: sockets[a].userimage, id: sockets[a].userid, socketId: sockets[a].socket.id});
        }
        /*
        console.log(users);
        //console.log(users.sort());
        users = users.sort(function (a, b) {
            return a.name.localeCompare( b.name );
        }); */
        //console.log(users);
        socket.emit('init', {//Send current user's detail and all users list to a user//
            person: person,
            user: users
        });

        // notify all other clients that a new user has joined//
        socket.broadcast.emit('user:join', {
            name: person.name,
            image: person.image,
            id: person.id,
            socketId: person.socketId
        });

    });

    // broadcast a user's message to other users (Group chat)//
    socket.on('send:message', function (data) {
        socket.broadcast.emit('send:message', {
            user: person.name,
            image: person.image,
            text: data.message,
            date: new Date()
        });
    });
    
    //Send message to specific user//
    socket.on('privateMessage', function (data) {
        socket.broadcast.to(data.socketId).emit('receive:privateMessage', {
            text: data.message,
            user: person.name,
            image: person.image,
            date: new Date(),
            socketId: person.socketId,
            userid: person.id
        });
        for (var a in sockets)//send message to client if logged in from multiple locations//
        {
            if (data.userid == sockets[a].userid && data.socketId != sockets[a].socket.id)
            {
                socket.broadcast.to(sockets[a].socket.id).emit('receive:privateMessage', {
                    text: data.message,
                    user: person.name,
                    image: person.image,
                    date: new Date(),
                    socketId: person.socketId,
                    userid: person.id
                });
            }
        }
    });
    
    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
        delete sockets[socket.id]
        socket.broadcast.emit('user:left', {
            name: person.name,
            id: person.id
        });
        users.splice(users.indexOf(person.id), 1);
    });
};
