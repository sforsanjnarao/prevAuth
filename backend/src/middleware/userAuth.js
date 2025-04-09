import jwt from 'jsonwebtoken';

const userAuth=async(req, res, next) => {
    const token=req.cookies.token;

    if(!token) return res.status(401).json({msg: 'Not authorized, token is required',success: false  });

    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
 
        if (!decoded?.id) {
            return res.status(401).json({ msg: 'Token is not valid', success: false });
          }
          
      
          req.user= decoded;

        next();
    }catch(error){
        res.status(401).json({msg: 'Token is invalid lala',error, success: false  });
    }
}

export default userAuth;