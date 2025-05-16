const express=require("express");
const projectRouter=express.Router();
const {createProject,addMemberToProject,getProjects,getProjectById,updateProject,deleteProject}=require("../controllers/projectController");

projectRouter.post("/create",createProject);

projectRouter.post("/addMemberToProject/:projectId",addMemberToProject);

projectRouter.get("/getProjects",getProjects);

projectRouter.get("/getProject/:projectId",getProjectById);

projectRouter.patch("/updateProject/:projectId",updateProject);

projectRouter.delete("/deleteProject/:projectId",deleteProject);

module.exports=projectRouter;