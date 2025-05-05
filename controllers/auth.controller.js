import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";



export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName , email, password } = req.body;
    console.log(req.body);

    // checks if user is in DB LMW
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ firstName, lastName , email, password: hashPassword }],
      { session }
    );

    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        success: true,
        message: "User created",
        data:{
        token,
        userId: newUsers[0]._id, 
        }
      });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
     
     const user = await User.findOne({ email });

     if(!user){
      const error = new Error('No user in our records try checking the email');
      error.statusCode = 404;
      throw error;
     }
    
     const isPasswordValid = await bcrypt.compare(password, user.password);

     if(!isPasswordValid){
      const error = new Error('Password Invalid');
      error.statusCode = 401;
      throw error;
     }

     const token = jwt.sign({userId: user._id }, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN });
     res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data:{
      token,
      user 
      }
    });

  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {};
