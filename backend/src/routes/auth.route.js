import express from 'express';
const router=express.Router();
import userAuth from '../middleware/userAuth.js';


import { registerUser, loginUser, logoutUser,sendVerifyOtp,verifyEmail,isAuthenticated } from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-verify-otp',userAuth,sendVerifyOtp );
router.post('/verify-email',userAuth,verifyEmail );
router.get('/is-auth',userAuth,isAuthenticated);







export default router;