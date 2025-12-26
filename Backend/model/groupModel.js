import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    },
    balances: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users',
            required: true
        },
        amount: { 
            type: Number, 
            default: 0 
        }
    }],

    transactions: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users', 
            required: true 
        },
        moneyRelation: [{
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Users', 
                required: true 
            }, 
            amount: { 
                type: Number, 
                default: 0 
            } 
        }]
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const GroupModel = mongoose.model('Groups', GroupSchema);
export default GroupModel;