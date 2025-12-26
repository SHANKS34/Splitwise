import { oauth2client } from "../utils/googleConfig.js";
import UserModel from "../model/userModel.js";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const googleAuth = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const authorizationUrl = oauth2client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
        redirect_uri: 'http://localhost:8080/auth/google/callback'
    });
    res.redirect(authorizationUrl);
};

export const googleLogin = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ message: "Authorization code is missing." });

        const { tokens } = await oauth2client.getToken(code);
        oauth2client.setCredentials(tokens); 

        const ticket = await oauth2client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture, sub: googleId } = ticket.getPayload();

        let user = await UserModel.findOne({ email: email });
        
        if (!user) {
            const newUserId = uuidv4(); 
            
            user = await UserModel.create({ 
                userId: newUserId,
                googleId, 
                email, 
                name, 
                profilePicture: picture 
            });
        }

        const appToken = jwt.sign(
            { 
                _id: user._id,     
                userId: user.userId, 
                email: user.email,
                name: user.name,
                picture: user.profilePicture,
                googleId: user.googleId
            }, 
            process.env.JWT_SECRET,                 
            { expiresIn: process.env.JWT_EXPIRES_IN }                    
        );

        res.redirect(`http://localhost:5173?token=${appToken}`);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
}