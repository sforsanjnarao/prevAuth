import express from 'express';
const router=express.Router();
import {verifyJWT} from '../middleware/userAuth.js';
// import { verifyJWT } from '../middleware/verifyJWT.js';


import { registerUser, loginUser, logoutUser,sendVerifyOtp,verifyEmail,isAuthenticated,sendResetOtp,resetPassword, refreshToken } from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout',verifyJWT, logoutUser);
router.post('/send-verify-otp', verifyJWT,sendVerifyOtp );
router.post('/verify-email', verifyJWT,verifyEmail );
router.post('/is-auth', verifyJWT,isAuthenticated);
router.post('/send-reset-otp',sendResetOtp);
router.post('/reset-password',resetPassword);
router.get('/refresh-token', refreshToken);









export default router;