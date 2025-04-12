import bcrypt from "bcryptjs";
import userModel from "../module/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//Upon successful authentication, it calls a service function to generate new access and refresh tokens and retrieves the user’s profile picture.
const RegisterUser = async (email, password) => {
  const key = new mongoose.Types.ObjectId().toHexString();
  const newUser = new userModel({
    email: email,
    password: password,
    refreshToken: "",//not the problem
  });

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  const token = await newUser.generateAuthToken();
 
  newUser.refreshToken = token.refreshtoken;
  console.log(newUser.refreshToken)
  console.log(newUser)

  await newUser.save();

  const data = {
    token: token,  //from 
    userId: newUser._id,
  };
  return data;
};
const LoginUser = async (user, newRefreshTokenArray) => {
  const token = user.generateAuthToken();
  user.refreshToken = [...newRefreshTokenArray, token.refreshtoken];
  await user.save();
  const data = {
    token: token,
    userId: user._id,
  };
  return data;
};


export { LoginUser, RegisterUser };

// import { signUp, signIn } from './authController.js'; // Add .js if it's a local file
