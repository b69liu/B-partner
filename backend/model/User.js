const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    username: String,
    password: String,
    role: String
});

const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;