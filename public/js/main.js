const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const key = document.querySelector(".key");
const userJoin = new Audio('../audio/user-joins.mp3');
const userLeaves = new Audio('../audio/user-leaves.mp3');
const userMessage = new Audio('../audio/user-message.mp3');
const newMessage = new Audio('../audio/new-message.mp3');

//Get username and room from the url

// const { username, room, sk } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

window.onbeforeunload = () => {
  localStorage.removeItem('username');
}

const room = window.location.pathname.split('/')[1];

const username = localStorage.getItem('username');

if (!username) {
  window.location = '/?room=' + room
}

const socket = io();

socket.emit("joinRoom", { username, room });

//Get room users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

const messageCount = 0;

//message from server
socket.on("message", (message) => {


  url = `${window.location.protocol}//${window.location.host}/decrypt?message=` + message.text;
  fetch(url)
    .then((res) => res.json())
    .then((decrypted) => {
      if (message.username == 'System' && decrypted?.toLowerCase().includes('room')) {
        console.log(1);
        userJoin.play();
      } else if (message.username == 'System' && decrypted?.toLowerCase().includes('chat')) {
        console.log(2);
        userLeaves.play();
      }else if (message.username.split(' ')[0] == username) {
        console.log(3);
        userMessage.play()
      } else {
        console.log(4);
        newMessage.play();
      }

      outputMessage({
        username: message.username,
        text: decrypted,
        time: message.time,
        color: message.color || '#7386ff'
      });
    });

  //Put scroll function
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//On message Submission - Submit button press karne ke baad

chatForm.addEventListener("submit", (x) => {
  x.preventDefault();
  const msg = x.target.elements.msg.value; //Get what is written by user in msg

  //Emitting msg to server
  url = `${window.location.protocol}//${window.location.host}/encrypt?message=` + msg;
  fetch(url)
    .then((res) => res.json())
    .then((encrypted) => {
      socket.emit("chatMessage", encrypted);
    });

  //Every time you submit a message, it will clear your input field but
  //keep the cursor their itself(focus)
  x.target.elements.msg.value = "";
  x.target.elements.msg.focus();
});
//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p style="color:${message.color};" class="meta">${message.username} <span>${message.time}</span></p>
    <p></p>
    <p class="text">
        ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
  div.scrollIntoView()
}

//Add room name to DOM

function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users name to DOM

function outputUsers(users) {
  userList.innerHTML = `
        ${users.map((user) => `<li class="user"> ${user.username} <img src="/images/flags/${user.country?.toLowerCase()}.svg" alt="Kiwi standing on oval"></li>`).join("")}

    `;
}
