import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    // 1. ADD THIS FIELD
    userId: {
        type: String,
        required: true,
        unique: true 
    },
    googleId: {
        type: String,
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    profilePicture: { 
        type: String
    }
});

const UserModel = mongoose.model('Users', UserSchema);
export default UserModel;