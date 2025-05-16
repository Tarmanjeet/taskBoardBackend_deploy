const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const users=require("../models/userSchema");

let registerUser=async(req,res)=>{
    let body=req.body;
    let existingUser=await users.findOne({email:body.email});
    if(existingUser && Object.keys(existingUser).length){
        return res.status(400).json({success:false,message:"User already exists"});
    }
    const salt=await bcrypt.genSalt(10);
    let newUser={
        name:body.name,
        email:body.email,
        password:await bcrypt.hash(body.password,salt),
        image:body.image,
    }
    await users.insertOne(newUser);
    return res.status(200).json({success:true,message:"User registered successfully"});

}

const loginUser=async(req,res)=>{
    let {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({success:false,message:"Email and password are required"});
    }
    query={
        email:req.body.email
    }
    const user=await users.findOne(query);
    if(!user){
        return res.status(400).json({success:false,message:"User not found"});
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({success:false,message:"Invalid credentials"});
    }
    const payLoad={
        userId:user._id,
        name:user.name,
        email:user.email,
    }
    const tokenSecret=process.env.token_secret;
    jwt.sign(payLoad,tokenSecret,{expiresIn:3600},
        (err,token)=>{
            if(err){
                return res.status(500).json({success:false,message:"Internal server erroe"});
            }
            res.json({success:true,message:"User Logged in successfully",token:token});
        }
    )
}

module.exports={
    registerUser,
    loginUser
}