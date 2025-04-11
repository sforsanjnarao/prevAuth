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
            const response=await RegisterUser(email, password); //we need to see this
            const accessToken=response.token.accesstoken;
            const refreshToken = response.token.refreshtoken;
        // const token =jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('jwt', refreshToken, {
              
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
             maxAge: 24*60*60*1000,
             })


             const mailOptions={
                from:process.env.SENDER_EMAIL,
                to:email,
                subject: 'Account Activation',
                text:  `welcome to our website, Your account has been created with the email id: ${email}. `
             }
             await transporter.sendMail(mailOptions);


        return res.status(201).json({accessToken:accessToken, msg: 'User registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

export const loginUser = tryCatch(
    async (req, res) => {
        const cookies=req.cookies
        const { email, password } = req.body;
        if (!email ||!password) return res.status(400).json({ success:false, msg: 'Please enter all fields' });
       
            const user = await userModel.findOne({ email:email });
            if (!user)  {
                throw new AppError(
                    404,
                    "User not found in the database!",
                    404
                )
            }
    
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword)  {
                throw new AppError(
                    401,
                    "Incorrect password! Please double-check your password and try again.",
                    401
                )
            }
            try{
             let newRefreshTokenArray="";
             let refreshToken=''

             // Check if user has an existing refresh token
             if(!cookies?.jwt){
                refreshToken=user.refreshToken
             }else{
                refreshToken=cookies.jwt
                const foundToken=await userModel.findOne({ refreshToken: refreshToken }).exec();

                if(!foundToken){
                    console.log('attempted refresh token reuse at login')
                    // If the token is not found in the database, clear out the cookie
                    res.clearCookie('jwt',{
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
                    });
                    return res.status(403).json({ success: false, msg: "Potential refresh token reuse!" });
                }
             }
             const response=await LoginUser(user, newRefreshTokenArray); //din't make this line till now
             const accessToken=response.token.accesstoken;

             //what is this profilePic doing?
             const profilePic = response.profilePic;

                    

    
            //// Send refresh token as HttpOnly cookie
            res.cookie('jwt', refreshToken, {
                 httpOnly: true,
                 secure: process.env.NODE_ENV === 'production',
                 sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
                 maxAge: 24*60*60*1000,
                 })
                 return res.status(200)
                 .json({
                     accessToken: accessToken, // send to frontend via response body
                     success: true, 
                     msg: 'User logged in successfully'
                 });
        }catch (error) {
            console.error(error.message);
            res.status(500).send({success:false, msg: 'Server error'  });
        }
    }
)

export const logoutUser = tryCatch(
    async (req, res) => {
        try{
            const cookies=req.cookies;
            if(!cookies?.jwt) return res.send.status(204);
            const refreshToken=cookies.jwt;
            //is refresh token in db?
            const foundUser=await userModel.findOne({ refreshToken: refreshToken });

            if(!foundUser){
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
            res.clearCookie('token',{
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
            if(err||foundUser._id.toString()!==decode.id){
                return res.status(403).json({msg: 'Token is not valid, authorization denied' });
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


 