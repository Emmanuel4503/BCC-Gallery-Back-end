const User = require('../model/userModel');


const signupUser = async (req, res) => {
    try {
      console.log('Signup request received:', req.body); 
      
      const { name } = req.body;
      
  
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: "Name is required and cannot be empty" 
        });
      }
  
   
      const newUser = new User({ name: name.trim() });
      await newUser.save();
      
      console.log('User created successfully:', newUser);
      
      res.status(201).json({
        message: "User created successfully",
        userId: newUser.userId,
        user: {
          _id: newUser._id,
          name: newUser.name,
          userId: newUser.userId,
          createdAt: newUser.createdAt
        }
      });
      
    } catch (err) {
      console.error('Signup error:', err); 
      
     
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationErrors 
        });
      }
      
   
      res.status(500).json({ 
        error: "Failed to create user", 
        details: err.message 
      });
    }
  };


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-_id userId name'); 
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findOneAndDelete({ userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signupUser,
  getAllUsers,
  deleteUser,
  getUserCount
};
