import mongoose from "mongoose";

// EX JSON.
//  {"name": "John Doe", "email": "johnnyboy@gmail.com", "password":"password1"}
const userSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: [true, 'User\'s first name is required.'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    lastName: {
        type: String, 
        required: [true, 'User\'s last name is required.'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    email: {
        type: String, 
        required: [true, 'User\'s Email is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address.'],
    },
    password: {
        type: String,
        required: [true, 'User\'s password is required.'],
        minLength: 6,
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;