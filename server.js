const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { encrypt, decrypt } = require("./utils/cryptography.js");
const Cryptr = require("cryptr");
const Room = require("./RoomSchema");
const bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
const cryptr = new Cryptr(
  "56dce7276d2b0a24e032beedf0473d743dbacf92aafe898e5a0f8d9898c9eae80a73798beed53489e8dbfd94191c1f28dc58cad12321d8150b93a2e092a744265fd214d7c2ef079e2f01b6d06319b7b2"
);

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const geoip = require('geoip-lite');
const publicIP = require('./utils/ip');
const lookup = require('country-code-lookup');
//Setting static folder
app.use(express.static(path.join(__dirname, "public")));
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded
const botName = "System";

//RUn when client connects

io.on("connection", (socket) => {
  let ip = socket.handshake.headers["x-forwarded-for"] || socket.conn.remoteAddress;
  
  let countryCode = '--';
  if (ip != '::1') {
    const result = geoip.lookup(ip);
    const country = result ? result.country : undefined;

    countryCode = country ? lookup.byIso(country).iso2 : '--';
  }



  socket.on("joinRoom", async ({ username, room }) => {
    username += ` (${countryCode})`;
    const user = userJoin(socket.id, username, room, countryCode);

    socket.join(user.room);

    const history = Room[user.room] ? Room[user.room].history : [];
    if (Room[user.room]) Room[user.room].memberCount++;

    socket.emit(
      "message",
      formatMessage(botName, cryptr.encrypt("Welcome To Room " + room))
    );

    for (let message of history) {
      socket.emit(
        "message",
        message
      );
    }

    //When user enters a chat room
    //Broadcast will show the prompt to all folks in chat room other than user itself
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has entered the chat room`)
        )
      );

    //Send room and users info

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    const formattedMessage = formatMessage(user.username, msg, user.color);

    if (Room[user.room] && Room[user.room].history){ 
      Room[user.room].history.push(formattedMessage);
    }

    io.to(user.room).emit("message", formattedMessage);
  });

  //When user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      if (Room[user.room]) { 
        Room[user.room].memberCount-- 
        if (Room[user.room].memberCount <= 0) {
          Room[user.room].history = [];
        }
      };

      //io.emit will show the prompt to all folks in chat room including the user itself
      io.to(user.room).emit(
        "message",
        formatMessage(
          botName,
          cryptr.encrypt(`${user.username} has left the chat`)
        )
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// ROUTES

app.get("/decrypt", (req, res) => {
  message = req.query.message;
  decrypted = cryptr.decrypt(message);

  res.json(decrypted);
});

app.get("/encrypt", (req, res) => {
  message = req.query.message;
  encrypted = cryptr.encrypt(message);
  res.json(encrypted);
});

app.post("/validate", async (req, res) => {
  let ip = req.ip;
  if (ip == '::1') {
    ip = publicIP();
  }

  let countryCode = '--';
  if (ip != '::1') {
    const result = geoip.lookup(ip);
    const country = result ? result.country : undefined;

    countryCode = country ? lookup.byIso(country).iso2 : '--';
  }


  let username = req.body["username"];
  const roomName = req.body["room"];
  let key = req.body.key || '*';

  username += ` (${countryCode})`;

  let room = Room[roomName]

  if (!room) {
    const secretKey = await bcrypt.hash(key, 10);
    room = {
      name: roomName,
      secretKey,
      _id: new mongoose.Types.ObjectId(),
      history: [],
      memberCount: 0
    };
    Room[roomName] = room
  }


  try {
    if (await bcrypt.compare(key, room.secretKey)) {
      rn = room.name;
      usern = username;
      url = '/' + room.name;
      res.redirect(url); // User not Found
    } else res.redirect("wrong-password.html"); // Incorrect Password
  } catch (ex) {
    res.redirect("wrong-password.html"); // unknown error
  }

});

const PORT = process.env.PORT || 5000;

app.get('/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});



server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// setTimeout(() => {
//   process.exit(0);
// }, 300000);