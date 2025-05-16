const projects=require("../models/projectSchema");
const users=require("../models/userSchema");

const createProject=async(req,res)=>{
    try{
        const {title,description,owner,members}=req.body;
        const newProject=await projects.create({
            title,
            description,
            owner,
            members
        });
        await users.findByIdAndUpdate(owner,{
            $push:{projects:newProject._id}
        })
        res.status(201).json({message:"Project created successfully",project:newProject});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const addMemberToProject=async(req,res)=>{
    try{
        const {email}=req.body;
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        const user=await users.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(project.members.includes(user._id)){
            return res.status(400).json({message:"User is already a member of this project"});
        }
        project.memenbers.push(user._id);
        await project.save();
        user.projects.push(projectId);
        await user.save();
        res.status(200).json({message:"User added to project successfully",project});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const getProjects=async(req,res)=>{
    try{
        const userId=req.user._id;
        const projectsList=await projects.find({
            $or:[
                {owner:userId},
                {members:userId}
            ]
        }).populate('owner','name email').populate('members','name email');
        if(projectsList.length===0){
            return res.status(404).json({message:"No projects found"});
        }
        res.status(200).json({message:"Projects fetched successfully",projects:projectsList});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const getProjectById=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId).populate('owner','name email').populate('members','name email');
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
        if(!isMember){
            return res.status(403).json({message:"You are not a member of this project"});
        }
        res.status(200).json({message:"Project fetched successfully",project});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const updateProject=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        if(project.owner.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"You are not authorized to update this project"});
        }
        const updatedProject=await projects.findByIdAndUpdate(projectId,req.body,{new:true});
        res.status(200).json({message:"Project updated successfully",project:updatedProject});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const deleteProject=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        if(project.owner.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"You are not authorized to delete this project"});
        }
        await projects.findByIdAndDelete(projectId);
        res.status(200).json({message:"Project deleted successfully"});
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

module.exports={
    createProject,
    addMemberToProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
}