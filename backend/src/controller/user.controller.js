import userModel from "../module/user.model.js";


export const getUserData=async (req,res)=>{
    try{
        const userId=req.user.id;  //userId can we found from or stored in token 
        if(!userId) return res.status(401).json({msg: 'Not authorized', success: false  });
        
        const user=await userModel.findById(userId);
        if(!user) return res.status(404).json({msg: 'User not found' });

        res.json({sucess:true,userData:{name:user.name, email:user.email, isAccountVerified:user.isAccountVerified }})
    }catch(error){
        console.error(error.message);
        res.status(500).send({success:false, msg: 'Server error' });
    }
}