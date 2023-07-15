const mongoose = require('mongoose');

const post = new mongoose.Schema({
    title: {type: String, required: true}, 
    body: {type: String, required: true},
    image: {type: String, required: true},
    user: {type: String, required: true}
})

const postModel = mongoose.model("Post", post);

module.exports = postModel;