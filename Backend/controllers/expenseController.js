import ExpenseModel from "../model/expensesModel.js"; 
import GroupModel from "../model/groupModel.js";

export const addExpense = async (req, res) => {
    try {
        const { description, amount, group, paidBy, splitType, splits } = req.body;

        console.log("Adding Expense:", { description, amount, paidBy });

        if (!description || !amount || !group || !paidBy || !splits) {
             return res.status(400).json({ message: "Missing required fields" });
        }

        const groupDoc = await GroupModel.findById(group);
        if (!groupDoc) {
            return res.status(404).json({ message: "Group not found" });
        }

        const newExpense = await ExpenseModel.create({
            description,
            amount,
            group,
            paidBy,
            splitType,
            splits
        });


        const ensureTransactionNode = (userId) => {
            let node = groupDoc.transactions.find(t => t.user.toString() === userId.toString());
            if (!node) {
                groupDoc.transactions.push({ user: userId, moneyRelation: [] });
                node = groupDoc.transactions.find(t => t.user.toString() === userId.toString());
            }
            return node;
        };

        const ensureRelation = (node, targetUserId) => {
            let relation = node.moneyRelation.find(r => r.user.toString() === targetUserId.toString());
            if (!relation) {
                node.moneyRelation.push({ user: targetUserId, amount: 0 });
                relation = node.moneyRelation.find(r => r.user.toString() === targetUserId.toString());
            }
            return relation;
        };

        for (const split of splits) {
            const borrowerId = split.user.toString();
            const payerId = paidBy.toString();
            const splitAmount = Number(split.amount);

            if (borrowerId === payerId) continue;
        
            const payerBal = groupDoc.balances.find(b => b.user.toString() === payerId);
            if (payerBal) payerBal.amount += splitAmount;

            const borrowerBal = groupDoc.balances.find(b => b.user.toString() === borrowerId);
            if (borrowerBal) borrowerBal.amount -= splitAmount;

            const payerNode = ensureTransactionNode(payerId);
            const relationFromPayer = ensureRelation(payerNode, borrowerId);
            relationFromPayer.amount += splitAmount;

            const borrowerNode = ensureTransactionNode(borrowerId);
            const relationFromBorrower = ensureRelation(borrowerNode, payerId);
            relationFromBorrower.amount -= splitAmount;
        }
        await groupDoc.save();

        res.status(201).json({
            message: "Expense added, balances and transactions updated",
            expense: newExpense
        });

    } catch (error) {
        console.error("Add Expense Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}