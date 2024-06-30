const User = require('../model/user.model.js');
const Task = require('../model/task.model.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Import bcrypt

//Register User
exports.registerUser = async (req, res) => {
  try {
    // Get Data
    const { email, name, password, confirmPassword } = req.body;

    // Basic Validation
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({
        success: false,
        error:
          'Please provide all required fields: email, name, password, and confirm password.',
      });
    }

    // Password Validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.',
      });
    }

    // User Validation
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        error: 'User already exists.',
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save User to DB
    await newUser.save();

    // Generate JWT Token
    const payload = {
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    };

    // Sign and generate the JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) {
          throw err;
        }

        //Set the token in cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: true,
        });

        //Send Success Response with JWT Token
        res.status(201).json({
          success: true,
          message: 'User registered successfully.',
          data: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

//Login User
exports.loginUser = async (req, res) => {
  try {
    //Get Data
    const { email, password } = req.body;

    //Missing credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    //User Validation
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User does not exist',
      });
    }

    //Password Validation
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    //  Prepare the payload for the JWT token, including user ID and email
    const payload = {
      user: {
        id: user._id,
        email: user.email,
      },
    };

    //Generate the JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) {
          throw err;
        }
        //Send Success Response
        res.status(200).json({
          success: true,
          message: 'User logged in successfully',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: 'Cannot Login User',
    });
  }
};

//LogOut User
exports.logoutUser = async (req, res) => {
  try {
    // Clear the JWT token from the client's cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

//Retrieve User Details
exports.getCurrentUserDetail = async (req, res) => {
  try {
    //Get User
    const user = await User.findById(req.user.id);

    //User Validation
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User does not exist',
      });
    }
    //Return User Details
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        board: user.board,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

//Update User Details
exports.updateUser = async (req, res) => {
  //Get Data
  const { name, email, oldPassword, newPassword } = req.body;

  // Validation
  if (!name && !email && !oldPassword && !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Please provide at least one field to update',
    });
  }

  // Validation for Both Password Fields are Filled
  if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both old password and new password',
    });
  }

  try {
    // Find Existing User Details
    const user = await User.findById(req.user.id);

    // Check if User Exists
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User does not exist',
      });
    }

    // Check Old Password is Valid
    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(403).json({
          success: false,
          error: 'Old password is incorrect',
        });
      }
    }

    // Hash New Password and Update Password
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    // Update Name and Email
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    // Save Updated User Details
    await user.save();

    // Return Response
    return res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

// Retrieve User Analytics Data
exports.getUserAnalytics = async (req, res) => {
  // Find tasks created by the current user
  const createdTasks = await Task.find({ createdBy: req.user.id });

  // Find tasks assigned to the current user based on email
  const assignedTasks = await Task.find({ assigned_to_email: req.user.email });

  // Initial status object
  const status = {
    backlog: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  // Initial priorities object
  const priorities = {
    low: 0,
    high: 0,
    moderate: 0,
    due: 0,
  };

  // Helper function to update status and priorities
  const updateStatusAndPriorities = (task) => {
    status[task.status]++;
    priorities[task.priority]++;
    if (task.isExpired) {
      priorities.due++;
    }
  };

  // Only update status and priorities for tasks that have an assigned email that is not empty
  createdTasks.forEach((task) => {
    if (
      task.assigned_to_email !== undefined &&
      task.assigned_to_email !== null
    ) {
      updateStatusAndPriorities(task);
    }
  });

  // Update status and priorities for tasks that have created by user
  assignedTasks.forEach((task) => {
    updateStatusAndPriorities(task);
  });

  // Return Response
  res.status(200).json({
    status: 'success',
    data: { status, priorities },
  });
};

exports.addEmailToUserBoard = async (req, res) => {
  try {
    // Get Data
    const { email } = req.body;
    const user = await User.findById(req.user.id);

    // User Validation
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the email already exists in the user's board array
    if (user.board.includes(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email already added in your board',
      });
    }

    // Add email to the user's board array
    user.board.push(email);
    await user.save();

    //Return Response
    res.status(200).json({
      success: true,
      message: 'Email added to user board successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};
