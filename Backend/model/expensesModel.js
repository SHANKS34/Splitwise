import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    description: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    
    group: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Groups',
        required: true
    },

    paidBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users',
        required: true
    },

    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
        default: 'EQUAL'
    },

    splits: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users' 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        percentage: { type: Number }, 
    }]
});

const ExpenseModel = mongoose.model('Expenses', ExpenseSchema);
export default ExpenseModel;