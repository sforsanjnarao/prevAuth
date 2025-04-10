import express from 'express';
const router=express.Router();
import {userAuth} from '../middleware/userAuth.js';
import { getUserData } from '../controller/user.controller.js';
import {userAuth} from '../middleware/userAuth.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

router.get('/data', userAuth, getUserData);

export default router;