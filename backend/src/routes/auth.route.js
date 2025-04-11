import express from 'express';
const router=express.Router();
import {userAuth} from '../middleware/userAuth.js';
// import { verifyJWT } from '../middleware/verifyJWT.js';


import { registerUser, loginUser, logoutUser,sendVerifyOtp,verifyEmail,isAuthenticated,sendResetOtp,resetPassword } from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-verify-otp',userAuth,sendVerifyOtp );
router.post('/verify-email',userAuth,verifyEmail );
router.post('/is-auth',userAuth,isAuthenticated);
router.post('/send-reset-otp',sendResetOtp);
router.post('/reset-password',resetPassword);








export default router;