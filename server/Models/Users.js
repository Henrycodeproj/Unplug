import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:String,
    email: {
        type:String,
        required:true,
        unique:true
    },
    isVerified:Boolean,
    sessionToken:String
}, {timestamps:true})

const UserModel = mongoose.model("Users", UserSchema)

export default UserModel
