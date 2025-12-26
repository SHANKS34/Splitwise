import { Router } from "express";
import { findUser } from "../controllers/findUser.js";
import { createGroup , getUserGroups , getGroupDetails } from "../controllers/groupController.js"; 
import { addExpense } from "../controllers/expenseController.js";

const router = Router();

router.post('/findUser', findUser);
router.get('/groups/:userId', getUserGroups);
router.post('/createGroup', createGroup); 
router.get('/group/:groupId', getGroupDetails);
router.post('/addExpense', addExpense);
export default router;