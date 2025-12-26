import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' // Links to your User model
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const GroupModel = mongoose.model('Groups', GroupSchema);
export default GroupModel;