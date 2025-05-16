const tasks= require('../models/taskSchema');
const projects= require('../models/projectSchema');
const automation= require('../models/automationSchema');


const createTask=async(req,res)=>{
    try{
        const {title,description,status,priority,assignedTo,dueDate,projectId}=req.body;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({message:"Project not found"});
        }
        const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
        if(!isMember){
            return res.status(403).json({message:"You are not a member of this project"});
        }
        const task=await tasks.create({
            title,
            description,
            status,
            priority,
            assignedTo,
            dueDate,
            projectId
        })
        const automationData=await automation.find({
            project:projectId,
            'trigger.type':'assignedTo',
            status:'Active'
        })
        for(const auto of automationData){
            if(auto.trigger.condition.assignedId==assignedId && auto.action.type=='Status Change'){
                task.status=auto.action.value;
                await task.save();
                break;
            }
        }
        res.status(201).json.send({message:"Task created successfully",task});
    }
    catch(error){
        res.status(500).json.send({message:error.message});
    }
    }

    const getTasksByProject=async(req,res)=>{
        try{
            const projectId=req.params.projectId;
            const project=await projects.findById(projectId);
            if(!project){
                return res.status(404).json({message:"Project not found"});
            }
            const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
            if(!isMember){
                return res.status(403).json({message:"You are not a member of this project"});
            }
            const tasksList=await tasks.find({projectId}).populate('assignedTo','name email').populate('projectId','title description');
            if(tasksList.length===0){
                return res.status(404).json.send({message:"No tasks found"},tasksList);
            }
            res.status(200).json.send({message:"Tasks fetched successfully",tasks:tasksList});
        }
        catch(error){
            res.status(500).json({message:error.message});
        }
    }

    const updateTaskStatus=async(req,res)=>{
        try{
            const {status}=req.body;
            const taskId=req.params.taskId;
            const task=await tasks.findById(taskId);
            if(!task){
                return res.status(404).json({message:"Task not found"});
            }
            const project=await projects.findById(task.projectId);
            const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
            if(!isMember){
                return res.status(403).json({message:"You are not a member of this project"});
            }
            task.status=status;
            await task.save();
            const automationData=await automation.find({
                project:task.projectId,
                'trigger.type':'Status Change',
                status:'Active'
            })
            for(const auto of automationData){
                if(auto.trigger.condition.status==status && auto.action.type=='Status Change'){
                    task.status=auto.action.value;
                    await task.save();
                    break;
                }
            }
            res.status(200).json.send({message:"Task status updated successfully",task});
        }
        catch(error){
            res.status(500).json({message:error.message});
        }
    }

    const updateTask=async(req,res)=>{
        try{
            const taskId=req.params.taskId;
            const task=await tasks.findById(taskId);
            if(!task){
                return res.status(404).json({message:"Task not found"});
            }
            const project=await projects.findById(task.projectId);
            const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
            if(!isMember){
                return res.status(403).json({message:"You are not a member of this project"});
            }
            const updatedTask=await tasks.findByIdAndUpdate(taskId,req.body,{new:true});
            if(!updatedTask){
                return res.status(404).json({message:"Task not found"});
            }
            await updatedTask.save();
            res.status(200).json.send({message:"Task updated successfully",task:updatedTask});
        }
        catch(error){
            res.status(500).json({message:error.message});
        }
    }

    const deleteTask=async(req,res)=>{
        try{
            const taskId=req.params.taskId;
            const task=await tasks.findById(taskId);
            if(!task){
                return res.status(404).json({message:"Task not found"});
            }
            const project=await projects.findById(task.projectId);
            const isMember=project.owner.toString()===req.user._id.toString() || project.members.includes(req.user._id.toString());
            if(!isMember){
                return res.status(403).json({message:"You are not a member of this project"});
            }
            await tasks.findByIdAndDelete(taskId);
            res.status(200).json.send({message:"Task deleted successfully"});
        }
        catch(error){
            res.status(500).json({message:error.message});
        }
    }


    module.exports={
        createTask,
        getTasksByProject,
        updateTaskStatus,
        updateTask,
        deleteTask
    }