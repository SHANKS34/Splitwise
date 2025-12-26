import { Router } from "express";
import { findUser } from "../controllers/findUser.js";
// 1. FIX IMPORT: Import 'createGroup' from the groupController file
import { createGroup , getUserGroups , getGroupDetails } from "../controllers/groupController.js"; 
// (Make sure you are NOT importing it from '../controllers/controller.js')

const router = Router();

router.post('/findUser', findUser);
router.get('/groups/:userId', getUserGroups);
// 2. FIX ROUTE: Connect the route to the 'createGroup' function
router.post('/createGroup', createGroup); 
router.get('/group/:groupId', getGroupDetails);
export default router;