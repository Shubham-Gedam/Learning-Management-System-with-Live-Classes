import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({

    email:{
        type: String,
        required:[true, "Email is required for user registration"],
        trim: true,
        lowercase: true,
        unique: [true, "Email already exists, please use a different email address"],
        match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Please provide a valid email address"]
    },
    name:{
        type: String,
        required:[true, "Name is required for user registration"],
    },
    password:{
        type: String,
        required:[true, "Password is required for user registration"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role:{
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },
    isVerified:{
        type: Boolean,
        default: false
    }
 
},{
    timestamps: true
})

userSchema.pre("save", async function(){

    if(!this.isModified("password")) {
        return 
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;

    return 
    
})

userSchema.methods.comparePassword = async function(password){

    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

export default userModel;


