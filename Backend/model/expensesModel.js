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
    
    // Which group does this expense belong to?
    group: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Groups',
        required: true
    },

    // Who actually paid the bill? (The Creditor)
    paidBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users',
        required: true
    },

    // Enum for the UI to know how to display it later
    splitType: {
        type: String,
        enum: ['EQUAL', 'EXACT', 'PERCENTAGE'], // [cite: 12-15]
        default: 'EQUAL'
    },

    // The breakdown of who owes what (The Debtors)
    splits: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Users' 
        },
        amount: { 
            type: Number, 
            required: true // The calculated amount this person owes
        },
        // Optional: Store the raw input for history (e.g., "50" for 50%)
        percentage: { type: Number }, 
    }]
});

const ExpenseModel = mongoose.model('Expenses', ExpenseSchema);
export default ExpenseModel