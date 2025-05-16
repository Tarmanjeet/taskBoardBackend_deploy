const mongoose = require('mongoose');

const mongoUrl="mongodb+srv://TaskBoard:ghCw5ZX65OKRmj3H@cluster0.1t3xqzw.mongodb.net/TaskBoard";
mongoose.connect(mongoUrl)
.then(()=>console.log("MongoDB connected"))
.catch((err)=>console.log("MongoDB connection error",err));