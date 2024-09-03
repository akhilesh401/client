const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a model based on the schema
const UserModel = mongoose.model('User', userSchema);
console.log(UserModel)
module.exports = UserModel;
