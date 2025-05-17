const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const users=require("../models/userSchema");

let registerUser=async(req,res)=>{
    try {
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
        const createdUser = await users.create(newUser);
        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message
        });
    }
}

const loginUser=async(req,res)=>{
    try {
        let {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({success:false,message:"Email and password are required"});
        }
        const user=await users.findOne({email: email});
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
                    return res.status(500).json({success:false,message:"Internal server error"});
                }
                res.json({
                    success:true,
                    message:"User Logged in successfully",
                    token:token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    }
                });
            }
        )
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
}

module.exports={
    registerUser,
    loginUser
}