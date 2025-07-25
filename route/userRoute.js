const express = require("express");
const {
  signupUser,
  getAllUsers,
  deleteUser,
  getUserCount
} = require("../controller/userController");
const userController = require('../controller/userController');

const userRouter = express.Router();


userRouter.post("/signup", signupUser);

userRouter.get("/getall", getAllUsers);

// Route to delete a user by userId
userRouter.delete("/delete/:id", deleteUser);

userRouter.get('/count', userController.getUserCount);

module.exports = userRouter;
