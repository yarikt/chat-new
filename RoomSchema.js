const mongoose = require("mongoose");
var room_schema = new mongoose.Schema({
  name: String,
  secretKey: String,
});

const Room = {};

module.exports = Room;
