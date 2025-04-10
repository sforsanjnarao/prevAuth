import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
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
        minlength: 8
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
    refreshToken: [String]
})
userSchema.methods.generateAuthToken = function () {
    const accesstoken = jwt.sign(
      { _id: this._id },
      process.env.ACCESS_SECRET_KEY,
      {
        expiresIn: "10s",
      }
    );
    const refreshtoken = jwt.sign(
      { _id: this._id },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );
  
    const tokens = { accesstoken: accesstoken, refreshtoken: refreshtoken };
    return tokens;
  };
  

const userModel = mongoose.model.user || mongoose.model('User', userSchema);

export default userModel;
// exports.User = User;
