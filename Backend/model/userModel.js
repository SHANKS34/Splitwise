import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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