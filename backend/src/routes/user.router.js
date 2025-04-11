import express from 'express';
const router=express.Router();
import {userAuth, verifyJWT} from '../middleware/userAuth.js';
import { getUserData } from '../controller/user.controller.js';
// import { verifyJWT } from '../middleware/verifyJWT.js';

router.get('/getUser/:id', verifyJWT, getUserData);

export default router;