const mongoose = require("mongoose");
const validator =require ("validator");


const userOtpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not Valid Email")
            }
        }
    },
    otp:{
        type:String,
        required:true
    }
});

const userotp=new mongoose.model("userotps",userOtpSchema);
module.exports=userotp;







// const mongoose = require("mongoose");
// const validator = require("validator");

// const userOtpSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, "Email is required"],
//     unique: true,
//     lowercase: true,
//     validate: {
//       validator: validator.isEmail, // ✅ Uses validator.js built-in function
//       message: "Invalid email format",
//     },
//   },
//   otp: {
//     type: String,
//     required: true,
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now, 
//     expires: 300, // OTP expires in 5 minutes
//   },
// });

// const UserOtp = mongoose.model("UserOtp", userOtpSchema);
// module.exports = UserOtp;
