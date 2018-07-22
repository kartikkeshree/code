'use strict';
angular.module('users').controller('ChatController', ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Appointments', 'Page', 'socket',
    function ($scope, $stateParams, $location, $http, Authentication, Appointments, Page, socket) {
        $scope.authentication = JSON.parse(Authentication.get('user'));
        $scope.chat = {};
        $scope.messages = []; //variable used for group chat//
        $scope.privateMessages = []; //variable used for individual chat//
        $scope.chatWindows = {};
        $scope.users = [];
        var chatList = {};
        if ($scope.authentication) { //initiate chat if user is logged in//
            // Socket listeners//

            //Send logged in user's details to server// //Step 1//
            socket.emit('send:name', {
                id: $scope.authentication[0].id,
                name: $scope.authentication[0].display_name,
                image: $scope.authentication[0].image
            });
            //End Step 1//

            /*
             socket.on('data', function (data) {
             console.log(data);
             });
             */

            //Response from server, after chat initiation (response of step1)// //Step 2//
            socket.on('init', function (data) {
                //Current users details//
                $scope.name = data.person.name; //Current user's name//
                $scope.image = data.person.image; //Current user's image//
                //$scope.users = data.user; //List of logged in users//
                $scope.users = data.user.sort(function (a, b) { //Sort list of online users alphabetically based on name//
                    return a.name.localeCompare(b.name);
                });
                $scope.socketId = data.person.socketId; //Current user's socket id//
                $scope.userid = data.person.id; //Current user's users id//
                //To get group chat histroy data//
                $http.post('/groupChat').success(function (response) {
                    $scope.messages = response.data;
                    for(var a in $scope.messages)
                    {
                        if($scope.messages[a].from_id == $scope.authentication[0].id)
                        {
                            $scope.messages[a].user = 'Me';
                        }
                        delete $scope.messages[a].from_id;
                        if ($scope.messages[a].image == null || $scope.messages[a].image == '') //To set the user image
                        {
                            $scope.messages[a].image = "/modules/core/images/default-pic.jpg";
                        } else {
                            $scope.messages[a].image = '/images/profile_images/' + $scope.messages[a].image;
                        }
                    }
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
                //End//
            });
            //End step2//

            /* //not in use//
             socket.on('change:name', function (data) {
             changeName(data.oldName, data.newName);
             }); */

            //Group Chat (Message Broadcast to every user)//

            //Broadcast 'User Joined' message into group chat room and add to 'Members online' listing// //Step 3//
            socket.on('user:join', function (data) {
                $scope.messages.push({//Push message details (given response by server) into group message array//
                    user: '',
                    text: 'User ' + data.name + ' has joined.'
                });
                //Do not add user again in 'Members online' listing if already exists in listing//
                var isAvailable = false;
                for (var a in $scope.users)
                {
                    if ($scope.users[a].id == data.id)
                    {
                        isAvailable = true;
                        break;
                    }
                }
                if (isAvailable == false) {
                    $scope.users.push({name: data.name, image: data.image, id: data.id, socketId: data.socketId}); //Add user in online listing//
                    $scope.users = $scope.users.sort(function (a, b) { //Sort list of online users alphabetically based on name//
                        return a.name.localeCompare(b.name);
                    });
                }
            });
            //End step 3//

            //Brodacast a message (send a message into 'main chat room')//
            $scope.sendMessage = function () {
                if (!$scope.messageChat) //Do nothing if nothing entered in message box//
                    return false;
                socket.emit('send:message', {//Send message to the server to broadcast//
                    message: $scope.messageChat
                });
                //Add message details into group message array//
                $scope.messages.push({
                    user: 'me',
                    text: $scope.messageChat,
                    image: $scope.image,
                    date: new Date()
                });
                $http.post('/pushMessage', {client: $scope.authentication[0].id, message: $scope.messageChat}).success(function (response) {
                    console.log(response);
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
                // clear message box//
                $scope.messageChat = '';
                setTimeout(function () { //To keep chat container scrolled at bottom//
                    $("#chatbox-main").scrollTop($("#chatbox-main")[0].scrollHeight + 100);
                }, 300);
            };
            //Receive broadcasted message from server//
            socket.on('send:message', function (message) {
                $scope.messages.push(message); //Push message details (given response by server) into group message array//
                setTimeout(function () { //To keep chat container scrolled at bottom//
                    $("#chatbox-main").scrollTop($("#chatbox-main")[0].scrollHeight + 100);
                }, 300);
            });
            //End//

            // add a message to the conversation when a user disconnects or leaves chat//
            socket.on('user:left', function (data) {
                $scope.messages.push({
                    user: '',
                    text: 'User ' + data.name + ' has left.'
                });

                for (var i = 0; i < $scope.users.length; i++) { //Delete user details from online users listing//
                    if ($scope.users[i].id === data.id) {
                        $scope.users.splice(i, 1);
                        break;
                    }
                }
            });
            //End of Group Chat (Message Broadcast to every user)//

            //Individual Chat (Send Message to a specific user)//
            //Open personal chat window when clicks on user's name from online list//
            $scope.personalChat = function (socketId, name, userid) {
                if ($scope.userid == userid) //Do nothing if user clicks on own name//
                    return false;
                for (var a in $scope.chatWindows) //Do not open new if a window is already open for a user//
                {
                    if ($scope.chatWindows[a].userid == userid)
                    {
                        return false;
                    }
                }
                
                if (Object.keys($scope.chatWindows).length > 2) { //To maintain array of three users chat//
                    $scope.chatWindows[0] = $scope.chatWindows[1];
                    $scope.chatWindows[1] = $scope.chatWindows[2];
                    delete $scope.chatWindows[2];
                }
                
                var chatLen = Object.keys($scope.chatWindows).length;
                $scope.chatWindows[chatLen] = {socketId: socketId, name: name, userid: userid, privateMessages: []};
                
                $http.post('/getMessage', {clientFrom: $scope.authentication[0].id, clientTo: userid}).success(function (response) {
                    //$scope.chatWindows[chatLen].privateMessages = response.data;
                    for(var a in response.data)
                    {
                        if(response.data[a].from_id == $scope.authentication[0].id)
                        {
                            response.data[a].user = 'Me';
                        }
                        delete response.data[a].from_id;
                        if (response.data[a].image == null || response.data[a].image == '') //To set the user image//
                        {
                            response.data[a].image = "/modules/core/images/default-pic.jpg";
                        } else {
                            response.data[a].image = '/images/profile_images/' + response.data[a].image;
                        }
                        $scope.chatWindows[chatLen].privateMessages.push(response.data[a]);
                    }
                    //$scope.chatWindows[chatLen].privateMessages = response.data;
                    
                if (!(userid in chatList)) //if new user, push new entry in chat list array with 0 messages//
                {
                    chatList[userid] = {socketId: socketId, name: name, userid: userid, privateMessages: response.data};
                } else { //if chat happened before then show old messages//
                    for (var a in chatList[userid].privateMessages)
                    {
                        $scope.chatWindows[chatLen].privateMessages.push(chatList[userid].privateMessages[a]);
                    }
                }
                setTimeout(function () { //To keep chat container scrolled at bottom//
                    $(".userChatBox-"+chatLen).scrollTop($(".userChatBox-"+chatLen)[0].scrollHeight + 100);
                }, 300);
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
                
                //$scope.chatWindows[Object.keys($scope.chatWindows).length].socketId = socketId; //Allot socket id to communicate//
                //$scope.chatWindows[Object.keys($scope.chatWindows).length].name = name; //to show user's name on chat window with whom user chat's//
                //$scope.chatWindows[socketId] = {name: name};
            };

            $scope.closeWindow = function (index) {
                delete $scope.chatWindows[index]; //Remove a chat window from chat window array//
                var newVar = {};
                var i = 0;
                for (var a in $scope.chatWindows) //Rearrange array as index 0, 1.. //
                {
                    newVar[i] = $scope.chatWindows[a];
                    i++;
                }
                $scope.chatWindows = newVar;
            }

            //Send message to the server//
            $scope.sendPrivateMessage = function (index, socketId, userid) {
                if (!$('#msgText-' + index).val()) //do nothing if nothing entered in message box//
                    return false;

                socket.emit('privateMessage', {//Send message to server//
                    message: $('#msgText-' + index).val(), //message//
                    socketId: socketId, //socket id of user to with communicate//
                    userid: userid,
                });
                
                //Add message to personal chat array//
                $scope.chatWindows[index].privateMessages.push({
                    user: 'me',
                    text: $('#msgText-' + index).val(),
                    image: $scope.image,
                    date: new Date()
                });
                chatList[userid].privateMessages.push({
                    user: 'me',
                    text: $('#msgText-' + index).val(),
                    image: $scope.image,
                    date: new Date()
                });
                $http.post('/pushMessage', {client: $scope.authentication[0].id, clientNext: userid, message: $('#msgText-' + index).val()}).success(function (response) {
                    console.log(response);
                }).error(function (response) {
                    $scope.error = response.message[0];
                });
                $('#msgText-' + index).val('');
                setTimeout(function () { //To keep chat container scrolled at bottom//
                    $(".userChatBox-"+index).scrollTop($(".userChatBox-"+index)[0].scrollHeight + 100);
                }, 300);
            };

            //Receive message from server if anyone messages me personally//
            socket.on('receive:privateMessage', function (data) {
                if (!(data.userid in chatList)) //if chat didn't happen before//
                {
                    $http.post('/getMessage', {clientFrom: $scope.authentication[0].id, clientTo: data.userid}).success(function (response) {
                        for(var a in response.data)
                        {
                            if(response.data[a].from_id == $scope.authentication[0].id)
                            {
                                response.data[a].user = 'Me';
                            }
                            delete response.data[a].from_id;
                            if (response.data[a].image == null || response.data[a].image == '') //To set the user image//
                            {
                                response.data[a].image = "/modules/core/images/default-pic.jpg";
                            } else {
                                response.data[a].image = '/images/profile_images/' + response.data[a].image;
                            }
                        }
                        $scope.chatWindows[Object.keys($scope.chatWindows).length] = { //push new entry in chat window array with 0 messages//
                            socketId: data.socketId,
                            name: data.user,
                            userid: data.userid,
                            privateMessages: response.data
                        };
                        chatList[data.userid] = { //push new entry in chat list array with 0 messages//
                            socketId: data.socketId,
                            name: data.user,
                            userid: data.userid,
                            privateMessages: response.data
                        };
                        chatList[data.userid].privateMessages.push(data); //push new message in chat list//
                        var i = 0;
                        for (var a in $scope.chatWindows)//push new message in chat window list//
                        {
                            if ($scope.chatWindows[a].userid == data.userid)
                            {
                                //$scope.chatWindows[a].privateMessages.push(data);
                                if($scope.chatWindows[a].socketId != data.socketId) //to update socket id if any user refreshes web page//
                                {
                                    $scope.chatWindows[a].socketId = data.socketId;
                                    chatList[data.userid].socketId = data.socketId;
                                }
                                setTimeout(function () { //To keep chat container scrolled at bottom//
                                    $(".userChatBox-"+i).scrollTop($(".userChatBox-"+i)[0].scrollHeight + 100);
                                }, 300);
                                break;
                            }
                            i++;
                        }
                        delete data.socketId;
                    }).error(function (response) {
                        $scope.error = response.message[0];
                    });  
                } else {
                    chatList[data.userid].privateMessages.push(data); //push new message in chat list//
                    var i = 0;
                    for (var a in $scope.chatWindows)//push new message in chat window list//
                    {
                        if ($scope.chatWindows[a].userid == data.userid)
                        {
                            $scope.chatWindows[a].privateMessages.push(data);
                            if($scope.chatWindows[a].socketId != data.socketId) //to update socket id if any user refreshes web page//
                            {
                                $scope.chatWindows[a].socketId = data.socketId;
                                chatList[data.userid].socketId = data.socketId;
                            }
                            setTimeout(function () { //To keep chat container scrolled at bottom//
                                $(".userChatBox-"+i).scrollTop($(".userChatBox-"+i)[0].scrollHeight + 100);
                            }, 300);
                            break;
                        }
                        i++;
                    }
                    delete data.socketId;
                }
            });
        //End of Individual Chat (Send Message to a specific user)//
        } else {
            $scope.signInVal = "Sign in to chat";
        }
    }
]);

