import { google } from 'googleapis';
import 'dotenv/config';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
console.log("Client ID" , GOOGLE_CLIENT_ID)

export const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:8080/auth/google/callback' 
);