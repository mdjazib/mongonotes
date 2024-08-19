const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://mjxdex:uOibdIPthMiGLi89@cluster0.7aue8.mongodb.net/mongonotes?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const userModel = new Schema({
    uid: Number,
    name: String,
    email: String,
    password: String
});

module.exports = mongoose.model("user", userModel);