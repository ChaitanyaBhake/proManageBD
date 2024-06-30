const Task = require('../model/task.model');
const moment = require('moment');

//Create Task Controller
exports.createTask = async (req, res) => {
  const {
    title,
    priority,
    dueDate,
    checkLists,
    createdAt,
    status,
    assigned_to_email,
  } = req.body;

  // Required Fields Validation
  if (!title || !priority || !checkLists) {
    return res.status(400).json({
      success: false,
      error: 'PLease fill all the required fields.',
    });
  }

  // At least one checklist is required to create task
  if (checkLists.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'PLease fill at least one check list',
    });
  }

  // Create Task
  try {
    const task = await Task.create({
      title,
      status,
      priority,
      checkLists,
      dueDate,
      createdAt,
      createdBy: req.user.id,
      assigned_to_email: assigned_to_email || '',
      assignedBy: req.user.id,
    });

    // Return Response
    res.status(200).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error. Please try again later.',
    });
  }
};

// Fetch tasks of LoggedIn User based on Today,Week,Month
exports.getTasks = async (req, res) => {
  try {
    // Extract query parameters from the request
    const reqQuery = req.query;

    // Retrieve user information from auth payload
    const userId = req.user.id;
    const email = req.user.email;

    // Database query to find tasks of authenticated user
    let dbQuery = Task.find({
      $or: [
        { createdBy: userId }, // Tasks created by the user
        { assigned_to_email: email }, // Tasks assigned to the user by email
      ],
    }).populate('assignedBy', 'name email'); // Populate the 'assignedBy' field to show who assigned the task

    // Get the current date and time in UTC and set it to the end of the current day
    const today = moment.utc().endOf('day');

    // Default date range is 7 days
    let range = 7;

    // If a range is provided in the query parameters, use that value instead
    if (reqQuery.range) {
      range = parseInt(reqQuery.range, 10);
    }

    // Adjust the database query to filter tasks created within the specified date range
    dbQuery = dbQuery
      .where('createdAt')
      .lte(today.toDate())
      .gt(today.clone().subtract(range, 'days').toDate());

    // Execute the database query and store the result in 'tasks'
    const tasks = await dbQuery;

    // Send the response with the status and the retrieved tasks
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: 'An error occurred while retrieving tasks.',
    });
  }
};

// Get Single Task Details
exports.getSingleTask = async (req, res) => {
  try {
    //Get Data
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    //Validate Data
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task Not Found',
      });
    }

    //Return Response
    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update Task
exports.updateSingleTask = async (req, res) => {
  try {
    // Get Data
    const { taskId } = req.params;
    const { title, priority, dueDate, checkLists, status, assigned_to_email } =
      req.body;

    // Find the task by ID and update it 
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        $or: [
          { createdBy: req.user.id },  // Condition: Task can be updated by either  creator of the task  OR
          { assigned_to_email: req.user.email }, // user to whom task is assigned
        ],
      },
      {
        title,
        priority,
        dueDate,
        checkLists,
        status,
        assigned_to_email,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task Not Found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task: updatedTask },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};

//Delete Task
exports.deleteSingleTask = async (req, res) => {
  try {
    // Get Data
    const { taskId } = req.params;

    // Validate Data
    if (!taskId) {
      return res.status(402).json({
        success: false,
        error: 'Please provide a valid task id',
      });
    }

    // Delete Task only if user is creator of task
    const task = await Task.findOneAndDelete({
      _id: taskId,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task Not Found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};
