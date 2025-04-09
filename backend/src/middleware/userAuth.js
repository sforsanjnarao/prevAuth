import jwt from 'jsonwebtoken';

const userAuth=async(req, res, next) => {
    const token=req.cookies.token;
    if(!token) return res.status(401).json({msg: 'Not authorized, token is required',success: false  });

    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.id) req.body.userId=decoded.id;
        else return res.status(401).json({msg: 'Not authorized, token is not valid', success: false  });
        next();
    }catch(error){
        res.status(401).json({msg: 'Token is invalid', success: false  });
    }
}

export default userAuth;