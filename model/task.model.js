const mongoose = require('mongoose');

// Schema for individual checklist items within a task
const checkListSchema = new mongoose.Schema({
  checked: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

// Main task schema definition
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ['high', 'moderate', 'low'],
    },

    dueDate: { type: Date },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    assigned_to_email: {
      type: String,
      default: '',
    },

    checkLists: {
      type: [checkListSchema],
      required: true,
    },

    status: {
      type: String,
      enum: ['backlog', 'inProgress', 'todo', 'done'],
      default: 'todo',
    },

    shared_with: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    // Options for converting document to JSON and object
    toJSON: { virtuals: true }, // Include virtual properties when converting to JSON
    toObject: { virtuals: true }, // Include virtual properties when converting to object
  }
);

// Virtual property to check if task is expired based on dueDate
taskSchema.virtual('isExpired').get(function () {
  if (!this.dueDate) {
    return false;
  }

  return new Date() > this.dueDate;
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
