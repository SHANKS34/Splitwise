import { Router } from "express";
import { googleAuth, googleLogin } from "../controllers/controller.js";

const router = Router();

// Route 1: START - The frontend calls this to start the process
// This will redirect the user to Google
router.get('/google', googleAuth);

// Route 2: FINISH - Google calls this automatically after login
// This URL must match what you set in Google Cloud Console
router.get('/google/callback', googleLogin); 

export default router;