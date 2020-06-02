const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Contacts = mongoose.model("contact", ContactSchema);
