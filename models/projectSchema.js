const mongoose = require('mongoose');

const projectSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['To Do','In Progress','Completed'],
        default:'To Do'
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    tasks:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'task'
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})
module.exports=mongoose.model("project",projectSchema);