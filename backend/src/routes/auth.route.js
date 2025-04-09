import express from 'express';
const router=express.Router();
import userAuth from '../middleware/userAuth.js';


import { registerUser, loginUser, logoutUser,sendVerifyOtp,verifyEmail } from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-verify-otp',userAuth,sendVerifyOtp );
router.post('/verify-email',userAuth,verifyEmail );





export default router;