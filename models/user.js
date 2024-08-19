const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/mongonotes')

const Schema = mongoose.Schema;

const userModel = new Schema({
    uid: Number,
    name: String,
    email: String,
    password: String
});

module.exports = mongoose.model("user", userModel);