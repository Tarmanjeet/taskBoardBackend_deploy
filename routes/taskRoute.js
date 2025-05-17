const express=require("express");
const taskRouter=express.Router();
const {createTask,getTasksByProject,updateTaskStatus,updateTask,deleteTask}=require("../controllers/taskController");
const { verifyToken } = require("../middleware/authMiddleware");

taskRouter.use(verifyToken);

taskRouter.post("/create",createTask);
taskRouter.get("/getTasksByProject/:projectId",getTasksByProject);
taskRouter.patch("/updateTaskStatus/:taskId",updateTaskStatus);
taskRouter.patch("/updateTask/:taskId",updateTask);
taskRouter.delete("/deleteTask/:taskId",deleteTask);

module.exports=taskRouter;