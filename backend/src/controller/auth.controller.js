import bcrypt from 'bcryptjs';
import userModel from '../module/user.model.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodeMailer.js';
import { tryCatch } from '../utils/tryCatch.js';
import AppError from '../utils/AppError.js';
import {LoginUser, RegisterUser} from '../services/service.js';
 

export const registerUser = async (req, res) => {
    const {name,email,password } = req.body;
    if (!name ||!email ||!password) return res.status(400).json({success:false, msg: 'Please enter all fields' });
    
        const existingUser = await userModel.findOne({ email:email });
        
        if (existingUser)  {
            throw new AppError(
                409,
                "Email already exists in the database!",
                409
            )
        }
        // const salt = await bcrypt.genSalt(10);
        // const hashed = await bcrypt.hash(password, salt);
        
        // const user =new userModel({ name, email, password:hashed });
        
        
        // await user.save();
        try {
            const { accessToken, refreshToken, userId } = await RegisterUser(name, email, password);

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                maxAge: 15 * 60 * 1000, // 15 min
              });
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Account Activation',
            text: `Welcome to our website! Your account has been created with email ID: ${email}.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            msg: 'User registered successfully',
            accessToken: accessToken,
            refreshToken: refreshToken,
            userId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

export const loginUser = tryCatch(async (req, res) => {
    const { email, password } = req.body;
    const cookies = req.cookies;
  
    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "Please enter all fields" });
    }
  
    // 2. Find the user
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(404, "User not found in the database!", 404);
    }
  
    // 3. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError(401, "Incorrect password! Please try again.", 401);
    }
  
    // 4. Handle refresh token logic
    let refreshTokenFromCookie = cookies?.jwt;
    let newRefreshTokenArray = [];
  
    if (refreshTokenFromCookie) {
      // Check if the refresh token exists in DB
      const tokenExists = await userModel.findOne({ refreshToken: refreshTokenFromCookie });
  
      if (!tokenExists) {
        // Token is invalid or reused by attacker
        res.clearCookie("jwt", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.status(403).json({ success: false, msg: "Potential refresh token reuse detected!" });
      }
  
      // Remove the old token from user's refreshToken array
      newRefreshTokenArray = user.refreshToken.filter((token) => token !== refreshTokenFromCookie);
    }
  
    // 5. Generate new tokens (access + refresh)
    const { accesstoken, refreshtoken } = user.generateAuthToken();
  
    // 6. Save new refresh token in DB
    user.refreshToken = [...newRefreshTokenArray, refreshtoken];
    await user.save();
    res.cookie('access_token', accesstoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });
  
    // 7. Send new refresh token in cookie
    res.cookie("jwt", refreshtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  
    // 8. Send access token in response body
    return res.status(200).json({
      success: true,
      msg: "User logged in successfully",
      accessToken: accesstoken,
      refreshToken: refreshtoken,
      userId: user._id, // send any extra info you want
    });
  });

export const logoutUser = tryCatch(
    async (req, res) => {
        try{
            const cookies=req.cookies;
            if(!cookies?.jwt) return res.send.status(204);
            const refreshToken=cookies.jwt;
            //is refresh token in db?
            const foundUser=await userModel.findOne({ refreshToken: refreshToken });

            if(!foundUser){
                res.clearCookie('access_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                });


                res.clearCookie('jwt',{
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
                });
                return res.status(200).json({ success: true, msg: 'User logged out successfully' });
            }

            //delete refresh token from db
            foundUser.refreshToken=foundUser.refreshToken.filter(token=>token!==refreshToken);
            await foundUser.save();

            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            });

            res.clearCookie('jwt',{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
            });
            return res.json({ success: true, msg: 'User logged out successfully' });
        }catch (error) {
            console.error(error.message);
            res.status(500).send({success:false, msg: 'Server error'  });
        }
    }
)

// Send verification OTP to user's registered email address 
export const sendVerifyOtp = async (req, res) => {
    try{
        const userId=req.user.id; //userId can we found from or stored in token 
        const user = await userModel.findById(userId);
        if(!user) return res.status(400).json({msg: 'User not found' });
        
        if(user.isAccountVerified) return res.status(400).json({msg: 'Account already verified' });
        
        const otp=String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now() + 24*60*60*1000;

        
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject: 'Verify OTP',
            text:  `Your verification code is: ${otp}. `
            
        }
        await transporter.sendMail(mailOptions);
        await user.save();
        return res.json({success:true, msg: 'OTP sent successfully' });
    }catch(error){
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

// Verify email using OTP
export const verifyEmail = async (req, res) => {
    const userId=req.user?.id;
    const {otp}=req.body //userId can we found from or stored in token 
    console.log(userId, otp);
    if(!userId || !otp) return res.status(400).json({success:'false',msg: 'Please enter all fields' });

    try{
        const user = await userModel.findById(userId);
        if(!user) return res.status(400).json({success:false, msg: 'User not found' });
        console.log(user.verifyOtp)

        // Check if OTP matches
        if(user.verifyOtp!== String(otp) ) return res.status(400).json({msg: 'Incorrect OTP' });
    

        // Check if OTP is expired
        if(user.verifyOtpExpireAt < Date.now()) return res.status(400).json({msg: 'OTP expired' });
        
        user.isAccountVerified=true;
        user.verifyOtp=''; 
        user.verifyOtpExpireAt=0;

        await user.save();

        return res.json({success:true, msg: 'Account verified successfully' });
    }catch(error){
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

//check if user is authenticated before sending data to client side
export const isAuthenticated = async (req, res) => {
    try{
        return res.json({success:true, msg: 'User authenticated' });
    }catch(error){
        console.error(error.message);
        return res.json({success:false, msg: 'Server error'  });
    }
}


//send password reset OTP to user's registered email address 
export const sendResetOtp = async (req, res) => {
    const {email}=req.body;
    if(!email) return res.status(400).json({success:false, msg: 'Please enter email' });
    try{
        const user= await userModel.findOne({email});
        if(!user) return res.status(400).json({msg: 'User not found' });

        const otp=String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now() + 15*60*1000;

        
        const mailOptions={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject: 'password Reset OTP',
            text:  `your password reset code is: ${otp}. `
            
        }
        await transporter.sendMail(mailOptions);
        await user.save();
        return res.json({success:true, msg: 'OTP sent successfully' });

    }catch(error){
        console.error(error.message);
        return res.status(500).send({success:false, msg: 'Server error'  });
    }
}

// Reset password 
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword}=req.body;
    if(!email || !otp || !newPassword) return res.status(400).json({success:false, msg: 'Please enter all fields' });
    try{
        const user= await userModel.findOne({email});
        if(!user) return res.status(400).json({msg: 'User not found' });
        if(user.resetOtp==''||user.resetOtp!== String(otp) ) return res.status(400).json({msg: 'Incorrect OTP' });
        if(user.resetOtpExpireAt < Date.now()) return res.status(400).json({msg: 'OTP expired' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        user.password=hashed;
        user.resetOtp=''; 
        user.resetOtpExpireAt=0;

        await user.save();
        return res.json({success:true, msg: 'Password reset successfully' });
    }catch(error){
        console.error(error.message);
        return res.status(500).send({success:false, msg: 'Server error'  });
    }
}

export const refreshToken=tryCatch(async (req, res) => {
    const cookies=req.cookies;
    if(!cookies?.jwt) return res.status(401).json({msg: 'No token, authorization denied' });
    const refreshToken=cookies.jwt;
    res.clearCookie('jwt',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
    })

    const foundUser=await userModel.findOne({ refreshToken: refreshToken });
    if(!foundUser){
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err,decode) => {
                if(err) return res.status(403).json({msg: 'Token is not valid, authorization denied' }); //forbidden
                const hackedUser=await userModel.findOne({username: decode._id});
                hackedUser.refreshToken=[]
                const result=await hackedUser.save();
            }
        )
        return res.status(403).json({msg: 'Token is not valid, authorization denied' });
    }
    const newRefreshTokenArray=foundUser.refreshToken.filter(token=>token!==refreshToken);

    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err,decode) => {
            if(err){
                foundUser.refreshToken=[...newRefreshTokenArray];
                const result=await foundUser.save();
            }
            if(err||foundUser._id.toString()!==decode._id){
                return res.status(403).json({msg: 'Token is not valid111111111, authorization denied' });
            }
            //refreshToken still valid
            const accessToken=jwt.sign(
                {id: foundUser._id},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            const newRefreshToken=jwt.sign(
                {id: foundUser._id},
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            foundUser.refreshtoken = [...newRefreshTokenArray, newRefreshToken];
            const result=await foundUser.save();
            res.cookie("jwt", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
                maxAge: 24 * 60 * 60  * 1000, // 1 days
            });
            return res.json({ success: true, accessToken, msg: 'Token refreshed successfully' });
            
        }
    )

})


 