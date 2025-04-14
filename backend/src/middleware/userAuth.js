import jwt from 'jsonwebtoken';

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



export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1].trim();

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
