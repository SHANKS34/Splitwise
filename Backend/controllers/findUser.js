import UserModel from "../model/userModel.js";
export const findUser = async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId) {
            return res.status(400).json({ message: "Email ID is required" });
        }
        const user = await UserModel.findOne({ email: emailId });

        if (user) {
            return res.status(200).json({ 
                message: "User found", 
                user: user 
            });
        } else {
           
            return res.status(404).json({ 
                message: "No user found with this email" 
            });
        }

    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};