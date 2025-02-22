const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const UserOtp = require("../models/UserOtp");
const nodemailer = require("nodemailer");
const validator = require("validator");
require("dotenv").config();

// 🔹 Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// User Login
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: "Username and Password are required", status: false });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: "Invalid Username or Password", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ msg: "Invalid Username or Password", status: false });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ status: true, user: userWithoutPassword });

  } catch (error) {
    next(error);
  }
};

//User Registration
module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required", status: false });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format", status: false });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(409).json({ msg: "Username already in use", status: false });

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(409).json({ msg: "Email already in use", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ status: true, user: userWithoutPassword });

  } catch (error) {
    next(error);
  }
};

// Get All Users (excluding requester)
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select("email username avatarImage _id");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Set Avatar
module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;

    const user = await User.findByIdAndUpdate(userId, { isAvatarImageSet: true, avatarImage }, { new: true });
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json({ isSet: user.isAvatarImageSet, image: user.avatarImage });

  } catch (error) {
    next(error);
  }
};

// User Logout
module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.status(400).json({ msg: "User ID is required" });

    global.onlineUsers.delete(req.params.id);
    res.status(200).send();
    
  } catch (error) {
    next(error);
  }
};

// Send OTP via Email
module.exports.userSendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!validator.isEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "User already registered with this email" });

    const OTP = Math.floor(100000 + Math.random() * 900000);
    
    await UserOtp.findOneAndUpdate(
      { email }, 
      { otp: OTP }, 
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "OTP for Email Verification",
      text: `Your OTP is: ${OTP}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};

// Verify OTP
module.exports.userVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const otpRecord = await UserOtp.findOne({ email });
    if (!otpRecord) return res.status(400).json({ error: "OTP not found" });

    if (otpRecord.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

    await UserOtp.deleteOne({ email });

    res.status(200).json({ success: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};

//Dummy OTP verification function to prevent `undefined`
module.exports.tryOtp = async (req, res) => {
  res.status(200).json({ message: "OTP verification not implemented yet" });
};
