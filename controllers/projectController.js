const projects=require("../models/projectSchema");
const users=require("../models/userSchema");
const tasks=require("../models/taskSchema");
const automation=require("../models/automationSchema");

const createProject=async(req,res)=>{
    try{
        const {title, description, members=[]} = req.body;
        
        const owner = req.user.userId;
        
        if (!owner) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in token"
            });
        }

        const allMembers = members.includes(owner) ? members : [...members, owner];

        const newProject = await projects.create({
            title,
            description,
            owner,
            members: allMembers
        });

        await users.findByIdAndUpdate(owner, {
            $push: { projects: newProject._id }
        });

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project: newProject
        });
    }
    catch(error){
        console.error('Project creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create project"
        });
    }
}

const addMemberToProject=async(req,res)=>{
    try{
        const {memberId}=req.body;
        const project=await projects.findById(req.params.projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        if(project.owner.toString()!==req.user.userId.toString()){
            return res.status(403).json({
                success: false,
                message:"You are not authorized to add members to this project"
            });
        }
        if(project.members.includes(memberId)){
            return res.status(400).json({
                success: false,
                message:"Member already exists in the project"
            });
        }
        project.members.push(memberId);
        await project.save();
        res.status(200).json({
            success: true,
            message:"Member added successfully",
            project: project
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getProjects=async(req,res)=>{
    try{
        const userId=req.user.userId;
        const projectsList=await projects.find({
            $or:[
                {owner:userId},
                {members:userId}
            ]
        }).populate('owner','name email').populate('members','name email');
        res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            projects: projectsList
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getProjectById=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId).populate('owner','name email').populate('members','name email');
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }

        const userId = req.user.userId.toString();
        const ownerId = project.owner._id.toString();
        const memberIds = project.members.map(member => member._id.toString());

        const isMember = ownerId === userId || memberIds.includes(userId);
        
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }

        res.status(200).json({
            success: true,
            message:"Project fetched successfully",
            project: project
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateProject=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        if(project.owner.toString()!==req.user.userId.toString()){
            return res.status(403).json({
                success: false,
                message:"You are not authorized to update this project"
            });
        }
        const updatedProject=await projects.findByIdAndUpdate(
            req.params.projectId,
            req.body,
            {new:true}
        );
        res.status(200).json({
            success: true,
            message:"Project updated successfully",
            project: updatedProject
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const deleteProject=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        if(project.owner.toString()!==req.user.userId.toString()){
            return res.status(403).json({
                success: false,
                message:"You are not authorized to delete this project"
            });
        }
        await tasks.deleteMany({projectId:req.params.projectId});
        await automation.deleteMany({project:req.params.projectId});
        await projects.findByIdAndDelete(req.params.projectId);
        res.status(200).json({
            success: true,
            message:"Project deleted successfully"
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const removeMemberFromProject=async(req,res)=>{
    try{
        const {memberId}=req.body;
        const project=await projects.findById(req.params.projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        if(project.owner.toString()!==req.user.userId.toString()){
            return res.status(403).json({
                success: false,
                message:"You are not authorized to remove members from this project"
            });
        }
        if(!project.members.includes(memberId)){
            return res.status(400).json({
                success: false,
                message:"Member does not exist in the project"
            });
        }
        project.members=project.members.filter(member=>member.toString()!==memberId);
        await project.save();
        res.status(200).json({
            success: true,
            message:"Member removed successfully",
            project: project
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports={
    createProject,
    addMemberToProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    removeMemberFromProject
}