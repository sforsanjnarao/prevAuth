import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        default: 'user',
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    encryptionSalt: {
        type: String, // Store as Base64 encoded string
        required: true, // Ensure every user has one after implementation
        // select: false // Optional: hide from general user queries if desired
    },
    verifyOtp: {
        type: String,
        default: ''
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOtp:{
        type: String,
        default: ''
    }
    ,
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    refreshToken: [
        {
            type: String,
        }
    ]
},{ timestamps: true })




userSchema.pre('save', async function(next) {
    // Generate encryptionSalt only when the user is new AND salt doesn't exist
    if (this.isNew && !this.encryptionSalt) {
        this.encryptionSalt = crypto.randomBytes(16).toString('base64'); // Generate 16 bytes salt -> Base64
    }

    // Hash password only if it has been modified (or is new)
    // IMPORTANT: Ensure your registration logic handles hashing the 'password' field
    // This hook assumes you are setting the HASHED password to the 'password' field before save
    // If you use bcrypt, the hashing logic should be here or in your controller before calling save
    if (this.isModified('password')) {
        // Example using bcrypt (make sure bcrypt is imported and installed)
         const salt = await bcrypt.genSalt(10);
         this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

userSchema.methods.generateAuthToken = function () {
    const accesstoken = jwt.sign(
      { _id: this._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshtoken = jwt.sign(
      { _id: this._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
  
    return { accesstoken, refreshtoken };
  };
  

const userModel = mongoose.model.User || mongoose.model('User', userSchema);

export default userModel;
// exports.User = User;
