const mongoose = require('mongoose');

// Create Schema
const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        role: {
          type: String,
          enum: ['user', 'agent', 'seller'],
          default: 'user'
        },
        password: {
            type: String
        }
    },
    { strict: false }
);

const User = mongoose.model("users", UserSchema);
module.exports = User;