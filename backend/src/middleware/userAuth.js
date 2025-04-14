

// export const userAuth=async(req, res, next) => {
//     const token=req.cookies.token;

//     if(!token) return res.status(401).json({msg: 'Not authorized, token is required',success: false  });

//     try{
//         const decoded=jwt.verify(token, process.env.JWT_SECRET);
//         console.log(decoded);
 
//         if (!decoded?.id) {
//             return res.status(401).json({ msg: 'Token is not valid', success: false });
//           }
          
      
//           req.user= decoded;

//         next();
//     }catch(error){
//         res.status(401).json({msg: 'Token is invalid lala',error, success: false  });
//     }
// }

// export const verifyJWT=(req, res, next) => {
//     const authHeader=req.headers['authorization'];
//     console.log(authHeader)
//     if(!authHeader) return res.status(401).json({msg: 'Not authorized, token is required',success: false  });
//     const token=authHeader.split('Bearer ')[1];
//     console.log(token)
    
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // console.log(decoded)

    //     if(err) return res.status(403).json({msg: 'Token is not valid', success: false });
    //     req.user=decoded;
    //     next();
    // });


//     const decode=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
//     if (!decode?.id) {
//         return res.status(401).json({ msg: 'Token is not valid', success: false });
//       }
//       req.user=decode;
//       next();
// }

// export const protectRoute = (req, res, next) => {
//     let token = null;
  
//     if (req.headers.authorization?.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies.token) {
//       token = req.cookies.token;
//     }
  
//     if (!token) {
//       return res.status(401).json({ success: false, msg: "No token provided" });
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       req.user = decoded;
//       next();
//     } catch (err) {
//       return res.status(403).json({ success: false, msg: "Invalid token" });
//     }
//   };



// export const verifyJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" });
//   }

//   const token = authHeader.split(" ")[1].trim();
//   console.log("token received:", token) // Extract the token after "Bearer"

//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("JWT verification failed:", err.message);
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };







import jwt from 'jsonwebtoken';
import userModel from '../module/user.model.js';// Adjust the path as needed

export const verifyJWT = async (req, res, next) => {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.jwt;

  // Case 1: Access token is present
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log("Access token expired or invalid:", err.message);
    }
  }

  // Case 2: Access token missing or expired, but refresh token exists
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const foundUser = await userModel.findOne({ _id: decodedRefresh._id });

      if (!foundUser || !foundUser.refreshToken.includes(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // 🔁 Refresh Token Rotation
      const newAccessToken = jwt.sign(
        { _id: foundUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { _id: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Remove old refresh token & add new one
      const filteredTokens = foundUser.refreshToken.filter((t) => t !== refreshToken);
      foundUser.refreshToken = [...filteredTokens, newRefreshToken];
      await foundUser.save();

      // Send new cookies
      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      req.user = { _id: foundUser._id };
      return next();

    } catch (err) {
      console.log("Refresh token expired or invalid:", err.message);
      return res.status(403).json({ message: "Unauthorized: Invalid refresh token" });
    }
  }

  // Case 3: No access token, no valid refresh token
  return res.status(401).json({ message: "Unauthorized: No valid token" });
};