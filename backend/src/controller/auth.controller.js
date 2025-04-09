import bcrypt from 'bcryptjs';
import userModel from '../module/user.model.js';
import jwt from 'jsonwebtoken';

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
        const token =jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7' });
        res.cookie('token', token, {
              
             httpOnly: true,
             secure: process.env.NODE_ENV === 'production',
             sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',
             maxAge: 7*24*60*60*1000,
             })

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
             expiresIn: '1h',
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

