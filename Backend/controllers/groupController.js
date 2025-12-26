import GroupModel from "../model/groupModel.js";
import UserModel from "../model/userModel.js";
import ExpenseModel from "../model/expensesModel.js";
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await GroupModel.findById(groupId)
            .populate('members', 'name email profilePicture userId'); 

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const expenses = await ExpenseModel.find({ group: groupId });
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
        res.status(200).json({ 
            group: group,
            totalAmount: totalAmount 
        });

    } catch (error) {
        console.error("Group Details Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const groups = await GroupModel.find({ members: user._id })
            .populate('members', 'name email profilePicture userId')
            .populate('createdBy', 'name');

        res.status(200).json({ 
            message: "Groups fetched", 
            groups: groups 
        });

    } catch (error) {
        console.error("Fetch Groups Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { name, members, userId } = req.body; 

        if (!name || !userId) {
            return res.status(400).json({ message: "Group name and Creator ID are required" });
        }

        const creator = await UserModel.findOne({ userId: userId });
        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        let memberUUIDs = Array.isArray(members) ? members : [];
        if (!memberUUIDs.includes(userId)) {
            memberUUIDs.push(userId);
        }

        const validUsers = await UserModel.find({ userId: { $in: memberUUIDs } });

        
        const validMemberIds = validUsers.map(user => user._id);

        if (validMemberIds.length === 0) {
             return res.status(400).json({ message: "No valid users found." });
        }
        const initialBalances = validMemberIds.map(memberId => ({
            user: memberId,
            amount: 0
        }));

        const newGroup = await GroupModel.create({
            name: name,
            members: validMemberIds, 
            createdBy: creator._id,
            balances:initialBalances
        });

        res.status(201).json({ 
            message: "Group created successfully", 
            group: newGroup 
        });

    } catch (error) {
        console.error("Create Group Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};