import bcrypt from "bcryptjs";
import userModel from "../module/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//Upon successful authentication, it calls a service function to generate new access and refresh tokens and retrieves the user’s profile picture.
const RegisterUser = async (name, email, password) => {
  const newUser = new userModel({
      name,
      email,
      password
  });

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);

  const { accesstoken, refreshtoken } = newUser.generateAuthToken();

  newUser.refreshToken = refreshtoken;
  await newUser.save();

  return {
      accessToken: accesstoken,
      refreshToken: refreshtoken,
      userId: newUser._id
  };
};
const LoginUser = async (user, newRefreshTokenArray) => {
  const {accesstoken, refreshtoken} = user.generateAuthToken();
  user.refreshToken = [...newRefreshTokenArray, refreshtoken];
  await user.save();
  return {
    accessToken: accesstoken,
    refreshToken: refreshtoken,
    userId: newUser._id
};
};


export { LoginUser, RegisterUser };

// import { signUp, signIn } from './authController.js'; // Add .js if it's a local file
