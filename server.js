const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
//Utils files:
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
//Set up Express app:
const app = express();
//Create http server:
const server = http.createServer(app);
//Connect server to Socket.io
const io = socketio(server);
const PORT = process.env.PORT;
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'Botsworth';
//Run when client connects:
io.on('connection', socket => {
    //Catch joinRoom event coming from main.js:
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //Welcome current user:
        socket.emit('message', formatMessage(botName, 'Welcome to Chat_App!'));
        //Broadcast when user connects:
        socket.broadcast
            .to(user.room)
            .emit(
                'message', 
                formatMessage(botName, `${username} has joined the chat...`)
            );
            //Send users and room info:
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
    });
    //Listen for chatMessage:
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    //Runs when client disconnects:
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(botName, `${user.username} has left the chat...`)
            );
            //Send users and room info:
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        } 
    });
});



/* ------------------------------------ - ----------------------------------- */
server.listen(PORT, () => console.log(`Server running on ${PORT}`));