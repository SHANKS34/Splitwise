import GroupModel from "../model/groupModel.js";
import UserModel from "../model/userModel.js";
import ExpenseModel from "../model/expensesModel.js";
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await GroupModel.findById(groupId)
            .populate('members', 'name email profilePicture userId'); // Get member details

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // TODO: In the future, we will calculate total 'amount' from Expenses here
        // For now, returning 0
        const totalAmount = await ExpenseModel.findById(groupId)
        .populate('group' ,'amount'); 
        
        
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
        const { userId } = req.params; // We will pass UUID in the URL

        // 1. Find the User's internal _id using their UUID
        const user = await UserModel.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Find groups where this user is a member
        // .populate() replaces the ID with actual user data (name, picture)
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
        const { name, members, userId } = req.body; // 'userId' is the creator's UUID

        if (!name || !userId) {
            return res.status(400).json({ message: "Group name and Creator ID are required" });
        }

        // 1. Find the Creator in DB using their UUID
        const creator = await UserModel.findOne({ userId: userId });
        if (!creator) {
            return res.status(404).json({ message: "Creator not found" });
        }

        // 2. Prepare list of UUIDs to find (Members + Creator)
        let memberUUIDs = Array.isArray(members) ? members : [];
        if (!memberUUIDs.includes(userId)) {
            memberUUIDs.push(userId);
        }

        // 3. Find ALL users by their UUIDs
        // We use 'userId' here because that is what the frontend sent
        const validUsers = await UserModel.find({ userId: { $in: memberUUIDs } });

        // 4. Extract the internal MongoDB _ids 
        // (We MUST store _id to keep Mongoose relations working)
        const validMemberIds = validUsers.map(user => user._id);

        if (validMemberIds.length === 0) {
             return res.status(400).json({ message: "No valid users found." });
        }

        // 5. Create Group using the ObjectIds
        const newGroup = await GroupModel.create({
            name: name,
            members: validMemberIds, 
            createdBy: creator._id
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