import { Router } from "express";
import { googleAuth, googleLogin } from "../controllers/controller.js";

const router = Router();
router.get('/google', googleAuth);
router.get('/google/callback', googleLogin); 

export default router;