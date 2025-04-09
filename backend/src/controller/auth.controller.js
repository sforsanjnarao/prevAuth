import bcrypt from 'bcryptjs';
import userModel from '../module/user.model.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodeMailer.js';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name ||!email ||!password) return res.status(400).json({success:false, msg: 'Please enter all fields' });
    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) return res.status(400).json({ msg: 'User already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const user =new userModel({ name, email, password:hashed });
        

        await user.save();
        const token =jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
              
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
             maxAge: 7*24*60*60*1000,
             })


             const mailOptains={
                from:process.env.SENDER_EMAIL,
                to:email,
                subject: 'Account Activation',
                text:  `welcome to our website, Your account has been created with the email id: ${email}. `
             }
             await transporter.sendMail(mailOptains);


        res.json({ msg: 'User registered successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email ||!password) return res.status(400).json({ success:false, msg: 'Please enter all fields' });
    try{
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
             maxAge: 7*24*60*60*1000,
             })
             return res.json({ success: true, msg: 'User logged in successfully' });
    }catch (error) {
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error'  });
    }
}

export const logoutUser = async (req, res) => {
    try{
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

        
        const mailOptains={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject: 'Verify OTP',
            text:  `Your verification code is: ${otp}. `
            
        }
        await transporter.sendMail(mailOptains);
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

        
        const mailOptains={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject: 'password Reset OTP',
            text:  `your password reset code is: ${otp}. `
            
        }
        await transporter.sendMail(mailOptains);
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