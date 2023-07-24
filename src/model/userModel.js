const mongoose = require('mongoose');

const user = new mongoose.Schema({
    email:{type: String, required: true, unique: true},
    name:{type: String, required: true},
    password: {type: String, required: true}
});

const userModel = mongoose.model("User", user)

module.exports = userModel;