const express=require("express");
const bodyParser=require("body-parser");
const dotenv=require("dotenv").config();
const userRouter=require("./routes/userRoute");
const taskRouter=require("./routes/taskRoute");
const projectRouter=require("./routes/projectRoute");
const automationRouter=require("./routes/automationRoute");
const mongoose=require("./database/connection");

const app=express();
app.use(bodyParser.json());
app.use("/user",userRouter);
app.use("/task",taskRouter);
app.use("/project",projectRouter);
app.use("/automation",automationRouter);
app.use("/",(req,res)=>{
    res.status(200).send("Welcome to the Task Management System");
})
app.use((req,res)=>{
    res.status(404).send("Page not found");
})
app.listen(3030,()=>{
    console.log("Server is running on port 3000");
})
