const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://mjxdex:uOibdIPthMiGLi89@cluster0.7aue8.mongodb.net/mongonotes?retryWrites=true&w=majority&appName=Cluster0')

const Schema = mongoose.Schema;

const notes = new Schema({
    uid: Number,
    nid: Number,
    title: String,
    description: String,
    createdAt: {
        type: String,
        default: () => new Date().toLocaleString()
    }
});

module.exports = mongoose.model("note", notes);