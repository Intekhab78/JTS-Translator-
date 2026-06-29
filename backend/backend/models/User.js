const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        // Optional because Google Auth users won't have a password
        required: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null/undefined values but enforces uniqueness for non-null
    },
    profilePicture: {
        type: String,
        default: "",
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    plan: {
        type: String,
        enum: ['basic', 'advanced', 'stream', 'doc', 'truth'],
        default: 'basic'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
