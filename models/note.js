const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/mongonotes')

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