const mongoose=require("mongoose");
const objectId = mongoose.Schema.ObjectId;

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
    }
    // projects:[{
    //     type:objectId,
    //     ref:"project"
    // }]
})

module.exports=mongoose.model("user",userSchema)