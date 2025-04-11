import bcrypt from "bcryptjs";
import userModel from '../module/user.model.js'
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

//Upon successful authentication, it calls a service function to generate new access and refresh tokens and retrieves the user’s profile picture.
const LoginUser=async (user, newRefreshTokenArray) => {
  const token =user.generateAuthToken();
  user.refreshToken=[...newRefreshTokenArray,token.refreshToken]
  await user.save();
  const data={
    token:token,
    userId:user._id,
  }
  return data;
};

const RegisterUser=async (email, password) => {
  const newUser=new userModel({
    email:email,
    password:password,
    refreshToken: '',
  });
  const salt = await bcrypt.genSalt(10);
newUser.password = await bcrypt.hash(newUser.password, salt);

const token =newUser.generateAuthToken();
newUser.refreshToken=[token.refreshToken]

await newUser.save();

const data={
  token:token,
  userId:newUser._id,
}
return data;
}



export { LoginUser,RegisterUser };


// import { signUp, signIn } from './authController.js'; // Add .js if it's a local file