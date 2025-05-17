const tasks= require('../models/taskSchema');
const projects= require('../models/projectSchema');
const automation= require('../models/automationSchema');

const createTask=async(req,res)=>{
    try{
        const {title,description,status,priority,assignedTo,dueDate,projectId}=req.body;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        const isMember=project.owner.toString()===req.user.userId.toString() || project.members.includes(req.user.userId);
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }

        const task=await tasks.create({
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            assignedTo: assignedTo || req.user.userId,
            dueDate: new Date(dueDate),
            projectId
        });

        const automationData=await automation.find({
            project:projectId,
            'trigger.type':'assignedTo',
            status:'Active'
        });

        for(const auto of automationData){
            if(auto.trigger.condition.assignedId===task.assignedTo.toString() && auto.action.type==='Status Change'){
                task.status=auto.action.value;
                await task.save();
                break;
            }
        }

        res.status(201).json({
            success: true,
            message:"Task created successfully",
            task: task
        });
    }
    catch(error){
        console.error('Task creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const getTasksByProject=async(req,res)=>{
    try{
        const projectId=req.params.projectId;
        const project=await projects.findById(projectId);
        if(!project){
            return res.status(404).json({
                success: false,
                message:"Project not found"
            });
        }
        const isMember=project.owner.toString()===req.user.userId.toString() || project.members.includes(req.user.userId);
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }
        const tasksList=await tasks.find({projectId}).populate('assignedTo','name email').populate('projectId','title description');
        res.status(200).json({
            success: true,
            message:"Tasks fetched successfully",
            tasks: tasksList
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateTaskStatus=async(req,res)=>{
    try{
        const {status}=req.body;
        const taskId=req.params.taskId;
        const task=await tasks.findById(taskId);
        if(!task){
            return res.status(404).json({
                success: false,
                message:"Task not found"
            });
        }
        const project=await projects.findById(task.projectId);
        const isMember=project.owner.toString()===req.user.userId.toString() || project.members.includes(req.user.userId);
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }

        task.status=status;
        await task.save();

        const automationData=await automation.find({
            project:task.projectId,
            'trigger.type':'Status Change',
            status:'Active'
        });

        for(const auto of automationData){
            if(auto.trigger.condition.status===status && auto.action.type==='Status Change'){
                task.status=auto.action.value;
                await task.save();
                break;
            }
        }

        res.status(200).json({
            success: true,
            message:"Task status updated successfully",
            task: task
        });
    }
    catch(error){
        console.error('Task status update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const updateTask=async(req,res)=>{
    try{
        const taskId=req.params.taskId;
        const task=await tasks.findById(taskId);
        if(!task){
            return res.status(404).json({
                success: false,
                message:"Task not found"
            });
        }
        const project=await projects.findById(task.projectId);
        const isMember=project.owner.toString()===req.user.userId.toString() || project.members.includes(req.user.userId);
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }

        const updatedTask=await tasks.findByIdAndUpdate(
            taskId,
            {
                ...req.body,
                dueDate: req.body.dueDate ? new Date(req.body.dueDate) : task.dueDate
            },
            {new:true}
        );

        if(!updatedTask){
            return res.status(404).json({
                success: false,
                message:"Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message:"Task updated successfully",
            task: updatedTask
        });
    }
    catch(error){
        console.error('Task update error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const deleteTask=async(req,res)=>{
    try{
        const taskId=req.params.taskId;
        const task=await tasks.findById(taskId);
        if(!task){
            return res.status(404).json({
                success: false,
                message:"Task not found"
            });
        }
        const project=await projects.findById(task.projectId);
        const isMember=project.owner.toString()===req.user.userId.toString() || project.members.includes(req.user.userId);
        if(!isMember){
            return res.status(403).json({
                success: false,
                message:"You are not a member of this project"
            });
        }
        await tasks.findByIdAndDelete(taskId);
        res.status(200).json({
            success: true,
            message:"Task deleted successfully"
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
    createTask,
    getTasksByProject,
    updateTaskStatus,
    updateTask,
    deleteTask
}