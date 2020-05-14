//Grab elements from DOM:
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from url:
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

//Join chatroom:
socket.emit('joinRoom', { username, room });

//Get room & users:
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//Catch 'message' coming from backend(server):
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
    //Scroll down on new message:
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit:
chatForm.addEventListener('submit', (e) => {
    //e = event
    e.preventDefault();
    //Get msg text:
    const msg = e.target.elements.msg.value;
    //Emit msg to server:
    socket.emit('chatMessage', msg);
    //Clear input:
    e.target.elements.msg.value = '';
    //Refocus on messag input:
    e.target.elements.msg.focus();
});

//Output message to DOM:
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
};

//Add room name to DOM:
function outputRoomName(room) {
    roomName.innerText = room;
};

//Add user's in room to DOM:
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}