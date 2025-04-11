import userModel from "../module/user.model.js";
import { tryCatch } from '../utils/tryCatch.js';



export const getUserData=tryCatch(async (req, res) => {
  const userId = req.params.id;
  const foundUser = await userModel.findOne({ _id: userId });

  const data = {
    userEmail: foundUser.email,
  };

  res.status(200).json(data).end();
});
